#!/bin/bash

# Quick script to push Sensio MCP Server to GitHub
# Repository: https://github.com/pineapplecoding/sensio-mcp

echo "🚀 Pushing Sensio MCP Server to GitHub..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in mcp-server directory"
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
fi

# Add remote if not exists
if ! git remote | grep -q "origin"; then
    echo "🔗 Adding GitHub remote..."
    git remote add origin https://github.com/pineapplecoding/sensio-mcp.git
fi

# Show what will be committed
echo "📋 Files to be committed:"
git status --short

echo ""
echo "⚠️  Files excluded by .gitignore (will NOT be committed):"
echo "   - .env, .env.test (your credentials)"
echo "   - dist/ (build output)"
echo "   - node_modules/ (dependencies)"
echo "   - test-*.js (internal tests)"
echo "   - TEST_RESULTS.md, etc. (internal docs)"

echo ""
read -p "Continue with commit? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Aborted"
    exit 1
fi

# Stage all files
echo "📦 Staging files..."
git add .

# Commit
echo "💾 Creating commit..."
git commit -m "Initial release: Sensio Air MCP Server v1.0.0

- Connect Sensio Air sensors to AI assistants
- Support for Claude Desktop, Windsurf, Cline, Continue
- 4 tools: list devices, get latest, get history, get particle breakdown
- Secure local API key storage
- Smart caching and rate limiting
- Comprehensive documentation"

# Push
echo "🚀 Pushing to GitHub..."
git branch -M main
git push -u origin main

# Tag release
echo "🏷️  Creating release tag..."
git tag -a v1.0.0 -m "Version 1.0.0 - Initial public release"
git push origin v1.0.0

echo ""
echo "✅ Successfully pushed to GitHub!"
echo ""
echo "🌐 View at: https://github.com/pineapplecoding/sensio-mcp"
echo ""
echo "📝 Next steps:"
echo "   1. Go to GitHub and verify files"
echo "   2. Create a release from tag v1.0.0"
echo "   3. Add repository topics (mcp, claude, air-quality, etc.)"
echo "   4. Update repository description"
echo "   5. Share with your users!"
