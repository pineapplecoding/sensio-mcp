# Sensio Air MCP Server

Connect your Sensio Air quality sensors to AI assistants like Claude, Windsurf, and more!

## What is this?

This MCP (Model Context Protocol) server allows AI assistants to access your Sensio indoor air quality data in real-time. Ask natural language questions about your air quality, allergens, and environmental conditions.

## Quick Start

### Prerequisites

- Node.js 18+ installed
- A Sensio Air device and account
- Your Sensio API key (get from [sensio.co/settings](https://sensio.co/settings))
- Your device serial number(s)

### Installation

```bash
# Clone or download this repository
git clone <repository-url>
cd mcp-server

# Install dependencies
npm install

# Build the server
npm run build:standalone
```

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
        "/FULL/PATH/TO/mcp-server/dist/index.js"
      ],
      "env": {
        "SENSIO_API_KEY": "your_sensio_api_key_here",
        "ALLOWED_DEVICE_SERIALS": "DEVICE1,DEVICE2,DEVICE3"
      }
    }
  }
}
```

**Important**: Replace `/FULL/PATH/TO/mcp-server` with the actual absolute path to where you installed the MCP server.

#### For Windsurf

Add to your Windsurf MCP configuration:

```json
{
  "mcpServers": {
    "sensio-air": {
      "command": "node",
      "args": ["/FULL/PATH/TO/mcp-server/dist/index.js"],
      "env": {
        "SENSIO_API_KEY": "your_sensio_api_key_here",
        "ALLOWED_DEVICE_SERIALS": "DEVICE1,DEVICE2"
      }
    }
  }
}
```

#### For Other MCP Clients (Cline, Continue, etc.)

Follow the same pattern - provide the `node` command with the path to `dist/index.js` and the environment variables.

### Getting Your Credentials

1. **API Key**: 
   - Log in to [sensio.co](https://sensio.co)
   - Go to Settings → API Access
   - Copy your API key

2. **Device Serials**:
   - Go to your Devices page
   - Copy the serial number(s) of your device(s)
   - For multiple devices, separate with commas (no spaces): `DEVICE1,DEVICE2,DEVICE3`

### Restart Your AI Assistant

After adding the configuration:
- **Claude Desktop**: Completely quit and restart the app
- **Windsurf**: Restart the application
- **Other clients**: Follow their restart instructions

## Usage Examples

Once configured, you can ask your AI assistant:

### Air Quality Queries
- "What's my indoor air quality right now?"
- "Show me the current readings for all my devices"
- "Is my CO2 level healthy?"
- "What's the temperature and humidity?"

### Allergen Information
- "What allergens are elevated in my home?"
- "Show me the pollen levels"
- "Are there any mold spores detected?"
- "What's my overall allergen index?"

### Historical Data
- "Show me CO2 levels for the past 24 hours"
- "What was the air quality yesterday?"
- "Graph the temperature trend over the last week"

### Device Management
- "List all my Sensio devices"
- "Which devices are online?"

## Available Tools

The MCP server provides 4 tools:

1. **sensio_list_device_serials** - List your configured devices
2. **sensio_get_latest** - Get current air quality readings
3. **sensio_get_history** - Get historical data with time ranges
4. **sensio_get_particle_breakdown** - Get detailed allergen breakdown

## Configuration Options

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SENSIO_API_KEY` | Yes | - | Your Sensio API key |
| `ALLOWED_DEVICE_SERIALS` | Yes | - | Comma-separated device serials |
| `CACHE_TTL_LATEST` | No | 15 | Cache duration for latest readings (seconds) |
| `CACHE_TTL_HISTORY` | No | 300 | Cache duration for historical data (seconds) |
| `MAX_TIME_WINDOW_DAYS` | No | 30 | Maximum historical data window (days) |

### Example with All Options

```json
{
  "mcpServers": {
    "sensio-air": {
      "command": "node",
      "args": ["/path/to/mcp-server/dist/index.js"],
      "env": {
        "SENSIO_API_KEY": "your_api_key",
        "ALLOWED_DEVICE_SERIALS": "DEVICE1,DEVICE2",
        "CACHE_TTL_LATEST": "30",
        "CACHE_TTL_HISTORY": "600",
        "MAX_TIME_WINDOW_DAYS": "90"
      }
    }
  }
}
```

## Troubleshooting

### "Authentication credentials were not provided"
- Check that your API key is correct
- Ensure there are no extra spaces in the API key
- Verify the API key is active at sensio.co

### "Access denied to device"
- Verify the device serial is correct
- Check that the device is registered to your account
- Ensure device serials are comma-separated with no spaces

### AI assistant doesn't see the tools
- Ensure you completely restarted the AI assistant
- Check the path to `dist/index.js` is absolute (not relative)
- Verify Node.js is in your PATH
- Check the AI assistant's logs for errors

### "Module not found" errors
- Run `npm install` in the mcp-server directory
- Ensure you ran `npm run build:standalone`
- Check that `dist/index.js` exists

## Security & Privacy

- **API Key Security**: Your API key is stored locally in your AI assistant's configuration file. It is never sent to third parties.
- **Data Privacy**: All data requests go directly from your computer to Sensio's API. No intermediary servers.
- **Device Access**: The `ALLOWED_DEVICE_SERIALS` setting ensures you only access your own devices.

## Support

- **Documentation**: See `CUSTOMER_SETUP.md` for detailed setup instructions
- **Issues**: Report issues at [your-support-url]
- **Sensio Support**: For API key or device issues, contact Sensio support

## License

[Your License Here]

## About

Built for Sensio Air quality monitoring devices. Learn more at [sensio.co](https://sensio.co).
