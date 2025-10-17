#!/bin/bash

# Define color codes for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
RESET='\033[0m'

# Navigate to project directory
cd "/Users/yeduruabhiram/Desktop/mentneo /new-version-mentlearn"

# Print welcome message
echo -e "${BLUE}==================================================${RESET}"
echo -e "${BLUE}      LearnIQ Dashboard Setup & Launch Script      ${RESET}"
echo -e "${BLUE}==================================================${RESET}"
echo

# Step 1: Install required dependencies
echo -e "${YELLOW}Step 1: Installing required dependencies...${RESET}"
npm install react-icons date-fns --save
echo -e "${GREEN}✓ Dependencies installed successfully${RESET}"
echo

# Step 2: Fix import paths
echo -e "${YELLOW}Step 2: Fixing import paths in LearnIQ components...${RESET}"
node ./scripts/fix-learniq-imports.js
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Import paths fixed successfully${RESET}"
else
    echo -e "${RED}× Error fixing import paths. Please check the logs above.${RESET}"
fi
echo

# Step 3: Start the development server
echo -e "${YELLOW}Step 3: Starting the development server...${RESET}"
echo -e "${BLUE}The LearnIQ Dashboard will be available at:${RESET}"
echo -e "${GREEN}http://localhost:3000/student-dashboard${RESET}"
echo
echo -e "${BLUE}Press Ctrl+C to stop the server when finished.${RESET}"
echo
npm start