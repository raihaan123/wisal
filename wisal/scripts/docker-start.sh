#!/bin/bash

# Docker startup script for Wisal platform
# Usage: ./scripts/docker-start.sh [dev|prod]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default to development mode
MODE=${1:-dev}

echo -e "${GREEN}🚀 Starting Wisal platform in ${MODE} mode...${NC}"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env file. Please update it with your configuration.${NC}"
fi

# Create necessary directories
echo -e "${GREEN}📁 Creating necessary directories...${NC}"
mkdir -p data/{mongodb,elasticsearch,redis,redisinsight}
mkdir -p nginx/ssl
mkdir -p logs

# Set proper permissions
chmod 755 scripts/*.sh 2>/dev/null || true

# Start containers based on mode
if [ "$MODE" = "dev" ]; then
    echo -e "${GREEN}🔧 Starting development environment...${NC}"
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
    
    echo -e "${GREEN}✅ Development environment started!${NC}"
    echo -e "${YELLOW}📋 Access points:${NC}"
    echo "   - Frontend: http://localhost:3000"
    echo "   - Backend API: http://localhost:4000"
    echo "   - MongoDB Express: http://localhost:8081"
    echo "   - Elasticsearch: http://localhost:9200"
    echo "   - Kibana: http://localhost:5601"
    echo "   - RedisInsight: http://localhost:8001"
    
elif [ "$MODE" = "prod" ]; then
    echo -e "${GREEN}🏭 Starting production environment...${NC}"
    docker-compose up -d
    
    echo -e "${GREEN}✅ Production environment started!${NC}"
    echo -e "${YELLOW}📋 Access points:${NC}"
    echo "   - Application: http://localhost"
    echo "   - API: http://localhost/api"
    
else
    echo -e "${RED}❌ Invalid mode: $MODE. Use 'dev' or 'prod'${NC}"
    exit 1
fi

# Show container status
echo -e "\n${GREEN}📊 Container status:${NC}"
docker-compose ps

# Show logs command
echo -e "\n${YELLOW}💡 To view logs, run:${NC}"
echo "   docker-compose logs -f [service-name]"
echo "   Example: docker-compose logs -f backend"