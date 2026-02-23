import { z } from 'zod';

export const DeviceSerialSchema = z.string().min(1, 'Device serial is required');

export const IndexSchema = z.object({
  index: z.number(),
  verbal: z.string(),
  color: z.string(),
});

export const SensorDataSchema = z.object({
  temperature_c: z.number().nullable(),
  humidity_pct: z.number().nullable(),
  co2_ppm: z.number().nullable(),
  voc: z.number().nullable(),
});

export const IndicesSchema = z.object({
  co2: IndexSchema.nullable(),
  voc: IndexSchema.nullable(),
  pollution: IndexSchema.nullable(),
});

export const AllergensSchema = z.object({
  pollen: IndexSchema.nullable(),
  mites: IndexSchema.nullable(),
  dander: IndexSchema.nullable(),
  mold: IndexSchema.nullable(),
  allergen: IndexSchema.nullable(),
});

export const DeviceReadingSchema = z.object({
  device_serial: z.string(),
  timestamp: z.string(),
  online: z.boolean(),
  time_since_last_reading: z.string().nullable(),
  sensor: SensorDataSchema,
  indices: IndicesSchema,
  allergens: AllergensSchema,
});

export const ListDeviceSerialsInputSchema = z.object({});

export const GetLatestInputSchema = z.object({
  device_serials: z.array(DeviceSerialSchema).min(1, 'At least one device serial is required'),
});

export const GetHistoryInputSchema = z.object({
  device_serials: z.array(DeviceSerialSchema).min(1, 'At least one device serial is required'),
  start: z.string().datetime(),
  end: z.string().datetime(),
  resolution: z.enum(['1m', '5m', '15m', '30m', '1h', '6h', '1d']).optional().default('15m'),
});

export const GetParticleBreakdownInputSchema = z.object({
  device_serial: DeviceSerialSchema,
  start: z.string().datetime(),
  end: z.string().datetime(),
  top_k: z.number().int().min(1).max(20).optional().default(5),
});

export interface SensioApiResponse {
  device_serial: string;
  is_device_online: boolean;
  time_since_last_reading: string | null;
  request_date_time: string;
  sensor_data: {
    sensor_date_time: string;
    temperature: number | null;
    humidity: number | null;
    co2: number | null;
    voc: number | null;
  };
  sensor_indices: {
    co2: { index: number; verbal: string; color: string } | null;
    voc: { index: number; verbal: string; color: string } | null;
    pollution: { index: number; verbal: string; color: string } | null;
    temperature: number | null;
    humidity: number | null;
  };
  ml_particle_indices?: {
    pollen: { index: number; verbal: string; color: string } | null;
    mites: { index: number; verbal: string; color: string } | null;
    dander: { index: number; verbal: string; color: string } | null;
    mold: { index: number; verbal: string; color: string } | null;
    allergen: { index: number; verbal: string; color: string } | null;
  };
  ml_particle_classes?: Record<string, any>;
}

export interface DeviceInfo {
  device_serial: string;
  name: string;
  user_id?: string;
}

export interface NormalizedReading {
  device_serial: string;
  timestamp: string;
  online: boolean;
  time_since_last_reading: string | null;
  sensor: {
    temperature_c: number | null;
    humidity_pct: number | null;
    co2_ppm: number | null;
    voc: number | null;
  };
  indices: {
    co2: { index: number; verbal: string; color: string } | null;
    voc: { index: number; verbal: string; color: string } | null;
    pollution: { index: number; verbal: string; color: string } | null;
  };
  allergens: {
    pollen: { index: number; verbal: string; color: string } | null;
    mites: { index: number; verbal: string; color: string } | null;
    dander: { index: number; verbal: string; color: string } | null;
    mold: { index: number; verbal: string; color: string } | null;
    allergen: { index: number; verbal: string; color: string } | null;
  };
}

export interface HistoryPoint {
  t: string;
  co2_ppm: number | null;
  voc: number | null;
  temperature_c: number | null;
  humidity_pct: number | null;
  allergen_index: number | null;
}

export interface ParticleClass {
  class: string;
  count: number;
}
