# Contributing to MarineFlux

Thank you for your interest in contributing to MarineFlux! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork:
```bash
git clone https://github.com/your-username/marineflux.git
cd marineflux
```

3. Install dependencies:
```bash
npm install
```

4. Set up your environment variables (see `ENV-TEMPLATE.md`)

5. Run the development server:
```bash
npm run dev
```

## Development Workflow

### Branch Naming

- Feature: `feature/feature-name`
- Bug fix: `fix/bug-description`
- Hotfix: `hotfix/issue-description`
- Documentation: `docs/description`

### Commit Messages

Follow conventional commits format:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Example:
```
feat: add supplier rating system
fix: resolve authentication redirect issue
docs: update Firebase setup guide
```

### Pull Request Process

1. Create a new branch from `main`
2. Make your changes
3. Write or update tests if applicable
4. Update documentation if needed
5. Ensure all tests pass
6. Submit a pull request to `main`

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested?

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
```

## Code Style

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` type when possible
- Use meaningful variable names

### React Components

- Use functional components with hooks
- Keep components small and focused
- Use proper prop types
- Add JSDoc comments for complex components

### File Structure

```
component/
├── ComponentName.tsx      # Component code
├── index.ts              # Export
└── ComponentName.test.tsx # Tests (if applicable)
```

### Naming Conventions

- **Components**: PascalCase (`UserProfile.tsx`)
- **Functions**: camelCase (`getUserData`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_ITEMS`)
- **Files**: kebab-case for utilities (`format-date.ts`)

## Testing

### Running Tests

```bash
npm run test
```

### Writing Tests

- Write tests for new features
- Update tests when modifying existing features
- Aim for meaningful test coverage
- Use descriptive test names

## Internationalization (i18n)

### Adding Translations

1. Add keys to both `messages/tr.json` and `messages/en.json`
2. Use descriptive key names: `section.subsection.key`
3. Keep translations in sync

Example:
```json
{
  "common": {
    "save": "Save"
  },
  "user": {
    "profile": {
      "title": "User Profile"
    }
  }
}
```

### Using Translations

```typescript
import { useTranslations } from 'next-intl';

function Component() {
  const t = useTranslations('user.profile');
  return <h1>{t('title')}</h1>;
}
```

## Firebase

### Firestore

- Follow the existing data model
- Update security rules when adding collections
- Add indexes as needed
- Document new collections

### Security Rules

- Test rules thoroughly
- Never expose sensitive data
- Follow principle of least privilege

## UI/UX Guidelines

- Follow existing design patterns
- Ensure mobile responsiveness
- Maintain accessibility standards
- Use existing UI components when possible
- Add loading and error states

## Documentation

- Update README.md for significant changes
- Add JSDoc comments for complex functions
- Update API documentation if applicable
- Keep CHANGELOG.md updated

## Bug Reports

### Before Submitting

- Check existing issues
- Verify it's reproducible
- Collect relevant information

### Bug Report Template

```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment:**
- Browser:
- OS:
- Version:

**Additional context**
Any other relevant information
```

## Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Clear description of the problem

**Describe the solution**
How you envision the feature

**Describe alternatives**
Alternative solutions considered

**Additional context**
Mockups, examples, etc.
```

## Code Review

### For Reviewers

- Be constructive and respectful
- Explain the reasoning behind suggestions
- Approve when ready or request changes
- Check for:
  - Code quality
  - Test coverage
  - Documentation
  - Security issues

### For Contributors

- Be open to feedback
- Respond to comments promptly
- Make requested changes
- Ask questions if unclear

## Need Help?

- Check documentation
- Search existing issues
- Ask in discussions
- Contact maintainers

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

Thank you for contributing to MarineFlux! 🚢




