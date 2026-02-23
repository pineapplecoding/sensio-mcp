# ChatGPT Integration for Sensio Air

ChatGPT doesn't support MCP, but you can integrate Sensio data using **Custom GPTs with Actions**.

## Option 1: Custom GPT with Actions (Best)

### Step 1: Create API Endpoints

You already have Supabase edge functions! Use them as API endpoints:

**Endpoint**: `https://zgmpigncjmpxoyunjgit.supabase.co/functions/v1/fetch-sensio-air-data`

### Step 2: Create OpenAPI Schema

Save this as `sensio-openapi.yaml`:

```yaml
openapi: 3.0.0
info:
  title: Sensio Air Quality API
  description: Get indoor air quality data from Sensio devices
  version: 1.0.0
servers:
  - url: https://zgmpigncjmpxoyunjgit.supabase.co/functions/v1
paths:
  /fetch-sensio-air-data:
    post:
      operationId: getAirQualityData
      summary: Get current air quality readings
      description: Fetch latest indoor air quality data from Sensio devices
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                deviceSerials:
                  type: array
                  items:
                    type: string
                  description: Array of device serial numbers
                  example: ["IYYEMN"]
                startDate:
                  type: string
                  format: date-time
                  description: Optional start date for historical data
                endDate:
                  type: string
                  format: date-time
                  description: Optional end date for historical data
              required:
                - deviceSerials
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: object
                properties:
                  devices:
                    type: array
                    items:
                      type: object
                      properties:
                        device_serial:
                          type: string
                        is_device_online:
                          type: boolean
                        sensor:
                          type: object
                          properties:
                            temperature:
                              type: number
                            humidity:
                              type: number
                            co2:
                              type: number
                            voc:
                              type: number
                        indices:
                          type: object
                        particles:
                          type: object
```

### Step 3: Create Custom GPT

1. Go to https://chat.openai.com/gpts/editor
2. Click **"Create a GPT"**
3. Configure:
   - **Name**: Sensio Air Quality Assistant
   - **Description**: Get real-time indoor air quality data from your Sensio devices
   - **Instructions**:
     ```
     You are an air quality assistant that helps users understand their indoor air quality data from Sensio devices.
     
     When users ask about their air quality:
     1. Call the getAirQualityData action with their device serials
     2. Interpret the data in a friendly, easy-to-understand way
     3. Provide health recommendations based on the readings
     4. Explain what CO2, VOC, temperature, humidity levels mean
     5. Alert them to any concerning allergen levels
     
     Always be helpful, clear, and health-focused.
     ```

4. **Actions**:
   - Click "Create new action"
   - Import the OpenAPI schema above
   - Set authentication to "None" (or API key if you add auth)

5. **Save and Test**

### Step 4: Test Your Custom GPT

Ask:
- "What's my indoor air quality?"
- "Show me current readings for device IYYEMN"
- "Are there any allergens I should worry about?"

## Option 2: ChatGPT Plugins (Legacy)

ChatGPT Plugins are being deprecated in favor of Custom GPTs with Actions.

## Option 3: Direct API Integration

For developers, you can call the Supabase edge function directly:

```javascript
const response = await fetch('https://zgmpigncjmpxoyunjgit.supabase.co/functions/v1/fetch-sensio-air-data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    deviceSerials: ['IYYEMN']
  })
});

const data = await response.json();
console.log(data);
```

## Comparison: MCP vs Custom GPT

| Feature | MCP (Claude/Windsurf) | Custom GPT (ChatGPT) |
|---------|----------------------|---------------------|
| Setup | Local config file | Web-based GPT builder |
| Privacy | Runs locally | API calls to OpenAI |
| Authentication | Local API key | Can use OAuth/API keys |
| Distribution | GitHub repo | Share GPT link |
| Updates | Git pull | Update GPT config |

## Recommended Approach

**For ChatGPT users:**
1. Create a Custom GPT with Actions (Option 1)
2. Use your existing Supabase edge function as the API
3. Share the Custom GPT link with users

**For Claude/Windsurf users:**
1. Use the MCP server (already working!)
2. Local, private, secure

## Next Steps for Custom GPT

Want me to:
1. Create the complete OpenAPI schema?
2. Set up authentication for the Supabase function?
3. Create a public Custom GPT you can share?

Let me know!
