#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { cacheManager, CacheManager } from './cache.js';
import {
  GetLatestInputSchema,
  GetHistoryInputSchema,
  GetParticleBreakdownInputSchema,
} from './types.js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const ALLOWED_DEVICE_SERIALS = process.env.ALLOWED_DEVICE_SERIALS?.split(',') || [];

if (!SUPABASE_URL) {
  throw new Error('SUPABASE_URL environment variable is required');
}

const TOOLS: Tool[] = [
  {
    name: 'sensio_list_device_serials',
    description: 'List all configured Sensio device serials.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'sensio_get_latest',
    description: 'Get the latest indoor air quality readings for one or more devices.',
    inputSchema: {
      type: 'object',
      properties: {
        device_serials: {
          type: 'array',
          items: { type: 'string' },
          minItems: 1,
        },
      },
      required: ['device_serials'],
    },
  },
  {
    name: 'sensio_get_history',
    description: 'Get historical indoor air quality data for a time window.',
    inputSchema: {
      type: 'object',
      properties: {
        device_serials: {
          type: 'array',
          items: { type: 'string' },
          minItems: 1,
        },
        start: { type: 'string', format: 'date-time' },
        end: { type: 'string', format: 'date-time' },
        resolution: {
          type: 'string',
          enum: ['1m', '5m', '15m', '30m', '1h', '6h', '1d'],
          default: '15m',
        },
      },
      required: ['device_serials', 'start', 'end'],
    },
  },
  {
    name: 'sensio_get_particle_breakdown',
    description: 'Get detailed particle class breakdown for allergen analysis.',
    inputSchema: {
      type: 'object',
      properties: {
        device_serial: { type: 'string' },
        start: { type: 'string', format: 'date-time' },
        end: { type: 'string', format: 'date-time' },
        top_k: { type: 'number', minimum: 1, maximum: 20, default: 5 },
      },
      required: ['device_serial', 'start', 'end'],
    },
  },
];

class SensioMCPServerSupabase {
  private server: Server;

  constructor() {
    this.server = new Server(
      { name: 'sensio-air-mcp-supabase', version: '1.0.0' },
      { capabilities: { tools: {} } }
    );
    this.setupHandlers();
  }

  private validateDeviceAccess(deviceSerials: string[]): void {
    if (ALLOWED_DEVICE_SERIALS.length === 0) return;
    const unauthorized = deviceSerials.filter(s => !ALLOWED_DEVICE_SERIALS.includes(s));
    if (unauthorized.length > 0) {
      throw new Error(`Access denied to: ${unauthorized.join(', ')}`);
    }
  }

  private async callSupabaseFunction(deviceSerials: string[], startDate?: string, endDate?: string): Promise<any> {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/fetch-sensio-air-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceSerials, startDate, endDate }),
    });

    if (!response.ok) {
      throw new Error(`Supabase function error: ${response.statusText}`);
    }

    return response.json();
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        let result: any;

        switch (name) {
          case 'sensio_list_device_serials': {
            result = {
              devices: ALLOWED_DEVICE_SERIALS.map(serial => ({
                device_serial: serial,
                name: serial,
              })),
            };
            break;
          }

          case 'sensio_get_latest': {
            const validated = GetLatestInputSchema.parse(args);
            this.validateDeviceAccess(validated.device_serials);

            const cacheKey = CacheManager.generateLatestKey(validated.device_serials);
            const cached = cacheManager.getLatest(cacheKey);
            if (cached) {
              result = cached;
              break;
            }

            const data = await this.callSupabaseFunction(validated.device_serials);
            
            const readings = data.devices.map((device: any) => ({
              device_serial: device.device_serial,
              timestamp: device.sensor.date_time,
              online: device.is_device_online,
              time_since_last_reading: device.time_since_last_reading,
              sensor: {
                temperature_c: device.sensor.temperature,
                humidity_pct: device.sensor.humidity,
                co2_ppm: device.sensor.co2,
                voc: device.sensor.voc,
              },
              indices: {
                co2: device.indices.co2,
                voc: device.indices.voc,
                pollution: device.indices.pollution,
              },
              allergens: {
                pollen: device.particles.indices.pollen,
                mites: device.particles.indices.mites,
                dander: device.particles.indices.dander,
                mold: device.particles.indices.mold,
                allergen: device.particles.indices.allergen,
              },
            }));

            result = { readings };
            cacheManager.setLatest(cacheKey, result);
            break;
          }

          case 'sensio_get_history': {
            const validated = GetHistoryInputSchema.parse(args);
            this.validateDeviceAccess(validated.device_serials);

            const data = await this.callSupabaseFunction(
              validated.device_serials,
              validated.start,
              validated.end
            );

            result = { series: [{ device_serial: validated.device_serials[0], points: [] }] };
            break;
          }

          case 'sensio_get_particle_breakdown': {
            const validated = GetParticleBreakdownInputSchema.parse(args);
            this.validateDeviceAccess([validated.device_serial]);

            const data = await this.callSupabaseFunction([validated.device_serial]);
            const device = data.devices[0];

            const classes = device.particles.classes;
            const topClasses: any[] = [];

            const flattenClasses = (obj: any, prefix = '') => {
              for (const [key, value] of Object.entries(obj)) {
                const fullKey = prefix ? `${prefix}/${key}` : key;
                if (typeof value === 'number') {
                  topClasses.push({ class: fullKey, count: value });
                } else if (typeof value === 'object') {
                  flattenClasses(value, fullKey);
                }
              }
            };

            flattenClasses(classes);
            topClasses.sort((a, b) => b.count - a.count);

            result = {
              device_serial: validated.device_serial,
              top_classes: topClasses.slice(0, validated.top_k),
              raw: classes,
            };
            break;
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }

        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: 'text', text: JSON.stringify({ error: errorMessage }, null, 2) }],
          isError: true,
        };
      }
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Sensio MCP Server (Supabase) running on stdio');
  }
}

const server = new SensioMCPServerSupabase();
server.run().catch(console.error);
