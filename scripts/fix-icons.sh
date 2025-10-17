#!/bin/bash

# Set the base directory to the project root
BASE_DIR="$(dirname "$0")/.."
cd "$BASE_DIR"

# Print the current working directory
echo "📁 Working directory: $(pwd)"

# Run the icon imports fix script
echo "🔧 Running icon imports fix script..."
node scripts/fix-icon-imports.js

# Check if the script completed successfully
if [ $? -eq 0 ]; then
    echo "✅ Icon imports fixed successfully!"
else
    echo "❌ Error occurred while fixing icon imports"
    exit 1
fi

echo "✨ Done!"