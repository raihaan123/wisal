# Environment Configuration Guide

This guide covers all environment variables and configuration needed for the Wisal platform.

## 🔐 Environment Files

The platform uses different `.env` files for different purposes:

### 1. Development Environment

#### Backend (.env)
Location: `wisal/backend/.env`

```env
# Server Configuration
NODE_ENV=development
PORT=4000

# Database
MONGODB_URI=mongodb://localhost:27017/wisal
MONGODB_URI_DOCKER=mongodb://mongodb:27017/wisal

# Redis
REDIS_URL=redis://localhost:6379
REDIS_URL_DOCKER=redis://redis:6379

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# OAuth - LinkedIn
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_CALLBACK_URL=http://localhost:4000/api/auth/linkedin/callback-custom

# AI Services (At least one required for AI features)
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GOOGLE_GEMINI_API_KEY=your_gemini_api_key

# Elasticsearch (Optional for development)
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=changeme

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000

# File Upload
MAX_FILE_SIZE=10485760  # 10MB in bytes
UPLOAD_PATH=./uploads

# Session
SESSION_SECRET=your-session-secret-key

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@wisal.com
```

#### Frontend (.env)
Location: `wisal/frontend/.env`

```env
# API Configuration
VITE_API_URL=http://localhost:4000/api
VITE_SOCKET_URL=http://localhost:4000

# Public Keys (Safe for frontend)
VITE_APP_NAME=Wisal
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_CHAT=true
VITE_ENABLE_FORUM=true
VITE_ENABLE_NEWS=true
```

### 2. Docker Environment

#### Docker Development (.env.docker)
Location: Project root

```env
# Required for Docker development
OPENAI_API_KEY=your_openai_api_key_here
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# Optional overrides
JWT_SECRET=docker-dev-secret
SESSION_SECRET=docker-dev-session
```

### 3. Production Environment

#### Production (.env.production)
```env
# Server Configuration
NODE_ENV=production
PORT=4000

# Database (with authentication)
MONGODB_URI=mongodb://admin:password@mongodb:27017/wisal?authSource=admin
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your-secure-password

# Redis (with password)
REDIS_URL=redis://:your-redis-password@redis:6379
REDIS_PASSWORD=your-redis-password

# JWT (Use strong secrets!)
JWT_SECRET=generate-a-very-long-random-string-here
JWT_REFRESH_SECRET=generate-another-very-long-random-string-here

# OAuth Production URLs
LINKEDIN_CALLBACK_URL=https://yourdomain.com/api/auth/linkedin/callback-custom

# CORS (Update with your domain)
FRONTEND_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com

# SSL/TLS
SSL_CERT_PATH=/etc/ssl/certs/your-cert.crt
SSL_KEY_PATH=/etc/ssl/private/your-key.key

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info
```

## 🔧 Configuration by Service

### MongoDB
- **Development**: No authentication, direct connection
- **Production**: Enable authentication, use connection string with credentials
- **Docker**: Use service name `mongodb` instead of `localhost`

### Redis
- **Development**: No password, direct connection
- **Production**: Password required, use AUTH
- **Docker**: Use service name `redis` instead of `localhost`

### Elasticsearch
- **Development**: Optional, basic setup
- **Production**: Required for search features, secured
- **Docker**: Use service name `elasticsearch`

### OAuth (LinkedIn)
1. Create app at [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Add "Sign In with LinkedIn using OpenID Connect" product
3. Set redirect URLs for each environment:
   - Dev: `http://localhost:4000/api/auth/linkedin/callback-custom`
   - Prod: `https://yourdomain.com/api/auth/linkedin/callback-custom`

## 🚀 Quick Setup Commands

### Generate Secure Secrets
```bash
# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate session secret
openssl rand -base64 32
```

### Validate Environment
```bash
# Check all required variables
node -e "
const required = ['JWT_SECRET', 'MONGODB_URI', 'REDIS_URL'];
const missing = required.filter(key => !process.env[key]);
if (missing.length) {
  console.error('Missing:', missing.join(', '));
  process.exit(1);
} else {
  console.log('✅ All required variables set');
}
"
```

## 📝 Environment Variable Reference

### Required Variables
| Variable | Description | Example |
|----------|-------------|---------|
| NODE_ENV | Environment mode | development, production |
| PORT | Server port | 4000 |
| MONGODB_URI | MongoDB connection | mongodb://localhost:27017/wisal |
| JWT_SECRET | JWT signing key | random-string-min-32-chars |
| LINKEDIN_CLIENT_ID | LinkedIn OAuth ID | 77chexample |
| LINKEDIN_CLIENT_SECRET | LinkedIn OAuth Secret | WPLexample |

### Optional Variables
| Variable | Description | Default |
|----------|-------------|---------|
| REDIS_URL | Redis connection | redis://localhost:6379 |
| ELASTICSEARCH_URL | Elasticsearch URL | http://localhost:9200 |
| LOG_LEVEL | Logging level | info |
| MAX_FILE_SIZE | Max upload size | 10485760 |

### AI Service Variables (One Required)
| Variable | Provider | Purpose |
|----------|----------|---------|
| OPENAI_API_KEY | OpenAI | GPT models |
| ANTHROPIC_API_KEY | Anthropic | Claude models |
| GOOGLE_GEMINI_API_KEY | Google | Gemini models |

## 🔒 Security Best Practices

1. **Never commit `.env` files** - They're in `.gitignore`
2. **Use strong secrets** - Minimum 32 characters for JWT
3. **Rotate secrets regularly** - Especially in production
4. **Use environment-specific files** - Don't mix dev/prod
5. **Encrypt sensitive data** - Use secrets management in production
6. **Limit CORS origins** - Be specific about allowed domains
7. **Enable rate limiting** - Protect against abuse

## 🐛 Common Issues

### "Missing environment variable" error
- Ensure `.env` file exists in the correct location
- Check file permissions
- Verify variable names match exactly

### OAuth redirect mismatch
- LinkedIn callback URL must match exactly
- Include protocol (http/https)
- Check for trailing slashes

### Database connection failed
- Verify MongoDB is running
- Check connection string format
- Ensure Docker service names are used in containers

### AI features not working
- At least one AI service API key required
- Check API key validity
- Verify network access to AI services

## 📚 Additional Resources

- [Docker Environment Guide](./DOCKER.md#configuration-reference)
- [OAuth Setup Guide](./wisal/docs/OAUTH_FIX_SUMMARY.md)
- [Security Best Practices](./wisal/docs/SECURITY.md)

---

Last updated: January 2025