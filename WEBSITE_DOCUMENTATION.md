# Sensio Air + AI Assistants

Connect your Sensio Air Quality Monitor to Claude, ChatGPT, and other AI assistants for natural language air quality insights.

## What You Can Do

Ask your AI assistant questions like:

- **"What's my indoor air quality right now?"**
- **"Show me CO2 trends for the past 24 hours"**
- **"Which room has the best air quality?"**
- **"What type of allergens are elevated in my bedroom?"**
- **"Has my office been well-ventilated today?"**

Your AI assistant will automatically query your Sensio devices and provide intelligent, conversational responses.

## How It Works

The Sensio MCP (Model Context Protocol) integration gives AI assistants secure access to your air quality data. Your assistant can:

✅ Check current readings across all your devices  
✅ Analyze historical trends and patterns  
✅ Identify specific allergen types (mold species, pollen, etc.)  
✅ Compare air quality between rooms  
✅ Provide personalized recommendations  

## Setup Guide

### For Claude Desktop Users

1. **Download the Sensio MCP Server**
   - Contact support or download from your Sensio dashboard

2. **Configure Your Credentials**
   - You'll need your Sensio API key (found in your dashboard)
   - Add it to the configuration file

3. **Add to Claude Desktop**
   - Open Claude Desktop settings
   - Add the Sensio integration
   - Restart Claude

4. **Start Asking Questions!**
   - "What devices do I have?"
   - "What's my air quality?"

### Detailed Setup Instructions

**Step 1: Get Your API Key**
1. Log in to your Sensio dashboard at [sensio.co](https://sensio.co)
2. Go to Settings → API Access
3. Copy your API key

**Step 2: Configure the Integration**

For **Claude Desktop** (macOS):
```bash
# Open Claude config
open ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

Add this configuration:
```json
{
  "mcpServers": {
    "sensio-air": {
      "command": "node",
      "args": ["/path/to/sensio-mcp-server/dist/index.js"],
      "env": {
        "SENSIO_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

**Step 3: Restart & Test**
1. Completely quit and restart Claude Desktop
2. Ask: "What Sensio devices do I have?"
3. Claude should list your devices!

## Use Cases

### 🏠 Home Monitoring
*"Give me a morning air quality report for all rooms"*

Your assistant checks all devices and provides a summary with any recommendations.

### 📊 Trend Analysis
*"How has CO2 been trending in my office this week?"*

Get insights on ventilation patterns and peak times.

### 🤧 Allergen Tracking
*"What allergens are elevated today?"*

Identify specific mold species, pollen types, and dust mite levels.

### 🔔 Smart Alerts
*"Alert me if CO2 goes above 1000 ppm in any room"*

Your assistant can monitor and notify you of concerning levels.

### 📈 Weekly Reports
*"Generate a weekly air quality summary with insights"*

Get automated reports with trends and recommendations.

## Privacy & Security

- Your API key is stored locally on your device
- Data is only accessed when you ask questions
- No data is shared with third parties
- You can revoke access anytime from your Sensio dashboard

## Supported AI Assistants

Currently supported:
- ✅ **Claude Desktop** (macOS, Windows)
- ✅ **Windsurf IDE**
- ✅ **Cline** (VS Code extension)

Coming soon:
- ChatGPT Desktop
- Custom integrations

## What Data Is Available

Your AI assistant can access:

**Current Readings:**
- Temperature & Humidity
- CO2 levels (with quality index)
- VOC (Volatile Organic Compounds)
- Pollution index
- Overall allergen levels

**Allergen Breakdown:**
- Pollen (with specific types)
- Dust mites
- Pet dander
- Mold (with species identification)

**Historical Data:**
- Up to 30 days of history
- Configurable time resolution (1 minute to 1 day)
- Trend analysis and patterns

## Example Conversations

### Morning Check-In
**You:** "Good morning! How's my air quality?"

**Claude:** "Good morning! I've checked all your Sensio devices. Overall air quality is good:
- Living Room: CO2 at 620 ppm (Low), temp 21.5°C
- Bedroom: CO2 at 580 ppm (Low), temp 20.2°C
- Office: CO2 at 890 ppm (Moderate) - might want to open a window

Allergen levels are low across all rooms. Have a great day!"

### Investigating Issues
**You:** "I've been sneezing a lot. What allergens are in my bedroom?"

**Claude:** "I've analyzed your bedroom's allergen data. The main contributors are:
1. Mold/Cladosporium (elevated)
2. Dust mites (moderate)
3. Pollen levels are low

The Cladosporium levels have been elevated for the past 3 days. This is a common indoor mold. Consider:
- Checking for moisture sources
- Improving ventilation
- Running a dehumidifier"

### Trend Analysis
**You:** "Has my office been well-ventilated this week?"

**Claude:** "Looking at your office CO2 levels over the past 7 days:
- Average: 720 ppm (Good)
- Peak: 1,100 ppm (reached 3 times, all around 2-3 PM)
- Overnight: 450 ppm (Excellent)

Overall ventilation is good, but you might want to open windows or take breaks during afternoon peaks when CO2 rises above 1000 ppm."

## Troubleshooting

### "I don't see my devices"
- Verify your API key is correct
- Check that devices are online in your Sensio dashboard
- Restart your AI assistant

### "Access denied" errors
- Confirm your API key is active
- Check you're using the correct Sensio account

### "No recent data"
- Ensure your devices are powered on and connected
- Check your WiFi connection
- Verify devices are reporting in your Sensio dashboard

## Get Started

Ready to connect your Sensio devices to AI assistants?

1. **[Download the integration](#)** - Get the MCP server
2. **[Get your API key](https://sensio.co/settings)** - From your dashboard
3. **[Follow setup guide](#setup-guide)** - 5 minute setup

Need help? Contact [support@sensio.co](mailto:support@sensio.co)

---

**Note:** This integration requires a Sensio Air Quality Monitor and a compatible AI assistant. The MCP server runs locally on your computer and does not send data to external servers except to query your own Sensio devices.
