# Wisal Platform Deployment Guide

This guide covers deployment options for the Wisal platform in production environments.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Deployment Options](#deployment-options)
- [Docker Deployment](#docker-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Cloud Deployments](#cloud-deployments)
- [Environment Configuration](#environment-configuration)
- [SSL/TLS Setup](#ssltls-setup)
- [Database Setup](#database-setup)
- [Monitoring and Logging](#monitoring-and-logging)
- [Backup and Recovery](#backup-and-recovery)
- [Security Checklist](#security-checklist)

## Prerequisites

### System Requirements
- Linux server (Ubuntu 20.04+ or RHEL 8+)
- 4GB+ RAM minimum (8GB recommended)
- 20GB+ storage
- Docker Engine 20.10+
- Docker Compose 2.0+
- Valid domain name
- SSL certificates

### Required Services
- MongoDB 6.0+
- Redis 6.0+
- Elasticsearch 8.0+ (optional)
- SMTP server for emails
- Cloud storage (S3 compatible)

## Deployment Options

### 1. Docker Compose (Recommended for Small/Medium)
Best for single-server deployments with moderate traffic.

### 2. Kubernetes
Ideal for high-availability, auto-scaling requirements.

### 3. Cloud Platforms
- AWS ECS/EKS
- Google Cloud Run/GKE
- Azure Container Instances/AKS
- DigitalOcean App Platform

## Docker Deployment

### Quick Deploy Script
```bash
#!/bin/bash
# deploy.sh

# Clone repository
git clone https://github.com/yourusername/wisal.git
cd wisal

# Create environment file
cp .env.example .env.production

# Edit environment variables
nano .env.production

# Build and start services
docker-compose -f docker-compose.yml up -d

# Check health
./scripts/docker-health.sh
```

### Production Docker Compose Configuration

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      args:
        - NODE_ENV=production
    restart: always
    environment:
      - NEXT_PUBLIC_API_URL=https://api.yourdomain.com
    networks:
      - wisal-network

  backend:
    build:
      context: ./backend
      args:
        - NODE_ENV=production
    restart: always
    env_file: .env.production
    depends_on:
      - mongodb
      - redis
    networks:
      - wisal-network

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d
      - ./nginx/ssl:/etc/nginx/ssl
      - nginx_logs:/var/log/nginx
    depends_on:
      - frontend
      - backend
    networks:
      - wisal-network

  mongodb:
    image: mongo:6
    restart: always
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_ROOT_USERNAME}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_ROOT_PASSWORD}
    volumes:
      - mongo_data:/data/db
    networks:
      - wisal-network

  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - wisal-network

volumes:
  mongo_data:
  redis_data:
  nginx_logs:

networks:
  wisal-network:
    driver: bridge
```

### Deployment Steps

1. **Prepare Server**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Docker
   curl -fsSL https://get.docker.com | bash
   
   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

2. **Configure Firewall**
   ```bash
   # Allow HTTP and HTTPS
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw allow 22/tcp
   sudo ufw enable
   ```

3. **Deploy Application**
   ```bash
   # Clone and configure
   git clone https://github.com/yourusername/wisal.git
   cd wisal
   cp .env.example .env.production
   
   # Edit configuration
   nano .env.production
   
   # Start services
   docker-compose -f docker-compose.prod.yml up -d
   ```

## Kubernetes Deployment

### Kubernetes Manifests

Create namespace:
```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: wisal
```

Backend deployment:
```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: wisal-backend
  namespace: wisal
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: yourdockerhub/wisal-backend:latest
        ports:
        - containerPort: 4000
        env:
        - name: NODE_ENV
          value: "production"
        envFrom:
        - secretRef:
            name: wisal-secrets
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

### Deploy to Kubernetes
```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Create secrets
kubectl create secret generic wisal-secrets \
  --from-env-file=.env.production \
  -n wisal

# Deploy services
kubectl apply -f k8s/
```

## Cloud Deployments

### AWS ECS Deployment

1. **Build and Push Images**
   ```bash
   # Build images
   docker build -t wisal-backend ./backend
   docker build -t wisal-frontend ./frontend
   
   # Tag for ECR
   docker tag wisal-backend:latest $AWS_ACCOUNT.dkr.ecr.$REGION.amazonaws.com/wisal-backend:latest
   docker tag wisal-frontend:latest $AWS_ACCOUNT.dkr.ecr.$REGION.amazonaws.com/wisal-frontend:latest
   
   # Push to ECR
   aws ecr get-login-password | docker login --username AWS --password-stdin $AWS_ACCOUNT.dkr.ecr.$REGION.amazonaws.com
   docker push $AWS_ACCOUNT.dkr.ecr.$REGION.amazonaws.com/wisal-backend:latest
   docker push $AWS_ACCOUNT.dkr.ecr.$REGION.amazonaws.com/wisal-frontend:latest
   ```

2. **Create ECS Task Definition**
   ```json
   {
     "family": "wisal-app",
     "taskRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskRole",
     "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
     "networkMode": "awsvpc",
     "containerDefinitions": [
       {
         "name": "backend",
         "image": "ACCOUNT.dkr.ecr.REGION.amazonaws.com/wisal-backend:latest",
         "memory": 512,
         "cpu": 256,
         "essential": true,
         "portMappings": [
           {
             "containerPort": 4000,
             "protocol": "tcp"
           }
         ],
         "environment": [
           {
             "name": "NODE_ENV",
             "value": "production"
           }
         ],
         "secrets": [
           {
             "name": "JWT_SECRET",
             "valueFrom": "arn:aws:secretsmanager:REGION:ACCOUNT:secret:wisal/jwt-secret"
           }
         ]
       }
     ]
   }
   ```

### Google Cloud Run Deployment

```bash
# Build and push to Container Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/wisal-backend ./backend
gcloud builds submit --tag gcr.io/PROJECT_ID/wisal-frontend ./frontend

# Deploy backend
gcloud run deploy wisal-backend \
  --image gcr.io/PROJECT_ID/wisal-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production \
  --set-secrets JWT_SECRET=wisal-jwt-secret:latest

# Deploy frontend
gcloud run deploy wisal-frontend \
  --image gcr.io/PROJECT_ID/wisal-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## Environment Configuration

### Production Environment Variables

```bash
# Node Environment
NODE_ENV=production

# Application
APP_NAME=Wisal
APP_URL=https://wisal.com
API_URL=https://api.wisal.com

# Database
MONGO_URI=mongodb://username:password@mongo-host:27017/wisal?authSource=admin
REDIS_URL=redis://:password@redis-host:6379

# Authentication
JWT_SECRET=your-super-secure-jwt-secret
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRES_IN=7d

# LinkedIn OAuth (IMPORTANT: Update callback URL for production)
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
LINKEDIN_CALLBACK_URL=https://api.wisal.com/api/auth/linkedin/callback-custom

# AI Services
ANTHROPIC_API_KEY=your-production-key
OPENAI_API_KEY=your-production-key
GOOGLE_GEMINI_API_KEY=your-production-key

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
EMAIL_FROM=noreply@wisal.com

# Storage
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
S3_BUCKET=wisal-uploads

# Elasticsearch
ELASTICSEARCH_URL=http://elasticsearch:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=your-secure-password

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
NEW_RELIC_LICENSE_KEY=your-license-key

# Security
CORS_ORIGIN=https://wisal.com
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=100
```

## OAuth Configuration

### LinkedIn OAuth Setup for Production

1. **Update LinkedIn App Settings**
   - Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
   - Select your app
   - Navigate to Auth settings
   - Add production redirect URLs:
     - `https://api.wisal.com/api/auth/linkedin/callback-custom`
     - `https://yourdomain.com/api/auth/linkedin/callback-custom`

2. **Verify OpenID Connect Product**
   - Ensure "Sign In with LinkedIn using OpenID Connect" is added to your app
   - This is required for the new OAuth flow with scopes: `openid`, `profile`, `email`

3. **Update Environment Variables**
   ```bash
   # Production LinkedIn OAuth
   LINKEDIN_CLIENT_ID=your-production-client-id
   LINKEDIN_CLIENT_SECRET=your-production-client-secret
   LINKEDIN_CALLBACK_URL=https://api.wisal.com/api/auth/linkedin/callback-custom
   ```

4. **Test OAuth Flow**
   ```bash
   # Test redirect
   curl -I https://api.wisal.com/api/auth/linkedin-custom
   
   # Should redirect to LinkedIn with correct callback URL
   ```

## SSL/TLS Setup

### Using Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d wisal.com -d www.wisal.com -d api.wisal.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Nginx SSL Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name wisal.com;

    ssl_certificate /etc/letsencrypt/live/wisal.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/wisal.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Database Setup

### MongoDB Production Setup

1. **Create Indexes**
   ```javascript
   // Connect to MongoDB
   use wisal;
   
   // User indexes
   db.users.createIndex({ email: 1 }, { unique: true });
   db.users.createIndex({ role: 1 });
   
   // Lawyer indexes
   db.lawyers.createIndex({ specializations: 1 });
   db.lawyers.createIndex({ location: "2dsphere" });
   db.lawyers.createIndex({ rating: -1 });
   
   // Query indexes
   db.queries.createIndex({ status: 1, createdAt: -1 });
   db.queries.createIndex({ category: 1 });
   db.queries.createIndex({ "user": 1 });
   
   // Text search indexes
   db.queries.createIndex({ title: "text", description: "text" });
   db.posts.createIndex({ title: "text", content: "text" });
   ```

2. **Backup Configuration**
   ```bash
   # Create backup script
   cat > /opt/wisal/backup-mongo.sh << 'EOF'
   #!/bin/bash
   DATE=$(date +%Y%m%d_%H%M%S)
   BACKUP_DIR="/backups/mongodb"
   mkdir -p $BACKUP_DIR
   
   mongodump \
     --uri="mongodb://username:password@localhost:27017/wisal?authSource=admin" \
     --out="$BACKUP_DIR/backup_$DATE"
   
   # Upload to S3
   aws s3 sync "$BACKUP_DIR/backup_$DATE" "s3://wisal-backups/mongodb/$DATE/"
   
   # Clean old backups (keep 30 days)
   find $BACKUP_DIR -type d -mtime +30 -exec rm -rf {} +
   EOF
   
   chmod +x /opt/wisal/backup-mongo.sh
   
   # Add to crontab
   echo "0 2 * * * /opt/wisal/backup-mongo.sh" | crontab -
   ```

## Monitoring and Logging

### Application Monitoring

1. **Health Check Endpoints**
   ```bash
   # Backend health
   curl https://api.wisal.com/health
   
   # Frontend health
   curl https://wisal.com/api/health
   ```

2. **Prometheus Metrics**
   ```yaml
   # prometheus.yml
   global:
     scrape_interval: 15s
   
   scrape_configs:
     - job_name: 'wisal-backend'
       static_configs:
         - targets: ['backend:4000']
   ```

3. **Grafana Dashboard**
   - Import dashboard ID: 12345 (Node.js metrics)
   - Configure alerts for:
     - High CPU usage (>80%)
     - High memory usage (>85%)
     - Error rate (>1%)
     - Response time (>500ms)

### Log Management

1. **Centralized Logging with ELK**
   ```yaml
   # docker-compose.logging.yml
   services:
     elasticsearch:
       image: elasticsearch:8.11.0
       environment:
         - discovery.type=single-node
         - ES_JAVA_OPTS=-Xms512m -Xmx512m
       volumes:
         - es_data:/usr/share/elasticsearch/data
   
     logstash:
       image: logstash:8.11.0
       volumes:
         - ./logstash/pipeline:/usr/share/logstash/pipeline
   
     kibana:
       image: kibana:8.11.0
       ports:
         - "5601:5601"
       environment:
         - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
   ```

2. **Application Logging**
   ```javascript
   // Configure Winston for production
   const winston = require('winston');
   
   const logger = winston.createLogger({
     level: 'info',
     format: winston.format.json(),
     transports: [
       new winston.transports.File({ filename: 'error.log', level: 'error' }),
       new winston.transports.File({ filename: 'combined.log' }),
       new winston.transports.Console({
         format: winston.format.simple()
       })
     ]
   });
   ```

## Backup and Recovery

### Automated Backup Strategy

1. **Database Backups**
   - Daily automated backups
   - Point-in-time recovery
   - Geo-redundant storage

2. **File Storage Backups**
   - S3 versioning enabled
   - Cross-region replication
   - Lifecycle policies

3. **Recovery Procedures**
   ```bash
   # Restore MongoDB
   mongorestore \
     --uri="mongodb://username:password@localhost:27017/?authSource=admin" \
     --db=wisal \
     /backups/mongodb/backup_20240115_020000/wisal
   
   # Restore Redis
   redis-cli --rdb /backups/redis/dump.rdb
   ```

## Security Checklist

### Pre-Deployment
- [ ] Change all default passwords
- [ ] Generate strong JWT secrets
- [ ] Configure firewall rules
- [ ] Enable SSL/TLS
- [ ] Set up WAF (Web Application Firewall)
- [ ] Configure rate limiting
- [ ] Enable CORS properly
- [ ] Implement CSP headers

### Post-Deployment
- [ ] Run security scan (OWASP ZAP)
- [ ] Check SSL configuration (SSL Labs)
- [ ] Monitor for vulnerabilities
- [ ] Set up intrusion detection
- [ ] Configure log analysis
- [ ] Enable 2FA for admin accounts
- [ ] Regular security audits
- [ ] Dependency updates

### Monitoring Setup
- [ ] Uptime monitoring (Pingdom/UptimeRobot)
- [ ] Application monitoring (New Relic/Datadog)
- [ ] Error tracking (Sentry)
- [ ] Log aggregation (ELK/Splunk)
- [ ] Performance monitoring
- [ ] Security monitoring

## Maintenance

### Regular Tasks

1. **Daily**
   - Check application health
   - Review error logs
   - Monitor disk space

2. **Weekly**
   - Review performance metrics
   - Check backup integrity
   - Update dependencies

3. **Monthly**
   - Security patches
   - Performance optimization
   - Capacity planning

### Update Procedure

```bash
# 1. Backup current state
./scripts/backup-all.sh

# 2. Pull latest code
git pull origin main

# 3. Build new images
docker-compose build

# 4. Rolling update
docker-compose up -d --no-deps --build backend
docker-compose up -d --no-deps --build frontend

# 5. Verify deployment
./scripts/health-check.sh
```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check firewall rules
   - Verify service is running
   - Check container logs

2. **502 Bad Gateway**
   - Backend service down
   - Nginx configuration issue
   - Check proxy settings

3. **Database Connection Failed**
   - Verify credentials
   - Check network connectivity
   - Review connection string

### Debug Commands

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f backend

# Enter container
docker exec -it wisal_backend_1 bash

# Check resource usage
docker stats

# Network debugging
docker network inspect wisal-network
```

## Support

For deployment support:
- Documentation: https://docs.wisal.com
- Community: https://community.wisal.com
- Enterprise support: support@wisal.com