# CI/CD Workflows

This project uses GitHub Actions for continuous integration and deployment.

## Workflows

### 🧪 Tests (`test.yml`)

- **Triggers**: Push to main, Pull requests
- **Matrix**: Tests against Node.js 18.x, 20.x, and 22.x
- **Actions**:
  - Type checking
  - Linting
  - Format checking
  - Unit tests
  - Build verification
  - Bundle size check
  - Code coverage reporting to Codecov

### 📦 Release (`release.yml`)

- **Triggers**:
  - Push tags matching `v*`
  - Manual workflow dispatch
- **Actions**:
  - Runs full test suite
  - Publishes to npm with provenance
  - Creates GitHub release with auto-generated notes
- **Requirements**:
  - `NPM_TOKEN` secret must be configured

### 🔍 Pull Request (`pr.yml`)

- **Triggers**: Pull request events
- **Actions**:
  - Bundle size analysis
  - Size limit enforcement
  - Dependency security review

### 🤖 Dependabot (`dependabot.yml`)

- **Schedule**: Weekly on Mondays
- **Scope**:
  - npm dependencies (grouped by type)
  - GitHub Actions updates
- **Auto-labeling**: Adds appropriate labels to PRs

## Setup Instructions

### 1. NPM Publishing Setup

1. Create an npm access token at https://www.npmjs.com/settings/[username]/tokens
2. Add it as `NPM_TOKEN` in repository secrets

### 2. Codecov Setup (Optional)

1. Sign up at https://codecov.io
2. Add repository
3. Add `CODECOV_TOKEN` to repository secrets

### 3. Release Process

#### Automated Release (Recommended)

```bash
# Create a new version tag
git tag v1.0.0
git push origin v1.0.0
```

#### Manual Release

1. Go to Actions tab
2. Select "Release" workflow
3. Click "Run workflow"
4. Enter version number
5. Click "Run workflow" button

## Badge Status

The README badges will show the actual CI status once workflows are triggered:

- Tests badge: Shows test workflow status
- Bundle size: Displayed in bundlephobia
- NPM version: Shows latest published version
