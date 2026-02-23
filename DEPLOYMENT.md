# Sensio MCP Server Deployment Guide

## Quick Start

### 1. Install Dependencies

```bash
cd mcp-server
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:
- `SENSIO_API_KEY`: Your Sensio API key from the dashboard
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_KEY`: Your Supabase service role key

### 3. Build the Server

```bash
npm run build
```

### 4. Test Locally

```bash
npm run inspector
```

This opens the MCP Inspector UI where you can test each tool interactively.

## Integration with AI Clients

### Claude Desktop

1. Locate your Claude Desktop config file:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

2. Add the Sensio MCP server:

```json
{
  "mcpServers": {
    "sensio-air": {
      "command": "node",
      "args": ["/Users/YOUR_USERNAME/path/to/mcp-server/dist/index.js"],
      "env": {
        "SENSIO_API_KEY": "your_sensio_api_key",
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_SERVICE_KEY": "your_service_key",
        "CACHE_TTL_LATEST": "15",
        "CACHE_TTL_HISTORY": "300",
        "MAX_TIME_WINDOW_DAYS": "30"
      }
    }
  }
}
```

3. Restart Claude Desktop

4. Verify the server is loaded by checking for the hammer icon (🔨) in Claude

### Windsurf IDE

Add to your Windsurf MCP configuration:

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

### Cline (VS Code Extension)

Add to your Cline settings:

```json
{
  "cline.mcpServers": {
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

## Production Deployment

### Option 1: Deploy as a Standalone Service

For HTTP-based MCP (requires MCP HTTP transport):

1. **Add HTTP server** (modify `src/index.ts`):

```typescript
import express from 'express';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';

const app = express();
app.use(express.json());

app.post('/mcp', async (req, res) => {
  const transport = new SSEServerTransport('/mcp', res);
  await server.connect(transport);
});

app.listen(3000, () => {
  console.log('MCP server listening on port 3000');
});
```

2. **Deploy to your platform**:
   - Vercel/Netlify: Use serverless functions
   - Railway/Render: Deploy as a Node.js app
   - Docker: Use the provided Dockerfile

### Option 2: Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

CMD ["node", "dist/index.js"]
```

Build and run:

```bash
docker build -t sensio-mcp .
docker run -p 3000:3000 \
  -e SENSIO_API_KEY=your_key \
  -e SUPABASE_URL=your_url \
  -e SUPABASE_SERVICE_KEY=your_key \
  sensio-mcp
```

### Option 3: Supabase Edge Function

Deploy as a Supabase Edge Function for seamless integration:

1. Create `supabase/functions/mcp-server/index.ts`
2. Copy the MCP server code
3. Deploy: `supabase functions deploy mcp-server`

## Authentication Setup

### Current Implementation (Demo Mode)

The server currently uses a hardcoded `demo-user` ID. For production:

### Option 1: Bearer Token Authentication

Modify `src/index.ts` to extract user from token:

```typescript
private async getUserFromRequest(headers: Record<string, string>): Promise<string> {
  const authHeader = headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }
  
  const token = authHeader.substring(7);
  const user = await supabaseClient.getUserFromToken(token);
  
  if (!user) {
    throw new Error('Invalid token');
  }
  
  return user.id;
}
```

### Option 2: API Key per User

Store user-specific API keys in Supabase and validate:

```typescript
async validateApiKey(apiKey: string): Promise<string> {
  const { data } = await supabase
    .from('user_api_keys')
    .select('user_id')
    .eq('api_key', apiKey)
    .single();
  
  return data?.user_id;
}
```

## Monitoring

### Logging

Add structured logging:

```bash
npm install pino
```

```typescript
import pino from 'pino';
const logger = pino();

logger.info({ tool: 'sensio_get_latest', userId }, 'Tool called');
```

### Metrics

Track usage with simple counters:

```typescript
const metrics = {
  toolCalls: new Map<string, number>(),
  errors: new Map<string, number>(),
};
```

### Health Check

Add a health endpoint:

```typescript
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0' });
});
```

## Troubleshooting

### Server won't start

1. Check environment variables are set
2. Verify Supabase credentials
3. Check Node.js version (requires 18+)

### Tools not appearing in Claude

1. Verify the server path is absolute
2. Check Claude Desktop logs
3. Restart Claude Desktop completely

### "Access denied" errors

1. Verify user has devices in `user_devices` table
2. Check device serial format (must be `SA` + numbers)
3. Verify Supabase RLS policies allow access

### Cache issues

1. Clear cache: restart the server
2. Adjust TTL values in `.env`
3. Check cache key generation

## Performance Tuning

### Cache Configuration

Adjust based on your use case:

```env
# Real-time monitoring (shorter cache)
CACHE_TTL_LATEST=5
CACHE_TTL_HISTORY=60

# Dashboard/analytics (longer cache)
CACHE_TTL_LATEST=60
CACHE_TTL_HISTORY=900
```

### Rate Limiting

Add rate limiting for production:

```bash
npm install express-rate-limit
```

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use('/mcp', limiter);
```

## Security Checklist

- [ ] Never expose `SENSIO_API_KEY` to clients
- [ ] Use HTTPS in production
- [ ] Implement proper authentication
- [ ] Validate all user inputs
- [ ] Set appropriate CORS headers
- [ ] Enable rate limiting
- [ ] Monitor for suspicious activity
- [ ] Rotate API keys regularly
- [ ] Use environment variables for secrets
- [ ] Enable Supabase RLS policies

## Updating

```bash
cd mcp-server
git pull
npm install
npm run build
# Restart your MCP client
```

## Support

For issues or questions:
1. Check the README.md
2. Review error logs
3. Test with MCP Inspector
4. Check Supabase logs for auth issues
