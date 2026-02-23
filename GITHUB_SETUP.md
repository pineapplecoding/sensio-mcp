# GitHub Repository Setup Guide

This guide will help you push the Sensio MCP Server to your GitHub repository at https://github.com/pineapplecoding/sensio-mcp

## Files Ready for GitHub

### ✅ Files to Commit (Public)

**Core Files:**
- `src/` - All TypeScript source files
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `.gitignore` - Excludes sensitive files
- `LICENSE` - MIT License

**Documentation:**
- `README.md` - Main public documentation
- `CUSTOMER_SETUP.md` - Detailed setup guide
- `WEBSITE_DOCUMENTATION.md` - Integration overview
- `EXAMPLES.md` - Sample queries and responses
- `DEPLOYMENT.md` - Deployment guide
- `.env.example` - Configuration template

**Scripts:**
- `scripts/setup.sh` - Initial setup script
- `scripts/verify.sh` - Verification script

### ❌ Files NOT to Commit (Excluded by .gitignore)

**Sensitive:**
- `.env` - Your actual credentials
- `.env.test` - Test credentials
- `.env.local` - Local overrides

**Build Output:**
- `dist/` - Compiled JavaScript (users build their own)
- `node_modules/` - Dependencies (users install their own)

**Internal/Test Files:**
- `test-api.js` - Internal API tests
- `test-api-v2.js` - Internal API tests
- `test-auth-formats.js` - Internal tests
- `test-mcp-server.js` - Internal tests
- `TEST_RESULTS.md` - Internal test results
- `GET_API_KEY.md` - Internal notes
- `SENSIO_MCP_SUMMARY.md` - Internal summary
- `MCP_SERVER_COMPLETE.md` - Internal docs

## Push to GitHub

### Step 1: Initialize Git (if not already done)

```bash
cd /Users/cyrillenajjar/Downloads/indoor-data-dashboard-nov1/mcp-server
git init
```

### Step 2: Add Remote

```bash
git remote add origin https://github.com/pineapplecoding/sensio-mcp.git
```

### Step 3: Stage Files

```bash
# Add all files (gitignore will exclude sensitive ones)
git add .

# Verify what will be committed
git status
```

### Step 4: Commit

```bash
git commit -m "Initial release: Sensio Air MCP Server v1.0.0

- Connect Sensio Air sensors to AI assistants
- Support for Claude Desktop, Windsurf, Cline, Continue
- 4 tools: list devices, get latest, get history, get particle breakdown
- Secure local API key storage
- Smart caching and rate limiting
- Comprehensive documentation"
```

### Step 5: Push to GitHub

```bash
# Push to main branch
git branch -M main
git push -u origin main
```

## Verify on GitHub

After pushing, verify:

1. Go to https://github.com/pineapplecoding/sensio-mcp
2. Check that README.md displays correctly
3. Verify `.env.test` is NOT visible (should be gitignored)
4. Confirm all documentation files are present
5. Check that LICENSE file is visible

## Create a Release (Optional)

### Tag the Release

```bash
git tag -a v1.0.0 -m "Version 1.0.0 - Initial public release"
git push origin v1.0.0
```

### Create GitHub Release

1. Go to https://github.com/pineapplecoding/sensio-mcp/releases
2. Click "Create a new release"
3. Select tag `v1.0.0`
4. Title: "v1.0.0 - Initial Release"
5. Description:
   ```markdown
   # Sensio Air MCP Server v1.0.0
   
   First public release of the Sensio MCP Server!
   
   ## Features
   - 🔒 Secure local API key storage
   - 📊 Real-time air quality data
   - 🦠 Allergen tracking
   - 📈 Historical data queries
   - ⚡ Smart caching
   
   ## Supported AI Assistants
   - Claude Desktop
   - Windsurf
   - Cline
   - Continue
   
   ## Quick Start
   See [README.md](https://github.com/pineapplecoding/sensio-mcp#quick-start) for installation instructions.
   ```
6. Click "Publish release"

## Next Steps

### 1. Add Topics to Repository

On GitHub, add these topics to help discoverability:
- `mcp`
- `model-context-protocol`
- `claude`
- `ai-assistant`
- `air-quality`
- `sensio`
- `indoor-air-quality`
- `typescript`

### 2. Update Repository Description

Set description to:
> MCP server for Sensio Air quality sensors - Connect your air quality data to Claude, Windsurf, and other AI assistants

### 3. Enable Issues

Settings → Features → Enable Issues (for user support)

### 4. Add to Sensio Website

Add a link to the GitHub repo on sensio.co:
- Settings page: "AI Assistant Integration"
- Integrations page: New section for MCP
- Blog post: Announcing the integration

### 5. Share

- Tweet/social media announcement
- Post in MCP community Discord
- Share in Claude Desktop community
- Email to existing Sensio users

## Repository Structure

```
sensio-mcp/
├── .gitignore              # Excludes sensitive files
├── LICENSE                 # MIT License
├── README.md               # Main documentation
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── .env.example            # Configuration template
├── CUSTOMER_SETUP.md       # Setup guide
├── WEBSITE_DOCUMENTATION.md # Integration docs
├── EXAMPLES.md             # Usage examples
├── DEPLOYMENT.md           # Deployment guide
├── src/                    # Source code
│   ├── index.ts           # Full version (with Supabase)
│   ├── index-standalone.ts # Standalone version
│   ├── types.ts           # Type definitions
│   ├── config.ts          # Configuration
│   ├── cache.ts           # Caching layer
│   ├── sensio-api.ts      # API client
│   └── tools.ts           # MCP tools
└── scripts/               # Utility scripts
    ├── setup.sh
    └── verify.sh
```

## Maintenance

### Updating the Repository

```bash
# Make changes
git add .
git commit -m "Description of changes"
git push

# For new versions
git tag -a v1.1.0 -m "Version 1.1.0"
git push origin v1.1.0
```

### Handling Issues

- Respond to GitHub issues promptly
- Label issues appropriately (bug, enhancement, question)
- Close issues when resolved
- Reference issues in commit messages: `Fixes #123`

## Support

Users can get help through:
- GitHub Issues: Bug reports and feature requests
- README.md: Installation and configuration
- CUSTOMER_SETUP.md: Detailed setup instructions
- Sensio support: API and device issues
