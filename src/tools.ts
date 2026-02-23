import { z } from 'zod';
import { sensioApi } from './sensio-api.js';
import { supabaseClient } from './supabase.js';
import { cacheManager, CacheManager } from './cache.js';
import { CONFIG } from './config.js';
import {
  GetLatestInputSchema,
  GetHistoryInputSchema,
  GetParticleBreakdownInputSchema,
  SensioApiResponse,
  ParticleClass,
} from './types.js';

export class SensioTools {
  async listDeviceSerials(userId: string): Promise<any> {
    const devices = await supabaseClient.getDevicesForUser(userId);
    
    return {
      devices: devices.map(d => ({
        device_serial: d.device_serial,
        name: d.name,
      })),
    };
  }

  async getLatest(userId: string, input: z.infer<typeof GetLatestInputSchema>): Promise<any> {
    const { device_serials } = input;

    const hasAccess = await supabaseClient.validateDeviceAccess(userId, device_serials);
    if (!hasAccess) {
      throw new Error('Access denied: one or more device serials do not belong to this user');
    }

    const cacheKey = CacheManager.generateLatestKey(device_serials);
    const cached = cacheManager.getLatest(cacheKey);
    if (cached) {
      return cached;
    }

    const rawData = await sensioApi.fetchIndoorData(device_serials);

    const deviceMap = new Map<string, SensioApiResponse>();
    for (const record of rawData) {
      const existing = deviceMap.get(record.device_serial);
      const recordTime = record.sensor_data?.sensor_date_time || record.request_date_time;
      const existingTime = existing?.sensor_data?.sensor_date_time || existing?.request_date_time || '';
      if (!existing || new Date(recordTime) > new Date(existingTime)) {
        deviceMap.set(record.device_serial, record);
      }
    }

    const readings = Array.from(deviceMap.values()).map(raw => 
      sensioApi.normalizeReading(raw)
    );

    const result = { readings };
    cacheManager.setLatest(cacheKey, result);

    return result;
  }

  async getHistory(userId: string, input: z.infer<typeof GetHistoryInputSchema>): Promise<any> {
    const { device_serials, start, end, resolution } = input;

    const hasAccess = await supabaseClient.validateDeviceAccess(userId, device_serials);
    if (!hasAccess) {
      throw new Error('Access denied: one or more device serials do not belong to this user');
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    const daysDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

    if (daysDiff > CONFIG.cache.maxTimeWindowDays) {
      throw new Error(`Time window exceeds maximum of ${CONFIG.cache.maxTimeWindowDays} days`);
    }

    const cacheKey = CacheManager.generateHistoryKey(device_serials, start, end, resolution);
    const cached = cacheManager.getHistory(cacheKey);
    if (cached) {
      return cached;
    }

    const rawData = await sensioApi.fetchIndoorData(device_serials, start, end);

    const deviceMap = new Map<string, SensioApiResponse[]>();
    for (const record of rawData) {
      if (!deviceMap.has(record.device_serial)) {
        deviceMap.set(record.device_serial, []);
      }
      deviceMap.get(record.device_serial)!.push(record);
    }

    const series = Array.from(deviceMap.entries()).map(([device_serial, records]) => {
      const points = records.map(r => sensioApi.toHistoryPoint(r));
      const downsampled = sensioApi.downsampleHistory(points, resolution);
      
      return {
        device_serial,
        points: downsampled,
      };
    });

    const result = { series };
    cacheManager.setHistory(cacheKey, result);

    return result;
  }

  async getParticleBreakdown(
    userId: string,
    input: z.infer<typeof GetParticleBreakdownInputSchema>
  ): Promise<any> {
    const { device_serial, start, end, top_k } = input;

    const hasAccess = await supabaseClient.validateDeviceAccess(userId, [device_serial]);
    if (!hasAccess) {
      throw new Error('Access denied: device serial does not belong to this user');
    }

    const rawData = await sensioApi.fetchIndoorData([device_serial], start, end);

    const allClasses = new Map<string, number>();

    for (const record of rawData) {
      if (record.ml_particle_classes) {
        this.aggregateParticleClasses(record.ml_particle_classes, allClasses);
      }
    }

    const topClasses: ParticleClass[] = Array.from(allClasses.entries())
      .map(([className, count]) => ({ class: className, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, top_k);

    const latestRecord = rawData.length > 0 ? rawData[rawData.length - 1] : null;

    return {
      device_serial,
      top_classes: topClasses,
      raw: latestRecord?.ml_particle_classes || {},
    };
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
}

export const sensioTools = new SensioTools();
