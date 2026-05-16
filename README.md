# RepoX - AI Code Reviewer

A modern AI-powered code review assistant that integrates with GitHub to provide intelligent pull request analysis and feedback.

## Overview

RepoX is a web-based application that leverages AI to help developers review pull requests, understand code changes, and maintain code quality. It provides real-time code analysis, suggestions, and collaborative features for development teams.

## Key Features

- **AI-Powered Code Review**: Automated analysis of pull requests with intelligent suggestions
- **File Explorer**: Browse and navigate repository structure
- **Code Viewer**: Syntax-highlighted code viewing with Monaco editor
- **PR Review Dashboard**: Comprehensive pull request management interface
- **Repository Management**: Track multiple repositories and their pull requests
- **Learning Hub**: Insights and learning from previous reviews
- **Chat Integration**: Interactive chat for discussing code and changes
- **Authentication**: Secure authentication via Supabase

## Tech Stack

### Frontend
- **React** - UI library
- **TanStack Router** - Client-side routing
- **TanStack React Query** - Data fetching and caching
- **Tailwind CSS** - Styling framework
- **Radix UI** - Accessible component library
- **Monaco Editor** - Advanced code editor and viewer

### Backend & Services
- **Supabase** - Authentication and database
- **Cloudflare** - Deployment and edge computing
- **Vite** - Build tool and dev server

### Development Tools
- **ESLint** - Code linting
- **Bun** - Package manager and runtime

## Getting Started

### Prerequisites
- Node.js or Bun runtime
- Git
- A GitHub account
- Supabase account (for backend services)

### Installation

```bash
# Install dependencies
bun install

# Set up environment variables
# Create a .env.local file with your Supabase credentials
```

### Development

```bash
# Start development server
bun run dev

# Run linter
bun run lint

# Build for production
bun run build

# Preview production build
bun run preview
```

## Project Structure

```
src/
├── components/        # React components
│   ├── ui/           # Reusable UI components
│   ├── AppLayout.jsx
│   ├── FileExplorer.jsx
│   ├── FileViewer.jsx
│   ├── PRReviewView.jsx
│   └── RepoChat.jsx
├── routes/           # TanStack Router routes
├── hooks/            # Custom React hooks
├── lib/              # Utility libraries
│   ├── ai-review.js
│   ├── github.js
│   ├── storage.js
│   └── utils.js
├── integrations/     # External service integrations
│   └── supabase/
└── styles/           # Global styles
```

## Configuration

- **Vite Configuration**: [vite.config.js](vite.config.js)
- **ESLint Configuration**: [eslint.config.js](eslint.config.js)
- **Tailwind Configuration**: [components.json](components.json)
- **Wrangler Configuration**: [wrangler.jsonc](wrangler.jsonc)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GITHUB_API_TOKEN=your_github_token
```

## Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run build:dev` - Build in development mode
- `bun run preview` - Preview production build
- `bun run lint` - Run ESLint

## Deployment

RepoX is configured to deploy on Cloudflare Workers. Use the Wrangler CLI for deployment:

```bash
wrangler deploy
```

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Code Quality

This project uses ESLint for code linting. Run the linter before committing:

```bash
bun run lint
```

## License

This project is private. All rights reserved.

## Support

For issues, questions, or feature requests, please create an issue in the repository.

---

Built with ❤️ using React, Tailwind CSS, and Supabase.
