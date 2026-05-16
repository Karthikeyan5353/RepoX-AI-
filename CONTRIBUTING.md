# Contributing to RepoX

We appreciate your interest in contributing to RepoX! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a new branch** for your feature or fix
4. **Follow the setup instructions** in [SETUP.md](./SETUP.md)

## Development Workflow

### Creating a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or improvements

### Making Changes

1. Make your changes in the feature branch
2. Test your changes thoroughly
3. Run linter to ensure code quality:
   ```bash
   bun run lint
   ```
4. Commit with clear, descriptive messages

### Commit Message Guidelines

Write clear and concise commit messages:

```
<type>: <subject>

<body>

<footer>
```

#### Type
- `feat:` - A new feature
- `fix:` - A bug fix
- `docs:` - Documentation only changes
- `style:` - Changes that don't affect code meaning
- `refactor:` - Code change that neither fixes a bug nor adds a feature
- `test:` - Adding or updating tests

#### Example
```
feat: add file download functionality to code viewer

- Implement download button in FileViewer component
- Support multiple file format exports
- Add download progress indication

Closes #123
```

### Testing

Before submitting a PR, ensure:
- The application builds successfully: `bun run build`
- No linting errors: `bun run lint`
- All features work as expected in the dev server: `bun run dev`

## Pull Request Process

1. **Update your branch** with the latest main:
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Push your branch** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create a Pull Request** on GitHub with:
   - Clear title describing the changes
   - Detailed description of what changed and why
   - References to related issues (e.g., "Fixes #123")
   - Screenshots if UI changes were made

4. **Respond to reviews** promptly and professionally

### PR Review Guidelines

When reviewing PRs:
- Check code quality and adherence to standards
- Ensure tests are included for new features
- Verify documentation is updated
- Test locally if possible
- Provide constructive feedback

## Code Style

### JavaScript/React
- Use ES6+ syntax
- Use arrow functions for callbacks
- Use const/let instead of var
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

Example:
```javascript
/**
 * Analyzes a file for code quality issues
 * @param {string} fileContent - The content of the file
 * @returns {Promise<Object>} Analysis results
 */
export async function analyzeFile(fileContent) {
  // Implementation
}
```

### CSS/Tailwind
- Use Tailwind utility classes
- Avoid custom CSS unless necessary
- Follow mobile-first approach
- Use responsive prefixes (sm:, md:, lg:, etc.)

## Component Guidelines

When creating new components:

1. **Place in appropriate directory**:
   - UI components in `src/components/ui/`
   - Feature components in `src/components/`

2. **Use functional components** with hooks
3. **Export as named export**:
   ```javascript
   export function MyComponent({ prop1, prop2 }) {
     return <div>{/* JSX */}</div>;
   }
   ```

4. **Add PropTypes** or TypeScript types (if applicable)
5. **Keep components focused** - single responsibility principle

## File Structure

- `src/components/` - React components
- `src/lib/` - Utility functions and business logic
- `src/routes/` - TanStack Router routes
- `src/hooks/` - Custom React hooks
- `src/integrations/` - External service integrations

## Performance Considerations

- Use React Query for data fetching and caching
- Optimize images and assets
- Code split routes using TanStack Router
- Minimize bundle size
- Use lazy loading for heavy components

## Documentation

- Update README.md for major features
- Keep SETUP.md current with environment changes
- Add JSDoc comments to complex functions
- Document API integrations
- Keep inline comments for non-obvious logic

## Bug Reports

When reporting bugs, please include:
- Clear description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots/videos if applicable
- Your environment (OS, browser, versions)

## Feature Requests

When suggesting features, include:
- Clear description of the feature
- Use cases and benefits
- Possible implementation approach
- Any alternatives considered

## Questions?

Feel free to:
- Open an issue for questions
- Start a discussion in the repository
- Contact the maintainers

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

Thank you for contributing to RepoX! 🎉
