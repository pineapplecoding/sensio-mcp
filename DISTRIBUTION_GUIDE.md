# How to Distribute the Sensio MCP Server

## Distribution Options

### Option 1: GitHub Repository (Recommended)

**Pros**: Easy updates, version control, community contributions  
**Setup**:

1. Create a public GitHub repository (e.g., `sensio-air/mcp-server`)
2. Push the `mcp-server` folder
3. Users clone and install:
   ```bash
   git clone https://github.com/sensio-air/mcp-server.git
   cd mcp-server
   npm install
   npm run build:standalone
   ```

**Share**: `https://github.com/sensio-air/mcp-server`

### Option 2: NPM Package

**Pros**: Easiest for users, automatic updates  
**Setup**:

1. Publish to NPM:
   ```bash
   npm publish
   ```

2. Users install globally:
   ```bash
   npm install -g @sensio-air/mcp-server
   ```

3. Configuration points to global install:
   ```json
   {
     "command": "sensio-mcp-server",
     "env": { ... }
   }
   ```

### Option 3: Direct Download (ZIP)

**Pros**: No Git required  
**Setup**:

1. Create a release ZIP with built files
2. Host on your website
3. Users download, extract, and configure

## What to Include in Distribution

### Required Files
```
mcp-server/
├── dist/                    # Built JavaScript files
│   └── index.js            # Main entry point
├── node_modules/           # Dependencies (or package.json for install)
├── package.json            # Dependencies list
├── README_PUBLIC.md        # User-facing documentation
└── CUSTOMER_SETUP.md       # Step-by-step setup guide
```

### Optional Files
```
├── EXAMPLES.md             # Example queries
├── TROUBLESHOOTING.md      # Common issues
└── .env.example            # Configuration template
```

## User Requirements

Users need:
1. **Node.js 18+** installed
2. **Sensio account** with API access
3. **MCP-compatible AI assistant** (Claude Desktop, Windsurf, etc.)

## Configuration Template for Users

Provide this in your documentation:

```json
{
  "mcpServers": {
    "sensio-air": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/mcp-server/dist/index.js"],
      "env": {
        "SENSIO_API_KEY": "get_from_sensio.co_settings",
        "ALLOWED_DEVICE_SERIALS": "YOUR_DEVICE_SERIAL"
      }
    }
  }
}
```

## Where Users Add Configuration

### Claude Desktop
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

### Windsurf
- Settings → MCP Servers → Add Custom Server

### Cline (VS Code)
- VS Code Settings → Cline → MCP Servers

### Continue (VS Code)
- `.continue/config.json` in workspace

## Marketing/Documentation Pages

### On Your Website (sensio.co)

**Page**: `/integrations/ai-assistants` or `/mcp-server`

**Content**:
- What it does (connect Sensio to AI assistants)
- Supported AI assistants (Claude, Windsurf, etc.)
- Quick start guide
- Link to GitHub/download
- Video tutorial (optional)
- Example queries

**Call to Action**:
```
Get Started with AI Integration
→ Download MCP Server
→ View Setup Guide
→ Watch Tutorial
```

### In Your Dashboard

Add a section in user settings:
- "AI Assistant Integration"
- Link to MCP server setup
- Show their API key
- List their device serials
- Copy-paste ready configuration

## Support Strategy

### Documentation
- `README_PUBLIC.md` - Overview and quick start
- `CUSTOMER_SETUP.md` - Detailed step-by-step
- `TROUBLESHOOTING.md` - Common issues
- Video walkthrough (5-10 minutes)

### Support Channels
- GitHub Issues (for bugs)
- Email support (for setup help)
- FAQ section on website
- Community Discord/Slack

## Testing Before Release

Create test checklist:

- [ ] Fresh install on macOS works
- [ ] Fresh install on Windows works
- [ ] Claude Desktop integration works
- [ ] Windsurf integration works
- [ ] All 4 tools return correct data
- [ ] Error messages are helpful
- [ ] Documentation is clear
- [ ] API key validation works
- [ ] Device serial validation works

## Version Updates

When updating:

1. Update version in `package.json`
2. Create changelog
3. Tag release in Git
4. Notify users (email, blog post)
5. Update documentation

## Example Distribution Flow

### For GitHub Distribution:

1. **User discovers**: Blog post, website, social media
2. **User visits**: `https://github.com/sensio-air/mcp-server`
3. **User reads**: README_PUBLIC.md
4. **User clones**: `git clone ...`
5. **User installs**: `npm install && npm run build:standalone`
6. **User configures**: Adds to Claude Desktop config
7. **User tests**: Asks "What's my air quality?"
8. **User succeeds**: Shares on social media 🎉

## Analytics (Optional)

Track adoption:
- GitHub stars/clones
- NPM downloads
- Support tickets
- User feedback
- Social media mentions

## Legal Considerations

Include:
- License (MIT recommended for open source)
- Terms of use
- Privacy policy (data handling)
- API usage limits
- Disclaimer

## Ready to Ship Checklist

- [ ] Code tested and working
- [ ] Documentation complete
- [ ] README_PUBLIC.md finalized
- [ ] CUSTOMER_SETUP.md detailed
- [ ] GitHub repo created (if using)
- [ ] Website page created
- [ ] Support email set up
- [ ] License added
- [ ] Version 1.0.0 tagged
- [ ] Announcement prepared

## Current Status

✅ MCP server built and tested  
✅ API integration working  
✅ Documentation created  
✅ Configuration examples ready  
⏳ Choose distribution method  
⏳ Create GitHub repo or NPM package  
⏳ Add to sensio.co website  
⏳ Announce to users  

## Recommended Next Steps

1. **Create GitHub repository** at `sensio-air/mcp-server`
2. **Push code** with README_PUBLIC.md as main README
3. **Add to sensio.co** website under Integrations
4. **Soft launch** with beta testers
5. **Collect feedback** and iterate
6. **Public announcement** when stable
