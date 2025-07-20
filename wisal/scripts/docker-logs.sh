#!/bin/bash

# Docker logs viewer for Wisal platform
# Usage: ./scripts/docker-logs.sh [service-name] [--follow]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SERVICE=$1
FOLLOW=""

# Check if follow flag is provided
if [ "$2" = "--follow" ] || [ "$1" = "--follow" ]; then
    FOLLOW="-f"
fi

# If no service specified, show menu
if [ -z "$SERVICE" ] || [ "$SERVICE" = "--follow" ]; then
    echo -e "${BLUE}📋 Available services:${NC}"
    echo "1) frontend"
    echo "2) backend"
    echo "3) mongodb"
    echo "4) elasticsearch"
    echo "5) redis"
    echo "6) nginx"
    echo "7) mongo-express (dev only)"
    echo "8) kibana (dev only)"
    echo "9) redisinsight (dev only)"
    echo "0) all services"
    
    read -p "Select service (0-9): " choice
    
    case $choice in
        1) SERVICE="frontend";;
        2) SERVICE="backend";;
        3) SERVICE="mongodb";;
        4) SERVICE="elasticsearch";;
        5) SERVICE="redis";;
        6) SERVICE="nginx";;
        7) SERVICE="mongo-express";;
        8) SERVICE="kibana";;
        9) SERVICE="redisinsight";;
        0) SERVICE="";;
        *) echo -e "${RED}Invalid choice${NC}"; exit 1;;
    esac
fi

# Show logs
if [ -z "$SERVICE" ]; then
    echo -e "${GREEN}📜 Showing logs for all services...${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop${NC}\n"
    docker-compose logs $FOLLOW
else
    echo -e "${GREEN}📜 Showing logs for $SERVICE...${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop${NC}\n"
    docker-compose logs $FOLLOW $SERVICE
fi