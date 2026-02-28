#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { CONFIG, validateConfig } from './config.js';
import { sensioTools } from './tools.js';
import {
  ListDeviceSerialsInputSchema,
  GetLatestInputSchema,
  GetHistoryInputSchema,
  GetParticleBreakdownInputSchema,
} from './types.js';

validateConfig();

const TOOLS: Tool[] = [
  {
    name: 'sensio_list_device_serials',
    description: 'List all device serials available to the authenticated user. Returns device serial numbers and friendly names.',
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

class SensioMCPServer {
  private server: Server;
  private userId: string = CONFIG.sensio.userId;

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
            const validated = ListDeviceSerialsInputSchema.parse(args);
            result = await sensioTools.listDeviceSerials(this.userId);
            break;
          }

          case 'sensio_get_latest': {
            const validated = GetLatestInputSchema.parse(args);
            result = await sensioTools.getLatest(this.userId, validated);
            break;
          }

          case 'sensio_get_history': {
            const validated = GetHistoryInputSchema.parse(args);
            result = await sensioTools.getHistory(this.userId, validated);
            break;
          }

          case 'sensio_get_particle_breakdown': {
            const validated = GetParticleBreakdownInputSchema.parse(args);
            result = await sensioTools.getParticleBreakdown(this.userId, validated);
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

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Sensio MCP Server running on stdio');
  }
}

const server = new SensioMCPServer();
server.run().catch(console.error);
