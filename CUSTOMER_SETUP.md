# Sensio MCP Server - Customer Setup Guide

**Simple setup for customers without technical infrastructure**

## What You Need

1. Your Sensio API key (from your dashboard)
2. Your device serial numbers (e.g., SA123, SA456)
3. Claude Desktop or compatible AI assistant

## Quick Setup (5 minutes)

### Step 1: Download & Install

Download the Sensio MCP Server package and extract it to a folder on your computer.

### Step 2: Configure Your Devices

1. Open the `mcp-server` folder
2. Copy `.env.standalone.example` to `.env`
3. Edit `.env` with your information:

```env
# Your Sensio API key (get from sensio.co/settings)
SENSIO_API_KEY=your_api_key_here

# Your device serial numbers (comma-separated, no spaces)
ALLOWED_DEVICE_SERIALS=SA123,SA456,SA789
```

**Where to find your device serials:**
- Log in to [sensio.co](https://sensio.co)
- Go to your devices page
- Copy the serial number (starts with "SA")

### Step 3: Build the Server

Open Terminal (Mac) or Command Prompt (Windows) and run:

```bash
cd path/to/mcp-server
npm install
npm run build:standalone
```

### Step 4: Connect to Claude Desktop

**For Mac:**

1. Open this file in a text editor:
   ```
   ~/Library/Application Support/Claude/claude_desktop_config.json
   ```

2. Add this configuration (update the path to match your computer):

```json
{
  "mcpServers": {
    "sensio-air": {
      "command": "node",
      "args": [
        "/Users/YOUR_USERNAME/path/to/mcp-server/dist/index.js"
      ],
      "env": {
        "SENSIO_API_KEY": "your_sensio_api_key",
        "ALLOWED_DEVICE_SERIALS": "SA123,SA456"
      }
    }
  }
}
```

**For Windows:**

1. Open this file:
   ```
   %APPDATA%\Claude\claude_desktop_config.json
   ```

2. Add this configuration:

```json
{
  "mcpServers": {
    "sensio-air": {
      "command": "node",
      "args": [
        "C:\\Users\\YOUR_USERNAME\\path\\to\\mcp-server\\dist\\index.js"
      ],
      "env": {
        "SENSIO_API_KEY": "your_sensio_api_key",
        "ALLOWED_DEVICE_SERIALS": "SA123,SA456"
      }
    }
  }
}
```

3. **Restart Claude Desktop** (completely quit and reopen)

### Step 5: Test It!

Open Claude and ask:

> "What Sensio devices do I have?"

Claude should respond with your device list!

Then try:

> "What's my air quality right now?"

## Configuration for Claude/Windsurf

### Minimal Configuration (Just API Key)

```json
{
  "mcpServers": {
    "sensio-air": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/dist/index.js"],
      "env": {
        "SENSIO_API_KEY": "your_api_key_here",
        "ALLOWED_DEVICE_SERIALS": "SA123,SA456,SA789"
      }
    }
  }
}
```

### Full Configuration (With Options)

```json
{
  "mcpServers": {
    "sensio-air": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/dist/index.js"],
      "env": {
        "SENSIO_API_KEY": "your_api_key_here",
        "ALLOWED_DEVICE_SERIALS": "SA123,SA456,SA789",
        "CACHE_TTL_LATEST": "15",
        "CACHE_TTL_HISTORY": "300",
        "MAX_TIME_WINDOW_DAYS": "30"
      }
    }
  }
}
```

## What You Can Ask

Once connected, try these questions:

**Current Status:**
- "What's my indoor air quality?"
- "Which room has the best air quality?"
- "Is my bedroom well-ventilated?"
- "What are my current CO2 levels?"

**Historical Analysis:**
- "Show me CO2 trends for the past 24 hours"
- "How was air quality yesterday?"
- "What were peak allergen levels this week?"

**Allergen Details:**
- "What allergens are detected in my bedroom?"
- "What type of mold is present?"
- "Break down the particle types"

**Multi-Room:**
- "Compare air quality in all rooms"
- "Which device has the highest CO2?"
- "Give me a summary of all sensors"

## Troubleshooting

### "I don't see my devices"

**Check:**
1. Your API key is correct in the config
2. Device serials are correct (format: SA123, SA456)
3. Devices are online at sensio.co
4. You restarted Claude Desktop completely

**Fix:**
```bash
# Verify your config
cat .env

# Should show:
# SENSIO_API_KEY=your_key
# ALLOWED_DEVICE_SERIALS=SA123,SA456
```

### "Access denied to device serials"

This means you're trying to query a device that's not in your `ALLOWED_DEVICE_SERIALS` list.

**Fix:** Add the device serial to your `.env` file:
```env
ALLOWED_DEVICE_SERIALS=SA123,SA456,SA789
```

Then rebuild:
```bash
npm run build:standalone
```

And restart Claude Desktop.

### "Server not found" in Claude

**Check:**
1. The path in `claude_desktop_config.json` is correct and absolute
2. The file exists: `ls /path/to/mcp-server/dist/index.js`
3. You've run `npm run build:standalone`

**Fix:**
```bash
# Get the absolute path
cd mcp-server
pwd
# Copy this path and use it in claude_desktop_config.json
```

### "No recent data"

**Check:**
1. Devices are powered on
2. Devices are connected to WiFi
3. Devices are reporting data at sensio.co

## Getting Your API Key

1. Go to [sensio.co](https://sensio.co)
2. Log in to your account
3. Click **Settings** → **API Access**
4. Copy your API key
5. Paste it in your `.env` file or Claude config

## Getting Your Device Serials

1. Go to [sensio.co/devices](https://sensio.co/devices)
2. Each device shows its serial number (e.g., SA123)
3. Copy all your device serials
4. Add them to `ALLOWED_DEVICE_SERIALS` separated by commas (no spaces)

Example:
```env
ALLOWED_DEVICE_SERIALS=SA123,SA456,SA789
```

## Security Notes

- Your API key is stored locally on your computer
- Data is only accessed when you ask questions
- No data is sent to third parties
- You can revoke your API key anytime from sensio.co

## Need Help?

- Email: support@sensio.co
- Check that your API key is active at sensio.co/settings
- Verify devices are online at sensio.co/devices
- Make sure you've restarted Claude Desktop completely

## Advanced: Custom Cache Settings

If you want faster responses (more cache) or fresher data (less cache):

```env
# Real-time monitoring (fresher data, more API calls)
CACHE_TTL_LATEST=5
CACHE_TTL_HISTORY=60

# Dashboard use (more cache, fewer API calls)
CACHE_TTL_LATEST=60
CACHE_TTL_HISTORY=900
```

---

**That's it!** You should now be able to ask Claude about your Sensio air quality data in natural language.
