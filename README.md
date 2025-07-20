# Wisal Platform 🌿

> **Democratizing legal advice while empowering social activism**

Wisal is a comprehensive platform that bridges the gap between social activism and accessible legal support. It combines a vibrant activism hub with an AI-powered legal advice marketplace, creating a unique ecosystem where social movements and legal expertise converge.

## 🎯 Key Features

### 📢 Social Activism Hub
- **Verified Activist Forum** - Share news, stories, and urgent updates
- **Community Engagement** - Connect with like-minded individuals and movements
- **Real-time Updates** - Stay informed about ongoing social issues
- **Private Forums** - Secure spaces for sensitive discussions

### ⚖️ Legal Advice Marketplace
- **AI-Powered Matching** - Intelligent pairing of legal needs with professional expertise
- **Verified Lawyers** - LinkedIn-authenticated legal professionals
- **Asynchronous Chat** - Respect both parties' time with flexible communication
- **Transparent Credentials** - Clear visibility of lawyer experience and specializations

### 🤖 Advanced AI Integration
- **LangChain/LangGraph** - Sophisticated query processing and lawyer matching
- **Elasticsearch** - Lightning-fast search across legal queries and forum content
- **Smart Categorization** - Automatic tagging and routing of legal questions
- **Neural Search** - Context-aware search results using embeddings

## 🚀 Quick Start

### Option 1: Docker (Recommended - 2 Steps!)

```bash
# 1. Create environment file
cat > .env.docker << EOF
OPENAI_API_KEY=your_openai_api_key_here
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
EOF

# 2. Start everything
docker-compose -f docker-compose.dev.yml up -d
```

**That's it!** Access the platform at:
- 🌐 **Frontend**: http://localhost:3000
- 🔌 **API**: http://localhost:4000

### Option 2: Local Development

```bash
# Setup environment
cp wisal/backend/.env.example wisal/backend/.env
cp wisal/frontend/.env.example wisal/frontend/.env

# Install and run
cd wisal && ./start-dev.sh
```

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Product Vision (PRD)](./PRD.md) | Detailed product requirements and roadmap |
| [Technical Documentation](./wisal/README.md) | Architecture, API docs, and development guide |
| [Docker Guide](./DOCKER.md) | Comprehensive Docker setup, development, and production guide |
| [Environment Setup](./ENVIRONMENT_SETUP.md) | Complete guide to all environment variables and configuration |
| [OAuth Setup](./wisal/docs/OAUTH_FIX_SUMMARY.md) | LinkedIn OAuth configuration guide |
| [API Documentation](./wisal/backend/API_DOCUMENTATION.md) | Complete API reference with examples |

## 🏗️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** + Radix UI
- **Zustand** - State management
- **Socket.IO** - Real-time features

### Backend
- **Node.js** + Express + TypeScript
- **MongoDB** with Mongoose ODM
- **Redis** - Session management
- **Elasticsearch** - Advanced search
- **LangChain** - AI orchestration

### Infrastructure
- **Docker** & Docker Compose
- **Nginx** - Reverse proxy
- **JWT** + Passport.js - Authentication
- **LinkedIn OAuth** - Professional verification

## 🗂️ Project Structure

```
DD-25/
├── wisal/                    # Main application
│   ├── frontend/            # React frontend
│   ├── backend/             # Node.js API
│   └── scripts/             # Utility scripts
├── docker-compose.dev.yml   # Docker development setup
├── PRD.md                   # Product requirements
└── docs/                    # Additional documentation
```

## 🔒 Security Features

- **JWT-based authentication** with refresh token rotation
- **LinkedIn OAuth** for verified professional profiles
- **Rate limiting** on all API endpoints
- **Input validation** and sanitization
- **CORS** and **XSS** protection
- **Encrypted communications** via HTTPS

## 🧪 Development

### Running Tests
```bash
cd wisal/backend && npm test
```

### Code Quality
```bash
npm run lint
npm run format
```

### Building for Production
```bash
# Backend
cd wisal/backend && npm run build

# Frontend
cd wisal/frontend && npm run build
```

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is proprietary and confidential. All rights reserved.

---

<div align="center">
  <strong>Built with ❤️ for social justice and accessible legal support</strong>
  <br>
  <sub>Empowering communities through technology</sub>
</div>