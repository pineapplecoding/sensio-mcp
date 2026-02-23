# Sensio MCP Server - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Configure Environment (2 min)

```bash
cd mcp-server
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
SENSIO_API_KEY=your_sensio_api_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...your_service_key
```

**Where to find these:**
- `SENSIO_API_KEY`: From your Sensio dashboard
- `SUPABASE_URL`: From Supabase project settings
- `SUPABASE_SERVICE_KEY`: From Supabase project settings → API → service_role key

### Step 2: Test with MCP Inspector (1 min)

```bash
npm run inspector
```

This opens an interactive UI where you can test all 4 tools.

**Try this:**
1. Click on `sensio_list_device_serials`
2. Click "Run Tool"
3. You should see your devices listed

### Step 3: Integrate with Claude Desktop (2 min)

**macOS:**
```bash
# Open Claude config
open ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Add this** (replace the path with your actual path):

```json
{
  "mcpServers": {
    "sensio-air": {
      "command": "node",
      "args": ["/Users/YOUR_USERNAME/Downloads/indoor-data-dashboard-nov1/mcp-server/dist/index.js"],
      "env": {
        "SENSIO_API_KEY": "your_sensio_api_key",
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_SERVICE_KEY": "your_service_key"
      }
    }
  }
}
```

**Restart Claude Desktop** completely (Cmd+Q, then reopen).

### Step 4: Test in Claude

Ask Claude:
> "What devices do I have connected to Sensio?"

Claude should use the `sensio_list_device_serials` tool and show your devices.

Then try:
> "What's the air quality in my living room right now?"

Claude should use `sensio_get_latest` and give you current readings.

## ✅ Verification Checklist

Run the verification script:

```bash
./scripts/verify.sh
```

You should see:
- ✅ Build directory exists
- ✅ Main entry point built
- ✅ .env file exists
- ✅ Required environment variables present
- ✅ Dependencies installed

## 🎯 Example Prompts for Claude

Once integrated, try these:

**Current Status:**
- "What's my indoor air quality right now?"
- "Which room has the best air quality?"
- "Is my bedroom well-ventilated?"

**Historical Analysis:**
- "Show me CO2 trends for the past 24 hours"
- "How was the air quality yesterday?"
- "What were the peak allergen levels this week?"

**Allergen Details:**
- "What type of mold is being detected?"
- "Break down the allergen particles in my office"
- "Which allergens are most prevalent?"

**Multi-Device:**
- "Compare air quality between all my rooms"
- "Which device is offline?"
- "Give me a summary of all my sensors"

## 🔧 Troubleshooting

### "Server not found" in Claude

1. Check the path in `claude_desktop_config.json` is absolute
2. Verify the path exists: `ls /path/to/mcp-server/dist/index.js`
3. Restart Claude Desktop completely (Cmd+Q)

### "Access denied" errors

1. Check your Supabase `user_devices` table has entries
2. Verify device serials match exactly (format: `SA123`)
3. Check `SUPABASE_SERVICE_KEY` is the service_role key, not anon key

### No devices returned

1. Verify you have devices in Supabase `user_devices` table
2. Check the `user_id` matches (currently hardcoded to `demo-user`)
3. Run a test query in Supabase SQL editor:
   ```sql
   SELECT * FROM user_devices WHERE user_id = 'demo-user';
   ```

### Build errors

```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

## 📊 What Each Tool Does

| Tool | Purpose | Example Use |
|------|---------|-------------|
| `sensio_list_device_serials` | List your devices | "What devices do I have?" |
| `sensio_get_latest` | Current readings | "What's my air quality now?" |
| `sensio_get_history` | Trends over time | "Show CO2 for past 24h" |
| `sensio_get_particle_breakdown` | Allergen details | "What type of mold?" |

## 🎓 Learning Path

**Day 1:** Get it running
- Complete Steps 1-4 above
- Test with MCP Inspector
- Ask Claude basic questions

**Day 2:** Explore capabilities
- Try all 4 tools via Claude
- Test historical queries
- Experiment with allergen breakdowns

**Day 3:** Advanced usage
- Multi-device comparisons
- Trend analysis
- Custom time windows

## 📝 Configuration Tips

### For Real-Time Monitoring
```env
CACHE_TTL_LATEST=5        # 5 second cache
CACHE_TTL_HISTORY=60      # 1 minute cache
```

### For Dashboard/Analytics
```env
CACHE_TTL_LATEST=60       # 1 minute cache
CACHE_TTL_HISTORY=900     # 15 minute cache
```

### For Development
```env
CACHE_TTL_LATEST=0        # No cache
CACHE_TTL_HISTORY=0       # No cache
```

## 🔗 Useful Commands

```bash
# Development with auto-reload
npm run dev

# Build for production
npm run build

# Test with inspector
npm run inspector

# Verify setup
./scripts/verify.sh

# Check logs (when running)
tail -f ~/.claude/logs/mcp-server.log
```

## 🎉 Success!

If you can ask Claude "What's my air quality?" and get a response with actual data, you're all set!

## 📚 Next Steps

- Read `README.md` for full API documentation
- Check `EXAMPLES.md` for more conversation examples
- Review `DEPLOYMENT.md` for production deployment
- See `SENSIO_MCP_SUMMARY.md` for architecture details

---

**Need Help?**
- Check the troubleshooting section above
- Review error messages in Claude Desktop logs
- Test individual tools with MCP Inspector
- Verify environment variables are set correctly
