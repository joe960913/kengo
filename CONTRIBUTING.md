# Contributing to Kengo 🤝

First off, thank you for considering contributing to Kengo! It's people like you that make Kengo such a great tool. We welcome contributions from everyone, whether it's a bug report, feature request, documentation improvement, or code contribution.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Pull Requests](#pull-requests)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Style Guide](#style-guide)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Release Process](#release-process)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please be respectful and considerate in all interactions.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Create a new branch for your contribution
4. Make your changes
5. Push to your fork and submit a pull request

## How Can I Contribute?

### Reporting Bugs 🐛

Before creating bug reports, please check existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

**Bug Report Template:**

````markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:

1. Define schema '...'
2. Call method '...'
3. See error

**Expected behavior**
What you expected to happen.

**Code Example**

```typescript
// Your code here
```
````

**Environment:**

- Kengo version: [e.g., 1.0.0]
- Browser: [e.g., Chrome 120]
- OS: [e.g., macOS 14]
- Node version: [e.g., 20.10.0]

**Additional context**
Any other context about the problem.

````

### Suggesting Enhancements 💡

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

**Feature Request Template:**
```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Any alternative solutions or features you've considered.

**Code Example**
```typescript
// How you'd like to use the feature
const result = await db.users.newFeature({
  // ...
})
````

**Additional context**
Any other context or screenshots.

````

### Pull Requests 🚀

1. **Follow the style guide** - Use the existing code style
2. **Write tests** - Ensure your changes are covered by tests
3. **Update documentation** - Keep README and API docs in sync
4. **Small, focused changes** - One feature/fix per PR
5. **Clear description** - Explain what and why

**Pull Request Template:**
```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where necessary
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing unit tests pass locally
- [ ] Any dependent changes have been merged

## Related Issues
Closes #(issue number)
````

## Development Setup

### Prerequisites

- Node.js >= 18
- Bun (recommended) or npm/yarn/pnpm

### Installation

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/kengo.git
cd kengo

# Install dependencies
bun install

# Run tests
bun test

# Run tests in watch mode
bun test:watch

# Build the project
bun run build

# Run linting
bun run lint

# Format code
bun run format
```

## Project Structure

```
kengo/
├── src/
│   ├── core/           # Core functionality
│   │   ├── client.ts   # Main Kengo client
│   │   ├── connection.ts # Database connection
│   │   ├── query-builder.ts # Query building logic
│   │   └── schema.ts   # Schema definition
│   ├── operations/     # CRUD operations
│   │   ├── base-store.ts
│   │   ├── store.ts
│   │   └── transaction-store.ts
│   ├── types/          # TypeScript types
│   └── index.ts        # Main export
├── test/               # Test files
├── docs/               # Documentation
└── examples/           # Example usage
```

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 2. Make Your Changes

- Write clean, readable code
- Add/update tests
- Update documentation if needed

### 3. Test Your Changes

```bash
# Run all tests
bun test

# Run specific test file
bun test crud.test.ts

# Run with coverage
bun test:coverage
```

### 4. Commit Your Changes

Follow our commit message guidelines (see below).

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Testing

### Writing Tests

Tests are written using Vitest. Place test files in the `test/` directory.

```typescript
import { describe, it, expect } from 'vitest'
import { Kengo, defineSchema } from '../src'

describe('Feature Name', () => {
  it('should do something', async () => {
    // Arrange
    const schema = defineSchema({
      version: 1,
      stores: {
        users: {
          '@@id': { keyPath: 'id', autoIncrement: true },
        },
      },
    })

    const db = new Kengo({ name: 'test-db', schema })

    // Act
    const result = await db.users.create({
      data: { name: 'Test' },
    })

    // Assert
    expect(result).toBeDefined()
    expect(result.name).toBe('Test')
  })
})
```

### Test Coverage

We aim for high test coverage. Check coverage with:

```bash
bun test:coverage
```

## Style Guide

### TypeScript

- Use TypeScript for all code
- Enable strict mode
- Prefer interfaces over type aliases for objects
- Use meaningful variable names
- Document complex logic with comments

### Code Formatting

We use Prettier for code formatting. Run formatting with:

```bash
bun run format
```

### Linting

We use ESLint for linting. Run linting with:

```bash
bun run lint
```

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Test additions or corrections
- **chore**: Maintenance tasks
- **ci**: CI/CD changes

### Examples

```bash
# Feature
git commit -m "feat(store): add support for compound indexes"

# Bug fix
git commit -m "fix(transaction): prevent nested transactions"

# Documentation
git commit -m "docs(readme): update API examples"

# Breaking change
git commit -m "feat(schema): change schema definition format

BREAKING CHANGE: Schema definition now requires version field"
```

## Release Process

Releases are managed by maintainers. The process:

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create a git tag
4. Push to GitHub
5. GitHub Actions handles npm publishing

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

## Questions?

Feel free to:

- Open an issue for questions
- Start a discussion in GitHub Discussions
- Reach out to maintainers

## Recognition

Contributors will be recognized in:

- The README contributors section
- Release notes
- The project's contributors page

Thank you for contributing to Kengo! 🎉

---

<div align="center">
  <strong>Happy Coding! ⚔️</strong>
</div>
