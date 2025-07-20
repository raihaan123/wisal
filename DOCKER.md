# 🐳 Docker Guide - Wisal Platform

A comprehensive guide for running the Wisal platform with Docker, covering both development and production environments.

## 🚀 Quick Start (TL;DR)

### 2-Step Setup
1. **Create environment file**:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

2. **Start Docker**:
   ```bash
   # Development (with hot reload)
   docker-compose -f docker-compose.dev.yml up -d
   
   # Production
   docker-compose up -d
   ```

**Access points:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

## 📋 Table of Contents

1. [Overview](#overview)
2. [Development Setup](#development-setup)
3. [Production Setup](#production-setup)
4. [Configuration Reference](#configuration-reference)
5. [Command Reference](#command-reference)
6. [Troubleshooting Guide](#troubleshooting-guide)
7. [Advanced Topics](#advanced-topics)

## 📦 Overview

### Architecture
The Wisal platform uses a microservices architecture with the following services:

| Service | Purpose | Dev Port | Prod Port |
|---------|---------|----------|-----------|
| Frontend | React app (Vite) | 3000 | 3000 |
| Backend | Node.js API | 4000 | 4000 |
| MongoDB | Database | 27017 | 27017 |
| Redis | Cache/Sessions | 6379 | 6379 |
| Elasticsearch | Search* | - | 9200 |
| Nginx | Reverse Proxy* | - | 80/443 |

*Production only

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+
- 4GB+ RAM available
- Required ports available

## 🔧 Development Setup

### Quick Start
1. **Clone and navigate**:
   ```bash
   cd wisal
   ```

2. **Create environment file**:
   ```bash
   cp .env.example .env
   # Update with your development values
   ```

3. **Start development environment**:
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

### Development Features
- ✅ Hot reloading (frontend & backend)
- ✅ Volume mounts for live updates
- ✅ Simplified service stack
- ✅ No authentication on databases
- ✅ Direct port access

### Development Tools (Optional)
Add these services to your dev compose file:
- **MongoDB Express** (8081) - Database UI
- **RedisInsight** (8001) - Redis management
- **Kibana** (5601) - Elasticsearch visualization

## 🏭 Production Setup

### Quick Start
1. **Configure environment**:
   ```bash
   cp .env.example .env
   # Update with production values
   ```

2. **Add SSL certificates** (optional):
   ```bash
   cp your-cert.crt nginx/ssl/
   cp your-cert.key nginx/ssl/
   ```

3. **Start production stack**:
   ```bash
   docker-compose up -d
   ```

### Production Features
- ✅ Full service stack with Nginx
- ✅ Elasticsearch for advanced search
- ✅ Security hardening
- ✅ Health checks
- ✅ Rate limiting
- ✅ SSL/TLS ready

## ⚙️ Configuration Reference

### Environment Variables

#### Required Variables
```env
# Node Environment
NODE_ENV=development|production

# Database
MONGODB_URI=mongodb://mongodb:27017/wisal
MONGO_ROOT_USERNAME=admin          # Production only
MONGO_ROOT_PASSWORD=changeme       # Production only

# Redis
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=changeme            # Production only

# JWT
JWT_SECRET=your-secure-secret
JWT_REFRESH_SECRET=your-refresh-secret
```

#### OAuth Configuration
```env
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
LINKEDIN_CALLBACK_URL=http://localhost:4000/api/auth/linkedin/callback-custom
```

#### AI Services (Optional)
```env
OPENAI_API_KEY=your_key
ANTHROPIC_API_KEY=your_key
GOOGLE_GEMINI_API_KEY=your_key
```

### Port Configuration

| Service | Internal | External | Environment |
|---------|----------|----------|-------------|
| Frontend | 3000 | 3000 | Both |
| Backend | 4000 | 4000 | Both |
| MongoDB | 27017 | 27017 | Both |
| Redis | 6379 | 6379 | Both |
| Elasticsearch | 9200 | 9200 | Production |
| Nginx | 80/443 | 80/443 | Production |

### Network Architecture
- Bridge network: `wisal-network` (prod) / `wisal-network-dev` (dev)
- All services communicate via service names
- Frontend proxies API calls to backend
- WebSocket support enabled

## 📚 Command Reference

### Starting Services
```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d backend

# Start with build
docker-compose up -d --build

# View logs
docker-compose logs -f [service]
```

### Stopping Services
```bash
# Stop all (preserve data)
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Stop specific service
docker-compose stop [service]
```

### Maintenance Commands
```bash
# View running containers
docker-compose ps

# Enter container shell
docker-compose exec [service] bash

# View resource usage
docker stats

# Clean up system
docker system prune -a
```

### Utility Scripts
```bash
# From wisal/scripts directory
./docker-start.sh [dev|prod]    # Start environment
./docker-stop.sh [--clean]      # Stop environment
./docker-logs.sh [service]      # View logs
./docker-health.sh              # Health check
```

## 🚨 Troubleshooting Guide

### Common Issues

#### Container Won't Start
1. **Check logs**:
   ```bash
   docker-compose logs [service-name]
   ```
2. **Verify ports**:
   ```bash
   lsof -i :3000  # Check if port is in use
   ```
3. **Rebuild container**:
   ```bash
   docker-compose build --no-cache [service]
   ```

#### Database Connection Failed
1. **Check MongoDB health**:
   ```bash
   docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
   ```
2. **Verify credentials** in .env match compose file
3. **Reset if needed**:
   ```bash
   docker-compose down -v
   docker-compose up -d mongodb
   ```

#### Hot Reload Not Working
1. **Check volume mounts**:
   ```bash
   docker inspect [container] | grep Mounts -A 10
   ```
2. **Enable file watchers** (Linux):
   ```bash
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   ```

#### High Memory Usage
1. **Check usage**:
   ```bash
   docker stats
   ```
2. **Increase Docker resources**: Docker Desktop → Preferences → Resources
3. **Clean up**:
   ```bash
   docker system prune -a
   ```

### Quick Fixes
- **Port conflicts**: Kill process using port or change port in docker-compose.yml
- **Permission issues**: `chmod +x scripts/*.sh`
- **Network issues**: Use service names (mongodb, redis) not localhost
- **Build issues**: Clear Docker cache with `docker builder prune`

## 🔐 Advanced Topics

### SSL/TLS Configuration
1. Add certificates to `nginx/ssl/`
2. Update `nginx/conf.d/default.conf`:
   ```nginx
   server {
       listen 443 ssl;
       ssl_certificate /etc/nginx/ssl/cert.crt;
       ssl_certificate_key /etc/nginx/ssl/cert.key;
   }
   ```

### Performance Optimization
- Limit container resources:
  ```yaml
  services:
    backend:
      deploy:
        resources:
          limits:
            cpus: '0.5'
            memory: 512M
  ```

### Backup & Restore
```bash
# Backup MongoDB
docker-compose exec mongodb mongodump --out /backup
docker cp wisal-mongodb:/backup ./mongodb-backup

# Backup volumes
tar -czf backup.tar.gz ./data/

# Restore MongoDB
docker cp ./mongodb-backup wisal-mongodb:/restore
docker-compose exec mongodb mongorestore /restore
```

### Monitoring
- Container metrics: `docker stats`
- Logs aggregation: Consider ELK stack
- Health endpoints: `/health` on all services

### Security Best Practices
1. Use secrets management for production
2. Enable authentication on all services
3. Implement network policies
4. Regular security updates
5. Use non-root users in containers

## 📊 Data Persistence

### Volume Locations
- MongoDB: `./data/mongodb` or `mongodb_data` volume
- Redis: `./data/redis` or `redis_data` volume
- Elasticsearch: `./data/elasticsearch` or `elasticsearch_data` volume
- Uploads: `./wisal/backend/uploads`

### Backup Strategy
1. Regular automated backups
2. Test restore procedures
3. Off-site backup storage
4. Document recovery procedures

## 🤝 Contributing

When modifying Docker configuration:
1. Test in development mode first
2. Update this documentation
3. Ensure health checks work
4. Follow Docker best practices
5. Consider security implications

## 🆘 Support

- Check logs: `docker-compose logs -f [service]`
- Verify config: `docker-compose config`
- System check: `./scripts/docker-health.sh`
- [Docker Documentation](https://docs.docker.com/)
- [Project Issues](https://github.com/your-repo/issues)

---

Last updated: January 2025