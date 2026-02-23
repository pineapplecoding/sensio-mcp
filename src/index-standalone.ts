#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { sensioApi } from './sensio-api.js';
import { cacheManager, CacheManager } from './cache.js';
import {
  GetLatestInputSchema,
  GetHistoryInputSchema,
  GetParticleBreakdownInputSchema,
} from './types.js';
import { config } from 'dotenv';

config();

const SENSIO_API_KEY = process.env.SENSIO_API_KEY || '';
const ALLOWED_DEVICE_SERIALS = process.env.ALLOWED_DEVICE_SERIALS?.split(',') || [];

if (!SENSIO_API_KEY) {
  throw new Error('SENSIO_API_KEY environment variable is required');
}

const TOOLS: Tool[] = [
  {
    name: 'sensio_list_device_serials',
    description: 'List all configured Sensio device serials. Returns device serial numbers.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'sensio_get_latest',
    description: 'Get the latest indoor air quality readings for one or more devices. Returns current status, sensor data, air quality indices, and allergen levels.',
    inputSchema: {
      type: 'object',
      properties: {
        device_serials: {
          type: 'array',
          items: {
            type: 'string',
            pattern: '^SA\\d+$',
          },
          minItems: 1,
          description: 'Array of device serial numbers (e.g., ["SA123", "SA456"])',
        },
      },
      required: ['device_serials'],
    },
  },
  {
    name: 'sensio_get_history',
    description: 'Get historical indoor air quality data for a time window. Returns time-series data with configurable resolution for trend analysis.',
    inputSchema: {
      type: 'object',
      properties: {
        device_serials: {
          type: 'array',
          items: {
            type: 'string',
            pattern: '^SA\\d+$',
          },
          minItems: 1,
          description: 'Array of device serial numbers',
        },
        start: {
          type: 'string',
          format: 'date-time',
          description: 'Start timestamp in ISO 8601 format (e.g., "2025-03-13T00:00:00Z")',
        },
        end: {
          type: 'string',
          format: 'date-time',
          description: 'End timestamp in ISO 8601 format',
        },
        resolution: {
          type: 'string',
          enum: ['1m', '5m', '15m', '30m', '1h', '6h', '1d'],
          default: '15m',
          description: 'Time resolution for data aggregation',
        },
      },
      required: ['device_serials', 'start', 'end'],
    },
  },
  {
    name: 'sensio_get_particle_breakdown',
    description: 'Get detailed particle class breakdown for allergen analysis. Shows top contributing particle types (mold species, pollen types, etc.) for a time window.',
    inputSchema: {
      type: 'object',
      properties: {
        device_serial: {
          type: 'string',
          pattern: '^SA\\d+$',
          description: 'Single device serial number',
        },
        start: {
          type: 'string',
          format: 'date-time',
          description: 'Start timestamp in ISO 8601 format',
        },
        end: {
          type: 'string',
          format: 'date-time',
          description: 'End timestamp in ISO 8601 format',
        },
        top_k: {
          type: 'number',
          minimum: 1,
          maximum: 20,
          default: 5,
          description: 'Number of top particle classes to return',
        },
      },
      required: ['device_serial', 'start', 'end'],
    },
  },
];

class SensioMCPServerStandalone {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'sensio-air-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private validateDeviceAccess(deviceSerials: string[]): void {
    if (ALLOWED_DEVICE_SERIALS.length === 0) {
      return;
    }

    const unauthorized = deviceSerials.filter(
      serial => !ALLOWED_DEVICE_SERIALS.includes(serial)
    );

    if (unauthorized.length > 0) {
      throw new Error(
        `Access denied to device serials: ${unauthorized.join(', ')}. ` +
        `Allowed devices: ${ALLOWED_DEVICE_SERIALS.join(', ')}`
      );
    }
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: TOOLS,
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        let result: any;

        switch (name) {
          case 'sensio_list_device_serials': {
            if (ALLOWED_DEVICE_SERIALS.length === 0) {
              result = {
                devices: [],
                message: 'No devices configured. Set ALLOWED_DEVICE_SERIALS environment variable.',
              };
            } else {
              result = {
                devices: ALLOWED_DEVICE_SERIALS.map(serial => ({
                  device_serial: serial,
                  name: serial,
                })),
              };
            }
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

            const rawData = await sensioApi.fetchIndoorData(validated.device_serials);
            const deviceMap = new Map();
            
            for (const record of rawData) {
              const existing = deviceMap.get(record.device_serial);
              if (!existing || new Date(record.timestamp) > new Date(existing.timestamp)) {
                deviceMap.set(record.device_serial, record);
              }
            }

            const readings = Array.from(deviceMap.values()).map(raw => 
              sensioApi.normalizeReading(raw)
            );

            result = { readings };
            cacheManager.setLatest(cacheKey, result);
            break;
          }

          case 'sensio_get_history': {
            const validated = GetHistoryInputSchema.parse(args);
            this.validateDeviceAccess(validated.device_serials);

            const cacheKey = CacheManager.generateHistoryKey(
              validated.device_serials,
              validated.start,
              validated.end,
              validated.resolution
            );
            const cached = cacheManager.getHistory(cacheKey);
            if (cached) {
              result = cached;
              break;
            }

            const rawData = await sensioApi.fetchIndoorData(
              validated.device_serials,
              validated.start,
              validated.end
            );

            const deviceMap = new Map();
            for (const record of rawData) {
              if (!deviceMap.has(record.device_serial)) {
                deviceMap.set(record.device_serial, []);
              }
              deviceMap.get(record.device_serial)!.push(record);
            }

            const series = Array.from(deviceMap.entries()).map(([device_serial, records]) => {
              const points = records.map((r: any) => sensioApi.toHistoryPoint(r));
              const downsampled = sensioApi.downsampleHistory(points, validated.resolution);
              
              return {
                device_serial,
                points: downsampled,
              };
            });

            result = { series };
            cacheManager.setHistory(cacheKey, result);
            break;
          }

          case 'sensio_get_particle_breakdown': {
            const validated = GetParticleBreakdownInputSchema.parse(args);
            this.validateDeviceAccess([validated.device_serial]);

            const rawData = await sensioApi.fetchIndoorData(
              [validated.device_serial],
              validated.start,
              validated.end
            );

            const allClasses = new Map<string, number>();

            for (const record of rawData) {
              if (record.ml_particle_classes) {
                this.aggregateParticleClasses(record.ml_particle_classes, allClasses);
              }
            }

            const topClasses = Array.from(allClasses.entries())
              .map(([className, count]) => ({ class: className, count }))
              .sort((a, b) => b.count - a.count)
              .slice(0, validated.top_k);

            const latestRecord = rawData.length > 0 ? rawData[rawData.length - 1] : null;

            result = {
              device_serial: validated.device_serial,
              top_classes: topClasses,
              raw: latestRecord?.ml_particle_classes || {},
            };
            break;
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: errorMessage }, null, 2),
            },
          ],
          isError: true,
        };
      }
    });
  }

  private aggregateParticleClasses(
    classes: Record<string, any>,
    aggregated: Map<string, number>,
    prefix: string = ''
  ): void {
    for (const [key, value] of Object.entries(classes)) {
      const fullKey = prefix ? `${prefix}/${key}` : key;

      if (typeof value === 'number') {
        aggregated.set(fullKey, (aggregated.get(fullKey) || 0) + value);
      } else if (typeof value === 'object' && value !== null) {
        this.aggregateParticleClasses(value, aggregated, fullKey);
      }
    }
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Sensio MCP Server (Standalone) running on stdio');
  }
}

const server = new SensioMCPServerStandalone();
server.run().catch(console.error);
