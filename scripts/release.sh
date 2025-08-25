#!/bin/bash

# Release script for Kengo
# Usage: ./scripts/release.sh [major|minor|patch]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if version type is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Version type not specified${NC}"
    echo "Usage: $0 [major|minor|patch]"
    echo "Example: $0 patch"
    exit 1
fi

VERSION_TYPE=$1

# Validate version type
if [[ ! "$VERSION_TYPE" =~ ^(major|minor|patch)$ ]]; then
    echo -e "${RED}Error: Invalid version type '$VERSION_TYPE'${NC}"
    echo "Valid types: major, minor, patch"
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}Warning: You have uncommitted changes${NC}"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Release cancelled"
        exit 1
    fi
fi

# Ensure we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${YELLOW}Warning: Not on main branch (current: $CURRENT_BRANCH)${NC}"
    read -p "Switch to main and continue? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git checkout main
        git pull origin main
    else
        echo "Release cancelled"
        exit 1
    fi
fi

# Pull latest changes
echo "Pulling latest changes..."
git pull origin main

# Run tests
echo -e "${GREEN}Running tests...${NC}"
bun run test:run

# Run build
echo -e "${GREEN}Building project...${NC}"
bun run build

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "Current version: ${YELLOW}v$CURRENT_VERSION${NC}"

# Bump version
echo -e "${GREEN}Bumping $VERSION_TYPE version...${NC}"
npm version $VERSION_TYPE --no-git-tag-version

# Get new version
NEW_VERSION=$(node -p "require('./package.json').version")
echo -e "New version: ${GREEN}v$NEW_VERSION${NC}"

# Commit version bump
git add package.json
git commit -m "chore: release v$NEW_VERSION"

# Create and push tag
echo -e "${GREEN}Creating tag v$NEW_VERSION...${NC}"
git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION"

# Push changes
echo -e "${GREEN}Pushing to remote...${NC}"
git push origin main
git push origin "v$NEW_VERSION"

echo -e "${GREEN}✨ Release v$NEW_VERSION initiated!${NC}"
echo ""
echo "The GitHub Actions workflow will now:"
echo "  1. Run tests"
echo "  2. Publish to npm"
echo "  3. Create a GitHub release"
echo ""
echo "Monitor progress at: https://github.com/joe960913/kengo/actions"