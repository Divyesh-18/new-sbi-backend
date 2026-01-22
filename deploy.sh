#!/bin/bash

# Deployment script for PokerBaazi Live Backend
# This script deploys the performance fixes

set -e  # Exit on error

echo "======================================"
echo "PokerBaazi Backend Deployment Script"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}PM2 is not installed. Installing PM2...${NC}"
    npm install -g pm2
fi

# Get current directory
BACKEND_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$BACKEND_DIR"

echo -e "${YELLOW}Step 1: Stopping current application...${NC}"
pm2 stop pokerbaazi-backend 2>/dev/null || echo "No existing process to stop"
pm2 delete pokerbaazi-backend 2>/dev/null || echo "No existing process to delete"

echo ""
echo -e "${YELLOW}Step 2: Creating logs directory...${NC}"
mkdir -p logs
echo "Logs directory created at: $BACKEND_DIR/logs"

echo ""
echo -e "${YELLOW}Step 3: Installing/updating dependencies...${NC}"
npm install

echo ""
echo -e "${YELLOW}Step 4: Starting application with PM2...${NC}"
pm2 start ecosystem.config.js --env production

echo ""
echo -e "${YELLOW}Step 5: Saving PM2 configuration...${NC}"
pm2 save

echo ""
echo -e "${GREEN}======================================"
echo "Deployment Completed Successfully!"
echo "======================================${NC}"
echo ""
echo "Useful commands:"
echo "  pm2 logs pokerbaazi-backend    - View logs"
echo "  pm2 monit                       - Monitor in real-time"
echo "  pm2 info pokerbaazi-backend    - View process info"
echo "  pm2 restart pokerbaazi-backend - Restart application"
echo ""
echo -e "${YELLOW}Monitoring for 10 seconds...${NC}"
sleep 2
pm2 logs pokerbaazi-backend --lines 50 --nostream

echo ""
echo -e "${GREEN}Check PERFORMANCE_FIXES.md for detailed documentation${NC}"
