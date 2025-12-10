#!/bin/bash

# Universal backend startup script for Render
# This works regardless of which directory Render starts in

echo "🔍 Checking current directory..."
pwd

# Navigate to backend directory if not already there
if [ ! -f "server.js" ]; then
    echo "📁 Not in backend directory, navigating to backend..."
    cd backend || exit 1
fi

echo "✅ In backend directory"
pwd

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install || exit 1
fi

echo "🚀 Starting backend server..."
node server.js
