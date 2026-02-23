import { CONFIG } from './config.js';
import { SensioApiResponse, NormalizedReading, HistoryPoint } from './types.js';

export class SensioApiClient {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = CONFIG.sensio.apiUrl;
    this.apiKey = CONFIG.sensio.apiKey;
  }

  async fetchIndoorData(
    deviceSerials: string[],
    start?: string,
    end?: string
  ): Promise<SensioApiResponse[]> {
    const body: any = {
      device_serials: deviceSerials,
      format: 'json2',
    };

    if (start) body.start = start;
    if (end) body.end = end;

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Api-Key ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Sensio API request failed: ${response.statusText}`);
    }

    return response.json() as Promise<SensioApiResponse[]>;
  }

  normalizeReading(raw: SensioApiResponse): NormalizedReading {
    return {
      device_serial: raw.device_serial,
      timestamp: raw.sensor_data?.sensor_date_time || raw.request_date_time,
      online: raw.is_device_online,
      time_since_last_reading: raw.time_since_last_reading,
      sensor: {
        temperature_c: raw.sensor_data?.temperature || null,
        humidity_pct: raw.sensor_data?.humidity || null,
        co2_ppm: raw.sensor_data?.co2 || null,
        voc: raw.sensor_data?.voc || null,
      },
      indices: {
        co2: raw.sensor_indices?.co2 || null,
        voc: raw.sensor_indices?.voc || null,
        pollution: raw.sensor_indices?.pollution || null,
      },
      allergens: {
        pollen: raw.ml_particle_indices?.pollen || null,
        mites: raw.ml_particle_indices?.mites || null,
        dander: raw.ml_particle_indices?.dander || null,
        mold: raw.ml_particle_indices?.mold || null,
        allergen: raw.ml_particle_indices?.allergen || null,
      },
    };
  }

  toHistoryPoint(raw: SensioApiResponse): HistoryPoint {
    return {
      t: raw.sensor_data?.sensor_date_time || raw.request_date_time,
      co2_ppm: raw.sensor_data?.co2 || null,
      voc: raw.sensor_data?.voc || null,
      temperature_c: raw.sensor_data?.temperature || null,
      humidity_pct: raw.sensor_data?.humidity || null,
      allergen_index: raw.ml_particle_indices?.allergen?.index || null,
    };
  }

  downsampleHistory(points: HistoryPoint[], resolution: string): HistoryPoint[] {
    if (points.length === 0) return [];

    const resolutionMs: Record<string, number> = {
      '1m': 60 * 1000,
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '30m': 30 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '1d': 24 * 60 * 60 * 1000,
    };

    const bucketSize = resolutionMs[resolution] || resolutionMs['15m'];
    const buckets = new Map<number, HistoryPoint[]>();

    for (const point of points) {
      const timestamp = new Date(point.t).getTime();
      const bucketKey = Math.floor(timestamp / bucketSize) * bucketSize;

      if (!buckets.has(bucketKey)) {
        buckets.set(bucketKey, []);
      }
      buckets.get(bucketKey)!.push(point);
    }

    const downsampled: HistoryPoint[] = [];
    for (const [bucketKey, bucketPoints] of buckets.entries()) {
      const avg = (values: (number | null)[]) => {
        const valid = values.filter(v => v !== null) as number[];
        return valid.length > 0 ? valid.reduce((a, b) => a + b, 0) / valid.length : null;
      };

      downsampled.push({
        t: new Date(bucketKey).toISOString(),
        co2_ppm: avg(bucketPoints.map(p => p.co2_ppm)),
        voc: avg(bucketPoints.map(p => p.voc)),
        temperature_c: avg(bucketPoints.map(p => p.temperature_c)),
        humidity_pct: avg(bucketPoints.map(p => p.humidity_pct)),
        allergen_index: avg(bucketPoints.map(p => p.allergen_index)),
      });
    }

    return downsampled.sort((a, b) => new Date(a.t).getTime() - new Date(b.t).getTime());
  }
}

export const sensioApi = new SensioApiClient();
