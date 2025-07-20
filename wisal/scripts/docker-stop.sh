#!/bin/bash

# Docker stop script for Wisal platform
# Usage: ./scripts/docker-stop.sh [--clean]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check for clean flag
CLEAN=false
if [ "$1" = "--clean" ]; then
    CLEAN=true
fi

echo -e "${YELLOW}🛑 Stopping Wisal platform...${NC}"

# Stop all containers
docker-compose down

if [ "$CLEAN" = true ]; then
    echo -e "${YELLOW}🧹 Cleaning up volumes and data...${NC}"
    
    # Remove volumes
    docker-compose down -v
    
    # Remove data directories
    echo -e "${YELLOW}🗑️  Removing data directories...${NC}"
    rm -rf data/
    
    echo -e "${GREEN}✅ Cleanup completed!${NC}"
else
    echo -e "${GREEN}✅ Containers stopped. Data preserved.${NC}"
    echo -e "${YELLOW}💡 To remove all data, run: $0 --clean${NC}"
fi