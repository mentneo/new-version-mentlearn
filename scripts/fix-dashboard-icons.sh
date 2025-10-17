#!/bin/bash

echo "🔧 Fixing LearnIQ Dashboard compilation issues..."

# Change to project root directory
cd "$(dirname "$0")/.."

# Check if react-icons is installed
if ! grep -q "react-icons" package.json; then
  echo "📦 Installing react-icons package..."
  npm install react-icons --save
else
  echo "✅ react-icons already in package.json"
fi

# Check if framer-motion is installed
if ! grep -q "framer-motion" package.json; then
  echo "📦 Installing framer-motion package..."
  npm install framer-motion --save
else
  echo "✅ framer-motion already in package.json"
fi

# Run the fix scripts
echo "🛠️  Fixing syntax in LearnIQCalendar.js..."
node scripts/fix-calendar-syntax.js

echo "🛠️  Adding missing icon imports to all LearnIQ files..."
node scripts/fix-icon-imports.js

echo "✅ All fixes applied!"
echo "🚀 You can now run 'npm start' to start the development server"