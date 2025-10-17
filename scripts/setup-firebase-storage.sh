#!/bin/bash

# Firebase Storage Setup Script
# This script helps you enable Firebase Storage for profile photo uploads

echo "================================================"
echo "Firebase Storage Setup for MentNeo Platform"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}IMPORTANT: Firebase Storage Setup Required${NC}"
echo ""
echo "The profile photo upload feature requires Firebase Storage to be enabled."
echo "Please follow these steps:"
echo ""

echo -e "${GREEN}Step 1: Enable Firebase Storage${NC}"
echo "  1. Open: https://console.firebase.google.com/project/mentor-app-238c6/storage"
echo "  2. Click the 'Get Started' button"
echo "  3. Choose 'Start in production mode'"
echo "  4. Select location: 'us-central' (same as Firestore)"
echo "  5. Click 'Done'"
echo ""

echo -e "${GREEN}Step 2: Deploy Storage Rules${NC}"
echo "  After enabling Storage in the console, run:"
echo "  ${YELLOW}npx firebase deploy --only storage${NC}"
echo ""

echo -e "${GREEN}Step 3: Test Profile Upload${NC}"
echo "  1. Log in as a student"
echo "  2. Go to Profile page"
echo "  3. Click camera icon on profile picture"
echo "  4. Select an image (JPEG, PNG, GIF, or WebP)"
echo "  5. Upload should succeed!"
echo ""

echo "================================================"
echo "What's Been Fixed:"
echo "================================================"
echo "✅ Upload path corrected (users/{userId}/profile/{fileName})"
echo "✅ File validation added (type, size)"
echo "✅ Enhanced error handling"
echo "✅ Storage rules updated with legacy path support"
echo "✅ firebase.json configured for storage"
echo "⏳ Pending: Enable Storage in Firebase Console"
echo ""

# Check if firebase CLI is available
if command -v firebase &> /dev/null; then
    echo -e "${GREEN}✓ Firebase CLI is installed${NC}"
    
    # Check current project
    PROJECT=$(firebase use 2>&1 | grep -o 'mentor-app-238c6' || echo "")
    if [ ! -z "$PROJECT" ]; then
        echo -e "${GREEN}✓ Connected to project: $PROJECT${NC}"
    else
        echo -e "${YELLOW}⚠ Not connected to Firebase project${NC}"
        echo "  Run: firebase use mentor-app-238c6"
    fi
else
    echo -e "${RED}✗ Firebase CLI not found${NC}"
    echo "  Install: npm install -g firebase-tools"
fi

echo ""
echo "================================================"
echo "Ready to deploy storage rules?"
echo "================================================"
echo ""
read -p "Have you enabled Firebase Storage in the console? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Deploying storage rules..."
    npx firebase deploy --only storage
    
    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✓ Storage rules deployed successfully!${NC}"
        echo ""
        echo "You can now test profile photo uploads!"
    else
        echo ""
        echo -e "${RED}✗ Deployment failed${NC}"
        echo ""
        echo "Make sure:"
        echo "  1. Firebase Storage is enabled in console"
        echo "  2. You're logged in: firebase login"
        echo "  3. You're using the correct project: firebase use mentor-app-238c6"
    fi
else
    echo ""
    echo -e "${YELLOW}Please enable Firebase Storage first, then run this script again.${NC}"
    echo ""
    echo "Open: https://console.firebase.google.com/project/mentor-app-238c6/storage"
fi

echo ""
echo "================================================"
echo "Need Help?"
echo "================================================"
echo "Documentation: docs/PROFILE-PHOTO-UPLOAD-FIX.md"
echo "Firebase Console: https://console.firebase.google.com/project/mentor-app-238c6"
echo ""
