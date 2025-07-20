# Wisal Platform - Docker Infrastructure

This document provides comprehensive information about the Docker setup for the Wisal platform.

## 🚀 Quick Start

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+
- 4GB+ RAM available for Docker
- Ports 80, 443, 3000, 3001 available

### Getting Started

1. **Clone and navigate to the project:**
   ```bash
   cd wisal
   ```

2. **Copy environment configuration:**
   ```bash
   cp .env.example .env
   ```

3. **Update `.env` file with your configuration:**
   - Add your AI API keys (Anthropic, OpenAI, Google Gemini)
   - Update database passwords
   - Configure JWT secret

4. **Start the platform:**
   ```bash
   # Development mode (with hot reload and management tools)
   ./scripts/docker-start.sh dev

   # Production mode
   ./scripts/docker-start.sh prod
   ```

## 📦 Services Overview

### Core Services

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | React application (Vite) |
| Backend | 3001 | Node.js API server |
| MongoDB | 27017 | Primary database |
| Elasticsearch | 9200 | Search and analytics |
| Redis | 6379 | Caching and sessions |
| Nginx | 80/443 | Reverse proxy |

### Development Tools

| Service | Port | Description |
|---------|------|-------------|
| MongoDB Express | 8081 | Database management UI |
| Kibana | 5601 | Elasticsearch visualization |
| RedisInsight | 8001 | Redis management UI |

## 🛠️ Docker Commands

### Starting Services

```bash
# Start all services (development)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Start all services (production)
docker-compose up -d

# Start specific service
docker-compose up -d backend

# View logs
docker-compose logs -f backend
```

### Stopping Services

```bash
# Stop all services (preserve data)
docker-compose down

# Stop and remove all data
docker-compose down -v
```

### Utility Scripts

```bash
# Start platform
./scripts/docker-start.sh [dev|prod]

# Stop platform
./scripts/docker-stop.sh [--clean]

# View logs
./scripts/docker-logs.sh [service-name] [--follow]

# Health check
./scripts/docker-health.sh
```

## 🏗️ Architecture

### Network Architecture
- All services communicate through the `wisal-network` bridge network
- Frontend accessible via Nginx proxy
- Backend API exposed through `/api` routes
- WebSocket support enabled for real-time features

### Data Persistence
- MongoDB data: `./data/mongodb`
- Elasticsearch indices: `./data/elasticsearch`
- Redis data: `./data/redis`
- Nginx logs: `nginx_logs` volume

### Security Features
- Rate limiting on API endpoints
- Stricter limits on auth endpoints
- Security headers configured in Nginx
- Non-root users in containers
- Environment-based configuration

## 🔧 Configuration

### Environment Variables

Key environment variables in `.env`:

```bash
# Node Environment
NODE_ENV=production

# Database
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your-secure-password
MONGO_DATABASE=wisal

# Redis
REDIS_PASSWORD=your-redis-password

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=24h

# AI Services
ANTHROPIC_API_KEY=your-key
GOOGLE_GEMINI_API_KEY=your-key
OPENAI_API_KEY=your-key

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Nginx Configuration

The Nginx configuration includes:
- Reverse proxy for frontend and backend
- WebSocket support
- Rate limiting
- Security headers
- Static file caching
- Health check endpoint

## 🚨 Troubleshooting

### Common Issues

1. **Port conflicts:**
   ```bash
   # Check what's using a port
   lsof -i :3000
   ```

2. **Container not starting:**
   ```bash
   # Check logs
   docker-compose logs [service-name]
   ```

3. **Database connection issues:**
   - Ensure MongoDB is healthy: `docker-compose ps`
   - Check connection string in backend logs

4. **Permission issues:**
   ```bash
   # Fix script permissions
   chmod +x scripts/*.sh
   ```

### Health Checks

All services include health checks. Monitor status:

```bash
# Check all services
./scripts/docker-health.sh

# Check specific service
docker-compose ps
```

## 📊 Monitoring

### Logs
- Application logs: `docker-compose logs -f [service]`
- Nginx access logs: Available in `nginx_logs` volume
- MongoDB logs: `docker-compose logs -f mongodb`

### Metrics
- Container stats: `docker stats`
- Disk usage: `docker system df`

### Development Tools
- MongoDB Express: http://localhost:8081
- Kibana: http://localhost:5601
- RedisInsight: http://localhost:8001

## 🔐 Security Considerations

1. **Change default passwords** in production
2. **Use SSL certificates** for HTTPS
3. **Configure firewall rules** for production
4. **Implement API rate limiting**
5. **Regular security updates** for base images

## 🚀 Production Deployment

For production deployment:

1. Update `.env` with production values
2. Configure SSL certificates in `nginx/ssl/`
3. Uncomment HTTPS configuration in `nginx/conf.d/default.conf`
4. Use production-optimized images
5. Implement monitoring and alerting
6. Set up backup strategies

## 📝 Maintenance

### Backup

```bash
# Backup MongoDB
docker-compose exec mongodb mongodump --out /backup

# Backup all data volumes
tar -czf backup.tar.gz data/
```

### Updates

```bash
# Pull latest images
docker-compose pull

# Rebuild and restart
docker-compose up -d --build
```

### Cleanup

```bash
# Remove unused containers
docker container prune

# Remove unused images
docker image prune

# Full system cleanup
docker system prune -a
```

## 🤝 Contributing

When contributing to the Docker setup:

1. Test changes in development mode first
2. Update documentation for new services
3. Ensure health checks are implemented
4. Follow Docker best practices
5. Keep security in mind

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Elasticsearch Documentation](https://www.elastic.co/guide/)
- [Redis Documentation](https://redis.io/documentation)