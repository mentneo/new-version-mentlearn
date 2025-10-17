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
echo -e "${BLUE}      LearnIQ Dashboard Syntax Fix Script      ${RESET}"
echo -e "${BLUE}==================================================${RESET}"
echo

# Step 1: Install required dependencies
echo -e "${YELLOW}Step 1: Installing required dependencies...${RESET}"
npm install react-icons@4.10.1 --save
echo -e "${GREEN}✓ Dependencies installed successfully${RESET}"
echo

# Step 2: Fix syntax errors in LearnIQ components
echo -e "${YELLOW}Step 2: Fixing syntax errors in LearnIQ components...${RESET}"
node ./scripts/fix-learniq-files.js
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Syntax errors fixed successfully${RESET}"
else
    echo -e "${RED}× Error fixing syntax errors. Please check the logs above.${RESET}"
    exit 1
fi
echo

echo -e "${GREEN}==================================================${RESET}"
echo -e "${GREEN}      All fixes have been applied successfully!    ${RESET}"
echo -e "${GREEN}==================================================${RESET}"
echo
echo -e "${BLUE}To run the development server:${RESET}"
echo -e "${YELLOW}npm start${RESET}"
echo
echo -e "${BLUE}The LearnIQ Dashboard will be available at:${RESET}"
echo -e "${YELLOW}http://localhost:3000/student-dashboard${RESET}"