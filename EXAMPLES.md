# Sensio MCP Server - Usage Examples

## Example Conversations with AI Assistants

### Example 1: Check Current Air Quality

**User**: "What's the air quality in my living room right now?"

**Assistant** (using MCP tools):
1. Calls `sensio_list_device_serials` to find devices
2. Identifies "Living Room" device (SA123)
3. Calls `sensio_get_latest` with `["SA123"]`
4. Responds: "Your living room air quality is good. CO2 is at 640 ppm (Low), temperature is 22.3°C, and allergen levels are low across all categories."

### Example 2: Compare Multiple Rooms

**User**: "Compare air quality between my bedroom and living room"

**Assistant**:
1. Calls `sensio_list_device_serials`
2. Calls `sensio_get_latest` with `["SA123", "SA456"]`
3. Compares readings and highlights differences

### Example 3: Historical Trend Analysis

**User**: "Show me CO2 levels for the past 24 hours in my office"

**Assistant**:
1. Calls `sensio_list_device_serials` to find office device
2. Calls `sensio_get_history` with:
   ```json
   {
     "device_serials": ["SA789"],
     "start": "2025-03-13T00:00:00Z",
     "end": "2025-03-14T00:00:00Z",
     "resolution": "1h"
   }
   ```
3. Analyzes trends and identifies peaks/patterns

### Example 4: Allergen Investigation

**User**: "What type of mold is being detected in my basement?"

**Assistant**:
1. Calls `sensio_list_device_serials` to find basement device
2. Calls `sensio_get_particle_breakdown` with:
   ```json
   {
     "device_serial": "SA999",
     "start": "2025-03-13T00:00:00Z",
     "end": "2025-03-14T00:00:00Z",
     "top_k": 10
   }
   ```
3. Reports: "The main mold species detected are Alternaria (120 particles) and Cladosporium (80 particles)"

## Direct API Testing

### Using MCP Inspector

```bash
npm run inspector
```

Then test each tool:

#### Test 1: List Devices
```json
{}
```

#### Test 2: Get Latest
```json
{
  "device_serials": ["SA123"]
}
```

#### Test 3: Get History
```json
{
  "device_serials": ["SA123"],
  "start": "2025-03-13T00:00:00Z",
  "end": "2025-03-14T00:00:00Z",
  "resolution": "15m"
}
```

#### Test 4: Get Particle Breakdown
```json
{
  "device_serial": "SA123",
  "start": "2025-03-13T00:00:00Z",
  "end": "2025-03-14T00:00:00Z",
  "top_k": 5
}
```

## Integration Examples

### Claude Desktop Prompts

Once configured, you can ask Claude:

- "What's my indoor air quality right now?"
- "Has CO2 been high today?"
- "Which room has the best air quality?"
- "Show me temperature trends for the past week"
- "What allergens are elevated in my bedroom?"
- "Is my office well-ventilated?"
- "Compare air quality between morning and evening"

### Automation Examples

#### Daily Summary

**Prompt**: "Give me a daily air quality summary for all my rooms"

**Assistant**:
1. Lists all devices
2. Gets latest readings for each
3. Generates summary report with recommendations

#### Alert Detection

**Prompt**: "Alert me if CO2 goes above 1000 ppm in any room"

**Assistant**:
1. Gets latest readings
2. Checks CO2 levels
3. Alerts if threshold exceeded

#### Weekly Report

**Prompt**: "Generate a weekly air quality report with trends and insights"

**Assistant**:
1. Gets 7-day history for all devices
2. Analyzes trends
3. Identifies patterns and anomalies
4. Provides recommendations

## Advanced Use Cases

### Multi-Device Analysis

```typescript
// Get latest from all devices
const devices = await sensio_list_device_serials();
const allSerials = devices.devices.map(d => d.device_serial);
const readings = await sensio_get_latest({ device_serials: allSerials });

// Find worst air quality
const worstRoom = readings.readings.reduce((worst, current) => {
  return current.indices.pollution.index > worst.indices.pollution.index 
    ? current 
    : worst;
});
```

### Correlation Analysis

```typescript
// Get history for multiple metrics
const history = await sensio_get_history({
  device_serials: ["SA123"],
  start: "2025-03-01T00:00:00Z",
  end: "2025-03-14T00:00:00Z",
  resolution: "1h"
});

// Analyze correlation between temperature and allergens
const points = history.series[0].points;
// ... correlation analysis
```

### Allergen Seasonal Tracking

```typescript
// Track allergen changes over time
const breakdown = await sensio_get_particle_breakdown({
  device_serial: "SA123",
  start: "2025-03-01T00:00:00Z",
  end: "2025-03-14T00:00:00Z",
  top_k: 20
});

// Identify seasonal patterns
const pollenTypes = breakdown.top_classes
  .filter(c => c.class.startsWith('pollen/'));
```

## Error Handling Examples

### Invalid Device Serial

```json
{
  "device_serials": ["INVALID123"]
}
```

**Response**:
```json
{
  "error": "Access denied: one or more device serials do not belong to this user"
}
```

### Time Window Too Large

```json
{
  "device_serials": ["SA123"],
  "start": "2024-01-01T00:00:00Z",
  "end": "2025-03-14T00:00:00Z"
}
```

**Response**:
```json
{
  "error": "Time window exceeds maximum of 30 days"
}
```

### Invalid Date Format

```json
{
  "device_serials": ["SA123"],
  "start": "2025-03-13",
  "end": "2025-03-14"
}
```

**Response**:
```json
{
  "error": "Invalid datetime format. Use ISO 8601 (e.g., 2025-03-13T00:00:00Z)"
}
```

## Performance Optimization

### Using Cache Effectively

```typescript
// First call - hits API
await sensio_get_latest({ device_serials: ["SA123"] });

// Second call within 15 seconds - returns cached
await sensio_get_latest({ device_serials: ["SA123"] });
```

### Batching Requests

```typescript
// Good - single request for multiple devices
await sensio_get_latest({ 
  device_serials: ["SA123", "SA456", "SA789"] 
});

// Bad - multiple requests
await sensio_get_latest({ device_serials: ["SA123"] });
await sensio_get_latest({ device_serials: ["SA456"] });
await sensio_get_latest({ device_serials: ["SA789"] });
```

### Choosing Resolution

```typescript
// For real-time monitoring (past hour)
resolution: "1m"

// For daily trends (past day)
resolution: "15m"

// For weekly trends (past week)
resolution: "1h"

// For monthly trends (past month)
resolution: "6h"
```

## Testing Checklist

- [ ] List all devices successfully
- [ ] Get latest reading for single device
- [ ] Get latest readings for multiple devices
- [ ] Get history with different resolutions
- [ ] Get particle breakdown
- [ ] Verify cache is working (check response times)
- [ ] Test with invalid device serial (should fail)
- [ ] Test with excessive time window (should fail)
- [ ] Test with invalid date format (should fail)
- [ ] Verify device scoping (user can't access others' devices)
