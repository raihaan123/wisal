# Wisal Frontend

A modern React application for the Wisal legal services platform, built with TypeScript, Vite, and Tailwind CSS.

## 🏗️ Architecture Overview

The frontend follows a feature-based architecture with clear separation of concerns:

```
src/
├── components/       # Reusable UI components
├── pages/           # Route-level components
├── services/        # API integration layer
├── store/           # State management (Zustand)
├── hooks/           # Custom React hooks
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── config/          # Application configuration
└── styles/          # Global styles and themes
```

## 🚀 Features

### Core Features
- **Authentication**: JWT-based auth with LinkedIn OAuth integration
- **Real-time Chat**: WebSocket-powered consultations with lawyers
- **Forum System**: Public (Giscus) and private discussion forums
- **AI Search**: Enhanced search with AI-powered suggestions
- **Command Palette**: Quick navigation (Cmd/Ctrl + K)
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### User Roles
- **Seekers**: Legal advice seekers with consultation access
- **Lawyers**: Legal professionals offering services
- **Admins**: Platform administrators with full access

## 🛠️ Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand with persistence
- **API Client**: Axios with interceptors
- **Routing**: React Router v6
- **Real-time**: Socket.io client
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation

## 📁 Directory Structure

### Components (`/components`)
- **auth/**: Authentication guards and route protection
- **decorations/**: Visual decorative elements
- **forum/**: Forum-related components (threads, discussions)
- **layout/**: Application layouts (header, footer, sidebars)
- **news/**: News and article components
- **search/**: AI-powered search components
- **ui/**: Base UI components (shadcn/ui)

### Pages (`/pages`)
- **auth/**: Login, register, OAuth callback pages
- **consultations/**: Chat interface and consultation list
- **dashboard/**: Role-based dashboards
- **forum/**: Forum landing page
- **lawyers/**: Lawyer listing and profiles
- **news/**: News and articles listing

### Services (`/services`)
- **api.ts**: Base Axios instance with interceptors
- **authService.ts**: Authentication operations
- **chatService.ts**: Real-time chat functionality
- **consultationService.ts**: Consultation management
- **forumService.ts**: Forum operations
- **lawyerService.ts**: Lawyer-related API calls
- **newsService.ts**: News and articles fetching
- **socket.ts**: WebSocket connection management

### State Management (`/store`)
- **authStore.ts**: Authentication state (user, token, login/logout)
- **chatStore.ts**: Chat state (messages, active chats)

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:4000/api
VITE_SOCKET_URL=http://localhost:4000
VITE_LINKEDIN_CLIENT_ID=your_linkedin_client_id
```

### Giscus Configuration
Update `/src/config/giscus.config.ts` with your GitHub discussion settings for the public forum.

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run type checking
npm run type-check

# Run linting
npm run lint
```

## 🔐 Authentication Flow

1. **Local Auth**: Email/password with JWT tokens
2. **OAuth**: LinkedIn integration for professional verification
3. **Token Management**: Automatic refresh and interceptors
4. **Route Protection**: Role-based access control

## 🎨 Styling Guidelines

- **Design System**: Based on shadcn/ui components
- **Color Scheme**: Green/teal palette for legal theme
- **Responsive**: Mobile-first with Tailwind breakpoints
- **Accessibility**: ARIA labels and keyboard navigation

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📱 Mobile Considerations

- Touch-friendly interface elements
- Optimized bundle size for mobile networks
- Progressive enhancement approach
- Responsive images and lazy loading

## 🚀 Deployment

The frontend can be deployed to any static hosting service:

1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Configure environment variables on your hosting platform
4. Set up proper routing for SPA (redirect all routes to index.html)

### Recommended Platforms
- Vercel
- Netlify
- AWS S3 + CloudFront
- Cloudflare Pages

## 🔍 Code Quality

- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks

## 📚 Key Dependencies

- `react`: ^18.2.0
- `typescript`: ^5.2.2
- `vite`: ^5.0.8
- `tailwindcss`: ^3.4.0
- `zustand`: ^4.4.0
- `axios`: ^1.6.2
- `react-router-dom`: ^6.20.0
- `socket.io-client`: ^4.7.2
- `@radix-ui/*`: UI primitives
- `lucide-react`: Icon library

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is part of the Wisal platform. All rights reserved.