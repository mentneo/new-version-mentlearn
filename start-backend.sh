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

# Install dependencies with npm ci (faster and more reliable for CI/CD)
echo "📦 Installing dependencies with npm ci..."
if [ -f "package-lock.json" ]; then
    npm ci --production --silent || npm install --production --silent
else
    npm install --production --silent
fi
echo "✅ Dependencies installed"

# Verify critical modules exist
echo "🔍 Verifying installed modules..."
ls -la node_modules/ | head -20

echo "🚀 Starting backend server..."
exec node server.js
