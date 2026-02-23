// Environment variables are passed from AI assistant config or .env file
// No dotenv import needed - it causes JSON parsing errors with its output

export const CONFIG = {
  sensio: {
    apiUrl: process.env.SENSIO_API_URL || 'https://mlv3.sensioair.com/api/indoor_data/',
    apiKey: process.env.SENSIO_API_KEY || '',
  },
  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceKey: process.env.SUPABASE_SERVICE_KEY || '',
  },
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  cache: {
    ttlLatest: parseInt(process.env.CACHE_TTL_LATEST || '15', 10),
    ttlHistory: parseInt(process.env.CACHE_TTL_HISTORY || '300', 10),
    maxTimeWindowDays: parseInt(process.env.MAX_TIME_WINDOW_DAYS || '30', 10),
  },
};

export function validateConfig(): void {
  const required = [
    { key: 'SENSIO_API_KEY', value: CONFIG.sensio.apiKey },
    { key: 'SUPABASE_URL', value: CONFIG.supabase.url },
    { key: 'SUPABASE_SERVICE_KEY', value: CONFIG.supabase.serviceKey },
  ];

  const missing = required.filter(({ value }) => !value);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.map(({ key }) => key).join(', ')}`
    );
  }
}
