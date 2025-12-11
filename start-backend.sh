#!/bin/bash
set -e  # Exit on any error

# Universal backend startup script for Render
# This works regardless of which directory Render starts in

echo "🔍 Checking current directory..."
pwd
echo "📂 Files in current directory:"
ls -la

# Navigate to backend directory if not already there
if [ ! -f "server.js" ]; then
    echo "📁 Not in backend directory, navigating to backend..."
    cd backend || exit 1
    echo "✅ Changed to backend directory"
    pwd
fi

echo "✅ In backend directory"
pwd

# ALWAYS install dependencies (don't rely on build command)
echo "📦 Installing dependencies with npm install..."
npm install || exit 1
echo "✅ Dependencies installed"

# Verify critical modules exist
echo "🔍 Verifying installed modules..."
if [ -d "node_modules/helmet" ]; then
    echo "  ✅ helmet found"
else
    echo "  ❌ helmet MISSING!"
fi
if [ -d "node_modules/express" ]; then
    echo "  ✅ express found"
else
    echo "  ❌ express MISSING!"
fi

echo "🚀 Starting backend server..."
node server.js
