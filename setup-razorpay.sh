#!/bin/bash

# Mentlearn - Complete Setup Script
# This script sets up both frontend and backend for the Razorpay integration

echo "🚀 Mentlearn - Razorpay Integration Setup"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    echo "   (new-version-mentlearn)"
    exit 1
fi

echo "📦 Step 1: Installing Frontend Dependencies..."
npm install canvas-confetti
if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed"
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

echo ""
echo "📦 Step 2: Installing Backend Dependencies..."
cd backend
npm install
if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi
cd ..

echo ""
echo "✅ Setup Complete!"
echo ""
echo "📝 Next Steps:"
echo "1. Verify your environment variables:"
echo "   - Frontend: Check .env file in project root"
echo "   - Backend: Check backend/.env file"
echo ""
echo "2. Make sure you have:"
echo "   ✓ Firebase service account JSON file"
echo "   ✓ Razorpay API keys (TEST or LIVE)"
echo "   ✓ MongoDB connection string"
echo ""
echo "3. Start the servers:"
echo ""
echo "   Terminal 1 - Backend:"
echo "   $ cd backend && npm start"
echo ""
echo "   Terminal 2 - Frontend:"
echo "   $ npm start"
echo ""
echo "4. Test the integration:"
echo "   - Go to http://localhost:3000/courses"
echo "   - Click 'Buy Now' on any course"
echo "   - Use test card: 4111 1111 1111 1111"
echo ""
echo "📚 Documentation:"
echo "   - Quick Start: RAZORPAY-QUICK-START.md"
echo "   - Full Guide: RAZORPAY-INTEGRATION-GUIDE.md"
echo ""
echo "Happy coding! 🎉"
