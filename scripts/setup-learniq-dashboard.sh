#!/bin/bash

cd /Users/yeduruabhiram/Desktop/mentneo/new-version-mentlearn

# Install dependencies
echo "Installing required dependencies..."
npm install react-icons --save
npm install date-fns --save

# Fix import paths
echo "Running script to fix import paths..."
node ./scripts/fix-learniq-imports.js

echo "Setup complete!"
echo "To start the development server, run: npm start"