#!/bin/bash

echo "🔧 Fixing LearnIQ Dashboard compilation issues..."

# Change to project root directory
cd "$(dirname "$0")/.."

# Check for dependencies in package.json
echo "📦 Checking required dependencies..."

# Run the fix script for imports
echo "🛠️ Fixing imports in all LearnIQ files..."
node scripts/fix-all-imports.js

echo "✅ All fixes applied!"
echo "🚀 You can now run 'npm start' to start the development server"