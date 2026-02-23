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
      timestamp: raw.timestamp,
      online: raw.online,
      time_since_last_reading: raw.time_since_last_reading,
      sensor: {
        temperature_c: raw.temperature,
        humidity_pct: raw.humidity,
        co2_ppm: raw.co2,
        voc: raw.voc,
      },
      indices: {
        co2: raw.co2_index !== null ? {
          index: raw.co2_index,
          verbal: raw.co2_verbal || '',
          color: raw.co2_color || '',
        } : null,
        voc: raw.voc_index !== null ? {
          index: raw.voc_index,
          verbal: raw.voc_verbal || '',
          color: raw.voc_color || '',
        } : null,
        pollution: raw.pollution_index !== null ? {
          index: raw.pollution_index,
          verbal: raw.pollution_verbal || '',
          color: raw.pollution_color || '',
        } : null,
      },
      allergens: {
        pollen: raw.ml_allergen_index_pollen !== null ? {
          index: raw.ml_allergen_index_pollen,
          verbal: raw.ml_allergen_verbal_pollen || '',
          color: raw.ml_allergen_color_pollen || '',
        } : null,
        mites: raw.ml_allergen_index_mites !== null ? {
          index: raw.ml_allergen_index_mites,
          verbal: raw.ml_allergen_verbal_mites || '',
          color: raw.ml_allergen_color_mites || '',
        } : null,
        dander: raw.ml_allergen_index_dander !== null ? {
          index: raw.ml_allergen_index_dander,
          verbal: raw.ml_allergen_verbal_dander || '',
          color: raw.ml_allergen_color_dander || '',
        } : null,
        mold: raw.ml_allergen_index_mold !== null ? {
          index: raw.ml_allergen_index_mold,
          verbal: raw.ml_allergen_verbal_mold || '',
          color: raw.ml_allergen_color_mold || '',
        } : null,
        allergen: raw.ml_allergen_index !== null ? {
          index: raw.ml_allergen_index,
          verbal: raw.ml_allergen_verbal || '',
          color: raw.ml_allergen_color || '',
        } : null,
      },
    };
  }

  toHistoryPoint(raw: SensioApiResponse): HistoryPoint {
    return {
      t: raw.timestamp,
      co2_ppm: raw.co2,
      voc: raw.voc,
      temperature_c: raw.temperature,
      humidity_pct: raw.humidity,
      allergen_index: raw.ml_allergen_index,
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
