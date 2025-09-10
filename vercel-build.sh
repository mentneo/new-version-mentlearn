#!/bin/bash

# Set environment variables
export CI=false
export NODE_ENV=production
export GENERATE_SOURCEMAP=false

# Install dependencies
npm install

# Build the app
npm run build

echo "Build completed successfully!"
