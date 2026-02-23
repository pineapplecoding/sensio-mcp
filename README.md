# Sensio Air MCP Server

> Ask your AI assistant about your indoor air quality in natural language

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)

Connect your [Sensio Air](https://sensio.co) sensors to Claude Desktop, Windsurf, or ChatGPT. Ask questions like:
- *"What's my indoor air quality right now?"*
- *"Show me CO2 levels for the past 24 hours"*
- *"What allergens are elevated?"*

## ✨ Features

- 🔒 Secure local API key storage
- 📊 Real-time air quality data (CO2, VOC, temperature, humidity)
- 🦠 Allergen tracking (pollen, mold, mites, dander)
- 📈 Historical data queries
- ⚡ Smart caching

## 🚀 Quick Start

### 1. Install

```bash
git clone https://github.com/pineapplecoding/sensio-mcp.git
cd sensio-mcp
npm install
npm run build:standalone
```

### 2. Get Credentials

- **API Key**: [sensio.co](https://sensio.co) → Settings → API Access
- **Device Serial**: Your Devices page

### 3. Configure

**Claude Desktop** - Edit config file:
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "preferences": {
    "sidebarMode": "chat",
    "coworkScheduledTasksEnabled": false
  },
  "mcpServers": {
    "sensio-air": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/sensio-mcp/dist/index.js"],
      "env": {
        "SENSIO_API_KEY": "YOUR_API_KEY",
        "ALLOWED_DEVICE_SERIALS": "YOUR_SERIAL"
      }
    }
  }
}
```

Replace `/ABSOLUTE/PATH/TO/sensio-mcp` with your actual path (e.g., `/Users/yourname/sensio-mcp`)

**Windsurf/Cline/Continue**: Use same config format above.

### 4. Restart & Test

Quit and restart your AI assistant, then ask: *"What's my indoor air quality?"*

## 🛠️ What You Can Ask

- *"What's my current air quality?"* - Latest readings
- *"Show CO2 for the past 24 hours"* - Historical data
- *"What allergens are elevated?"* - Particle breakdown
- *"List my devices"* - Configured sensors

## 💬 ChatGPT Integration

ChatGPT doesn't support MCP. Instead, create a **Custom GPT** with Actions:

1. Go to [ChatGPT GPT Editor](https://chat.openai.com/gpts/editor)
2. Follow the guide in [CHATGPT_INTEGRATION.md](./CHATGPT_INTEGRATION.md)

## ⚙️ Advanced Options

Optional environment variables:
- `CACHE_TTL_LATEST` - Cache duration for latest readings (default: 15s)
- `CACHE_TTL_HISTORY` - Cache duration for history (default: 300s)
- `MAX_TIME_WINDOW_DAYS` - Max historical window (default: 30 days)

See [CUSTOMER_SETUP.md](./CUSTOMER_SETUP.md) for detailed configuration.

## 🔧 Troubleshooting

### "Authentication credentials were not provided"
- ✅ Verify your API key is correct (no extra spaces)
- ✅ Check the API key is active at sensio.co/settings
- ✅ Ensure you're using the API key, not the account password

### "Access denied to device"
- ✅ Verify device serial is correct
- ✅ Check device is registered to your account
- ✅ Ensure serials are comma-separated with **no spaces**: `DEVICE1,DEVICE2`

### AI assistant doesn't see the tools
- ✅ **Completely quit and restart** the AI assistant (not just reload)
- ✅ Check the path to `dist/index.js` is **absolute** (starts with `/` or `C:\`)
- ✅ Verify Node.js is installed: `node --version`
- ✅ Check the AI assistant's logs for errors

### "Module not found" errors
- ✅ Run `npm install` in the sensio-mcp directory
- ✅ Run `npm run build:standalone`
- ✅ Verify `dist/index.js` exists

### Still having issues?
- Check [CUSTOMER_SETUP.md](./CUSTOMER_SETUP.md) for detailed setup instructions
- Open an [issue](https://github.com/pineapplecoding/sensio-mcp/issues) on GitHub

## 🔒 Security & Privacy

- Your API key stays local in your AI assistant config
- Direct connection to Sensio API (no third parties)
- Device scoping with `ALLOWED_DEVICE_SERIALS`

## 📚 Documentation

- [Detailed Setup Guide](./CUSTOMER_SETUP.md)
- [ChatGPT Integration](./CHATGPT_INTEGRATION.md)
- [Examples](./EXAMPLES.md)

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/pineapplecoding/sensio-mcp/issues)
- **Sensio Support**: [sensio.co/support]([https://sensio.co/support](https://www.sensio.co/inbound-enterprise))

## 📄 License

MIT License - see [LICENSE](./LICENSE)

---

Made with ❤️ for the Sensio community
