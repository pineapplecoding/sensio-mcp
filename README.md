# Sensio Air MCP Server

> Connect your Sensio Air quality sensors to AI assistants like Claude, Windsurf, and more!

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)

## 🌟 What is this?

This MCP (Model Context Protocol) server allows AI assistants to access your [Sensio Air](https://sensio.co) quality data in real-time. Ask natural language questions about your air quality, allergens, and environmental conditions directly in Claude Desktop, Windsurf, or any MCP-compatible AI assistant.

**Example queries:**
- "What's my indoor air quality right now?"
- "Show me the CO2 levels for the past 24 hours"
- "What allergens are elevated in my home?"
- "Is the air quality good or bad?"

## ✨ Features

- 🔒 **Secure**: Your API key stays local, direct connection to Sensio API
- 📊 **Real-time Data**: Current readings for temperature, humidity, CO2, VOC
- 🦠 **Allergen Tracking**: Pollen, mold, mites, and dander levels
- 📈 **Historical Data**: Query past readings with customizable time ranges
- ⚡ **Smart Caching**: Reduces API calls while keeping data fresh
- 🎯 **Device Scoping**: Control which devices are accessible

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** ([Download](https://nodejs.org/))
- **Sensio Air account** with API access ([Sign up](https://sensio.co))
- **AI Assistant**: Claude Desktop, Windsurf, Cline, or Continue

### Installation

```bash
# Clone the repository
git clone https://github.com/pineapplecoding/sensio-mcp.git
cd sensio-mcp

# Install dependencies
npm install

# Build the server
npm run build:standalone
```

### Get Your Credentials

1. **API Key**: 
   - Log in to [sensio.co](https://sensio.co)
   - Go to **Settings → API Access**
   - Copy your API key

2. **Device Serial(s)**:
   - Go to your **Devices** page
   - Copy your device serial number(s)

### Configuration

#### For Claude Desktop

**macOS**: Edit `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows**: Edit `%APPDATA%\Claude\claude_desktop_config.json`

Add this configuration:

```json
{
  "mcpServers": {
    "sensio-air": {
      "command": "node",
      "args": [
        "/ABSOLUTE/PATH/TO/sensio-mcp/dist/index.js"
      ],
      "env": {
        "SENSIO_API_KEY": "your_sensio_api_key_here",
        "ALLOWED_DEVICE_SERIALS": "DEVICE1,DEVICE2"
      }
    }
  }
}
```

**Important**: Replace `/ABSOLUTE/PATH/TO/sensio-mcp` with the full path where you cloned this repo.

#### For Windsurf

Add to your Windsurf MCP configuration:

```json
{
  "mcpServers": {
    "sensio-air": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/sensio-mcp/dist/index.js"],
      "env": {
        "SENSIO_API_KEY": "your_sensio_api_key_here",
        "ALLOWED_DEVICE_SERIALS": "DEVICE1,DEVICE2"
      }
    }
  }
}
```

#### For Cline (VS Code Extension)

Add to Cline's MCP settings in VS Code.

#### For Continue (VS Code Extension)

Add to `.continue/config.json` in your workspace.

### Restart & Test

1. **Completely quit and restart** your AI assistant
2. Ask: **"What's my indoor air quality?"**
3. The assistant should now have access to your Sensio data! 🎉

## 📖 Available Tools

The MCP server provides 4 tools:

### 1. `sensio_list_device_serials`

Lists your configured Sensio devices.

**Example**: "List my Sensio devices"

### 2. `sensio_get_latest`

Get current air quality readings.

**Example**: "Show me the current air quality readings"

**Returns**:
- Temperature (°C)
- Humidity (%)
- CO2 (ppm)
- VOC levels
- Air quality indices
- Allergen levels (pollen, mold, mites, dander)

### 3. `sensio_get_history`

Get historical data for a time range.

**Example**: "Show me CO2 levels for the past 24 hours"

**Parameters**:
- Time range (start/end)
- Resolution (1m, 5m, 15m, 30m, 1h, 6h, 1d)

### 4. `sensio_get_particle_breakdown`

Get detailed allergen breakdown.

**Example**: "What specific allergens are detected?"

**Returns**: Detailed particle classification (pollen types, mold species, etc.)

## ⚙️ Configuration Options

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SENSIO_API_KEY` | ✅ Yes | - | Your Sensio API key |
| `ALLOWED_DEVICE_SERIALS` | ✅ Yes | - | Comma-separated device serials |
| `CACHE_TTL_LATEST` | No | 15 | Cache duration for latest readings (seconds) |
| `CACHE_TTL_HISTORY` | No | 300 | Cache duration for historical data (seconds) |
| `MAX_TIME_WINDOW_DAYS` | No | 30 | Maximum historical data window (days) |

### Example with Custom Cache Settings

```json
{
  "env": {
    "SENSIO_API_KEY": "your_api_key",
    "ALLOWED_DEVICE_SERIALS": "DEVICE1,DEVICE2",
    "CACHE_TTL_LATEST": "30",
    "CACHE_TTL_HISTORY": "600",
    "MAX_TIME_WINDOW_DAYS": "90"
  }
}
```

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

- **Local API Key**: Your API key is stored locally in your AI assistant's config file
- **Direct Connection**: All requests go directly from your computer to Sensio's API
- **No Third Parties**: No intermediary servers or data collection
- **Device Control**: `ALLOWED_DEVICE_SERIALS` ensures you only access your own devices

## 📚 Documentation

- [Customer Setup Guide](./CUSTOMER_SETUP.md) - Detailed step-by-step instructions
- [Website Documentation](./WEBSITE_DOCUMENTATION.md) - Integration overview
- [Examples](./EXAMPLES.md) - Sample queries and responses

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details

## 🌐 About Sensio

Learn more about Sensio Air quality monitoring at [sensio.co](https://sensio.co)

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/pineapplecoding/sensio-mcp/issues)
- **Sensio Support**: For API or device issues, contact [Sensio support](https://sensio.co/support)

---

Made with ❤️ for the Sensio community
        {
          "t": "2025-03-13T00:00:00Z",
          "co2_ppm": 610,
          "voc": 110,
          "temperature_c": 22.1,
          "humidity_pct": 45,
          "allergen_index": 2
        }
      ]
    }
  ]
}
```

### 4. `sensio_get_particle_breakdown`

Get detailed allergen particle classification.

**Input**:
```json
{
  "device_serial": "SA123",
  "start": "2025-03-13T00:00:00Z",
  "end": "2025-03-14T00:00:00Z",
  "top_k": 5
}
```

**Output**:
```json
{
  "device_serial": "SA123",
  "top_classes": [
    { "class": "mold/Alternaria", "count": 120 },
    { "class": "mold/Cladosporium", "count": 80 },
    { "class": "pollen/Grass-Rice-JP", "count": 65 }
  ],
  "raw": {
    "unknown": 10,
    "mites": 12,
    "mold": { "Alternaria": 120, "Cladosporium": 80 }
  }
}
```

## Installation

```bash
cd mcp-server
npm install
```

## Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Fill in your credentials:
```env
SENSIO_API_URL=https://mlv3.sensioair.com/api/indoor_data/
SENSIO_API_KEY=your_api_key_here
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
```

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Testing with MCP Inspector
```bash
npm run inspector
```

## MCP Client Configuration

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "sensio-air": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/dist/index.js"],
      "env": {
        "SENSIO_API_KEY": "your_api_key",
        "SUPABASE_URL": "your_supabase_url",
        "SUPABASE_SERVICE_KEY": "your_service_key"
      }
    }
  }
}
```

### Other MCP Clients

The server uses stdio transport and can be integrated with any MCP-compatible client.

## Architecture

```
┌─────────────────┐
│   AI Assistant  │
└────────┬────────┘
         │ MCP Protocol
┌────────▼────────┐
│  MCP Server     │
│  - Auth Check   │
│  - Device Scope │
│  - Cache Layer  │
└────────┬────────┘
         │ HTTPS
┌────────▼────────┐
│  Sensio API     │
│  indoor_data/   │
└─────────────────┘
```

## Security

- **Device Scoping**: Validates all device serials against user ownership via Supabase
- **API Key Protection**: Backend API key never exposed to clients
- **Input Validation**: All inputs validated with Zod schemas
- **Time Window Limits**: Prevents excessive data queries

## Caching Strategy

- **Latest readings**: 15 second TTL (configurable)
- **Historical data**: 5 minute TTL (configurable)
- Cache keys include device serials and query parameters

## Development

### Project Structure
```
mcp-server/
├── src/
│   ├── index.ts          # Main MCP server
│   ├── tools.ts          # Tool implementations
│   ├── sensio-api.ts     # Sensio API client
│   ├── supabase.ts       # Supabase client
│   ├── cache.ts          # Cache manager
│   ├── config.ts         # Configuration
│   └── types.ts          # TypeScript types
├── package.json
├── tsconfig.json
└── README.md
```

### Adding New Tools

1. Define input schema in `types.ts`
2. Implement tool logic in `tools.ts`
3. Add tool definition to `TOOLS` array in `index.ts`
4. Add case handler in `CallToolRequestSchema` handler

## Troubleshooting

### "Access denied" errors
- Verify device serials belong to the authenticated user
- Check Supabase `user_devices` table

### "Time window exceeds maximum" errors
- Reduce the time range in your query
- Adjust `MAX_TIME_WINDOW_DAYS` in `.env`

### Cache not working
- Check `CACHE_TTL_*` environment variables
- Verify cache keys are being generated correctly

## License

MIT
