#!/bin/bash

# Health check script for Wisal platform
# Usage: ./scripts/docker-health.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🏥 Wisal Platform Health Check${NC}"
echo "================================"

# Function to check service health
check_service() {
    local service=$1
    local url=$2
    local name=$3
    
    echo -n -e "Checking $name... "
    
    if curl -f -s -o /dev/null "$url" 2>/dev/null; then
        echo -e "${GREEN}✅ Healthy${NC}"
        return 0
    else
        echo -e "${RED}❌ Unhealthy${NC}"
        return 1
    fi
}

# Check Docker containers
echo -e "\n${YELLOW}📦 Container Status:${NC}"
docker-compose ps

# Check services
echo -e "\n${YELLOW}🔍 Service Health:${NC}"

# Frontend
check_service "frontend" "http://localhost:3000" "Frontend"

# Backend
check_service "backend" "http://localhost:4000/api/health" "Backend API"

# MongoDB
echo -n -e "Checking MongoDB... "
if docker-compose exec -T mongodb mongosh --quiet --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Healthy${NC}"
else
    echo -e "${RED}❌ Unhealthy${NC}"
fi

# Elasticsearch
check_service "elasticsearch" "http://localhost:9200/_cluster/health" "Elasticsearch"

# Redis
echo -n -e "Checking Redis... "
if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Healthy${NC}"
else
    echo -e "${RED}❌ Unhealthy${NC}"
fi

# Nginx
check_service "nginx" "http://localhost/health" "Nginx"

# Development services (if running)
if docker-compose ps | grep -q "mongo-express"; then
    echo -e "\n${YELLOW}🔧 Development Services:${NC}"
    check_service "mongo-express" "http://localhost:8081" "MongoDB Express"
    check_service "kibana" "http://localhost:5601/api/status" "Kibana"
    check_service "redisinsight" "http://localhost:8001" "RedisInsight"
fi

# Resource usage
echo -e "\n${YELLOW}📊 Resource Usage:${NC}"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Disk usage
echo -e "\n${YELLOW}💾 Disk Usage:${NC}"
docker system df

echo -e "\n${GREEN}✅ Health check completed!${NC}"