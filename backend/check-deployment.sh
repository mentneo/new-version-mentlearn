#!/bin/bash

# Mentlearn Backend Deployment Check Script
# This script validates your backend configuration before deploying to Render

echo "🔍 Mentlearn Backend - Pre-Deployment Check"
echo "============================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Are you in the backend directory?${NC}"
    exit 1
fi

echo "✅ Found package.json"

# Check Node.js version
NODE_VERSION=$(node -v)
echo "📦 Node.js version: $NODE_VERSION"

# Check npm version
NPM_VERSION=$(npm -v)
echo "📦 npm version: $NPM_VERSION"

# Check if .env file exists
if [ -f ".env" ]; then
    echo "✅ Found .env file"
else
    echo -e "${YELLOW}⚠️  Warning: .env file not found. Create one from .env.example${NC}"
fi

# Check required dependencies
echo ""
echo "🔍 Checking dependencies..."

REQUIRED_DEPS=("express" "cors" "dotenv" "firebase-admin" "helmet" "razorpay" "ws")
MISSING_DEPS=()

for dep in "${REQUIRED_DEPS[@]}"; do
    if grep -q "\"$dep\"" package.json; then
        echo "  ✅ $dep"
    else
        echo -e "  ${RED}❌ $dep (missing)${NC}"
        MISSING_DEPS+=("$dep")
    fi
done

if [ ${#MISSING_DEPS[@]} -ne 0 ]; then
    echo -e "${RED}❌ Missing dependencies. Run: npm install${NC}"
    exit 1
fi

# Check if mongoose is still present (should be removed)
if grep -q "\"mongoose\"" package.json; then
    echo -e "${YELLOW}⚠️  Warning: mongoose is still in package.json but we're using Firebase only${NC}"
fi

# Check if server.js exists
if [ -f "server.js" ]; then
    echo "✅ Found server.js"
else
    echo -e "${RED}❌ Error: server.js not found${NC}"
    exit 1
fi

# Check if razorpayRoutes exists
if [ -f "routes/razorpayRoutes.js" ]; then
    echo "✅ Found routes/razorpayRoutes.js"
else
    echo -e "${RED}❌ Error: routes/razorpayRoutes.js not found${NC}"
    exit 1
fi

# Check if render.yaml exists
if [ -f "render.yaml" ]; then
    echo "✅ Found render.yaml"
else
    echo -e "${YELLOW}⚠️  Warning: render.yaml not found (optional but recommended)${NC}"
fi

# Check environment variables (if .env exists)
if [ -f ".env" ]; then
    echo ""
    echo "🔍 Checking environment variables..."
    
    # Check for required variables
    REQUIRED_VARS=("RAZORPAY_KEY_ID" "RAZORPAY_SECRET")
    FIREBASE_CHECK=false
    
    for var in "${REQUIRED_VARS[@]}"; do
        if grep -q "^$var=" .env; then
            echo "  ✅ $var"
        else
            echo -e "  ${RED}❌ $var (missing)${NC}"
        fi
    done
    
    # Check Firebase credentials (either method)
    if grep -q "^FIREBASE_SERVICE_ACCOUNT_JSON=" .env; then
        echo "  ✅ FIREBASE_SERVICE_ACCOUNT_JSON"
        FIREBASE_CHECK=true
    elif grep -q "^FIREBASE_CREDENTIALS_PATH=" .env; then
        echo "  ✅ FIREBASE_CREDENTIALS_PATH"
        FIREBASE_CHECK=true
    fi
    
    if [ "$FIREBASE_CHECK" = false ]; then
        echo -e "  ${RED}❌ Firebase credentials not configured${NC}"
    fi
    
    if grep -q "^FRONTEND_ORIGIN=" .env; then
        echo "  ✅ FRONTEND_ORIGIN"
    else
        echo -e "  ${YELLOW}⚠️  FRONTEND_ORIGIN not set (will use default)${NC}"
    fi
fi

# Run npm install
echo ""
echo "📦 Installing dependencies..."
npm install --silent

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo -e "${RED}❌ Error: npm install failed${NC}"
    exit 1
fi

# Try to start the server for 3 seconds
echo ""
echo "🚀 Testing server startup..."
PORT=5099 timeout 3s node server.js > /dev/null 2>&1 &
SERVER_PID=$!
sleep 2

# Check if server is running
if ps -p $SERVER_PID > /dev/null; then
    echo "✅ Server starts successfully"
    kill $SERVER_PID 2>/dev/null
else
    echo -e "${YELLOW}⚠️  Server startup test inconclusive (check manually)${NC}"
fi

# Summary
echo ""
echo "============================================"
echo "✅ Pre-deployment check complete!"
echo ""
echo "Next steps:"
echo "1. Review .env file and ensure all variables are set"
echo "2. Test locally: npm start"
echo "3. Push to GitHub: git push origin main"
echo "4. Deploy on Render following RENDER-DEPLOYMENT.md"
echo ""
echo "📖 Full deployment guide: RENDER-DEPLOYMENT.md"
