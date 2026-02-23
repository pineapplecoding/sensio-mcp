import NodeCache from 'node-cache';
import { CONFIG } from './config.js';

export class CacheManager {
  private latestCache: NodeCache;
  private historyCache: NodeCache;

  constructor() {
    this.latestCache = new NodeCache({ stdTTL: CONFIG.cache.ttlLatest });
    this.historyCache = new NodeCache({ stdTTL: CONFIG.cache.ttlHistory });
  }

  getLatest(key: string): any | undefined {
    return this.latestCache.get(key);
  }

  setLatest(key: string, value: any): void {
    this.latestCache.set(key, value);
  }

  getHistory(key: string): any | undefined {
    return this.historyCache.get(key);
  }

  setHistory(key: string, value: any): void {
    this.historyCache.set(key, value);
  }

  clearAll(): void {
    this.latestCache.flushAll();
    this.historyCache.flushAll();
  }

  static generateLatestKey(deviceSerials: string[]): string {
    return `latest:${deviceSerials.sort().join(',')}`;
  }

  static generateHistoryKey(
    deviceSerials: string[],
    start: string,
    end: string,
    resolution: string
  ): string {
    return `history:${deviceSerials.sort().join(',')}:${start}:${end}:${resolution}`;
  }
}

export const cacheManager = new CacheManager();
