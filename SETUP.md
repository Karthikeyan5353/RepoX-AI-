# Setup Guide

## Development Environment Setup

### Prerequisites
- **Bun** (recommended) or Node.js 18+
- **Git**
- **GitHub account** with credentials configured
- **Supabase account** for backend services

### Installation Steps

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/repox.git
cd repox
```

#### 2. Install Dependencies
```bash
bun install
```

#### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# GitHub Integration
VITE_GITHUB_API_TOKEN=your_github_token

# API Endpoints (Optional)
VITE_API_URL=http://localhost:3000
```

#### 4. Initialize Supabase (if running locally)

```bash
supabase start
```

This will start the local Supabase instance with PostgreSQL, authentication, and other services.

### Running the Application

#### Development Server
```bash
bun run dev
```

The application will be available at `http://localhost:5173`

#### Production Build
```bash
bun run build
```

Output will be in the `dist/` directory.

#### Preview Production Build
```bash
bun run preview
```

### Database Setup

The project uses Supabase for database management. Migrations are located in `supabase/migrations/`.

To apply migrations:
```bash
supabase migration up
```

### Linting and Code Quality

Run ESLint to check code quality:
```bash
bun run lint
```

To automatically fix linting issues:
```bash
bun run lint --fix
```

### Troubleshooting

#### Port Already in Use
If port 5173 is already in use, Vite will automatically use the next available port.

#### Supabase Connection Issues
- Ensure Supabase services are running: `supabase status`
- Check environment variables are correctly set
- Verify network connectivity to Supabase server

#### Dependency Issues
Clear the cache and reinstall:
```bash
bun run clean
bun install
```

## Editor Configuration

### VSCode Extensions (Recommended)
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- ESLint
- Prettier

### Recommended Settings
Add to `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

## Next Steps

1. Read the main [README.md](./README.md) for project overview
2. Check [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines
3. Review the project structure in `src/`
4. Start developing!
