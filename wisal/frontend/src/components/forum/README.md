# Forum and Command Palette Implementation

## Overview

This implementation adds two major features to the Wisal platform:

1. **GitHub-style Forum** using Giscus
2. **Command Palette** using cmdk

## Forum Features

### Public Forum
- Integrated with GitHub Discussions via Giscus
- Three categories: General Discussion, Legal Advice, and Activism
- Real-time comments and reactions
- GitHub authentication for users

### Private Forum
- Custom implementation for escalated cases
- Thread-based discussions
- Role-based access (lawyers, seekers, admins)
- Confidential conversations
- Real-time messaging within threads

## Command Palette Features

### Access
- Keyboard shortcut: `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux)
- Quick search button in the header

### Commands Available
1. **Navigation**: Quick access to all pages
2. **Actions**: Create threads, schedule consultations, search
3. **AI Features**: Access AI assistants and tools
4. **User**: Profile, settings, logout

## Setup Instructions

### 1. Configure Giscus

1. Go to https://giscus.app/
2. Enter your GitHub repository details
3. Enable GitHub Discussions in your repository
4. Update `/src/config/giscus.config.ts` with your values:
   ```typescript
   export const giscusConfig = {
     repo: 'your-username/your-repo',
     repoId: 'your-repo-id',
     // ... other values from giscus
   }
   ```

### 2. Create GitHub Discussion Categories

In your GitHub repository:
1. Settings → Features → Enable Discussions
2. Go to Discussions tab
3. Create categories:
   - General
   - Legal Advice
   - Activism

### 3. Private Forum Backend Integration

The private forum requires backend endpoints:
- `POST /api/forum/threads` - Create new thread
- `GET /api/forum/threads` - List threads
- `POST /api/forum/threads/:id/messages` - Add message
- `GET /api/forum/threads/:id` - Get thread details

## Usage

### Forum Page
Navigate to `/forum` to access the community forum. Users with appropriate roles can switch between public and private forums.

### Command Palette
Press `Cmd+K` or `Ctrl+K` anywhere in the application to open the command palette. Start typing to search for commands.

## Components Structure

```
src/
├── components/
│   ├── forum/
│   │   ├── Forum.tsx          # Public forum with Giscus
│   │   ├── PrivateForum.tsx   # Private forum implementation
│   │   └── README.md          # This file
│   ├── CommandPalette.tsx     # Command palette component
│   └── layout/
│       └── Header.tsx         # Updated with command palette
├── pages/
│   └── forum/
│       └── ForumPage.tsx      # Main forum page
└── config/
    └── giscus.config.ts       # Giscus configuration
```

## Customization

### Adding New Commands
Edit `CommandPalette.tsx` and add new commands to the `commands` array:
```typescript
{
  id: 'unique-id',
  title: 'Command Title',
  description: 'Optional description',
  icon: IconComponent,
  action: () => { /* action */ },
  category: 'navigation' | 'actions' | 'ai' | 'help',
  keywords: ['search', 'terms']
}
```

### Styling
Both components use the existing Wisal design system and Tailwind classes. Modify as needed to match your brand.

## Security Considerations

1. **Private Forum**: Implement proper authentication and authorization on the backend
2. **Giscus**: Users need GitHub accounts to comment
3. **Command Palette**: Actions respect user authentication state

## Future Enhancements

1. **Forum**:
   - Email notifications for thread updates
   - Rich text editor for private forum
   - File attachments
   - Thread search and filtering

2. **Command Palette**:
   - Recent commands history
   - Custom keyboard shortcuts
   - Context-aware suggestions
   - AI-powered command predictions