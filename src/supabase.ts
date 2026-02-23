import { CONFIG } from './config.js';
import { DeviceInfo } from './types.js';

export class SupabaseClient {
  private baseUrl: string;
  private serviceKey: string;

  constructor() {
    this.baseUrl = CONFIG.supabase.url;
    this.serviceKey = CONFIG.supabase.serviceKey;
  }

  private async fetch(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}/rest/v1/${endpoint}`;
    const headers = {
      'apikey': this.serviceKey,
      'Authorization': `Bearer ${this.serviceKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      throw new Error(`Supabase request failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getDevicesForUser(userId: string): Promise<DeviceInfo[]> {
    const devices = await this.fetch(
      `user_devices?user_id=eq.${userId}&select=device_serial,device_name`
    );

    return devices.map((d: any) => ({
      device_serial: d.device_serial,
      name: d.device_name || d.device_serial,
      user_id: userId,
    }));
  }

  async getUserFromToken(token: string): Promise<{ id: string; email: string } | null> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/v1/user`, {
        headers: {
          'apikey': this.serviceKey,
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      const user = await response.json() as { id: string; email: string };
      return { id: user.id, email: user.email };
    } catch (error) {
      console.error('Error getting user from token:', error);
      return null;
    }
  }

  async validateDeviceAccess(userId: string, deviceSerials: string[]): Promise<boolean> {
    const userDevices = await this.getDevicesForUser(userId);
    const allowedSerials = new Set(userDevices.map(d => d.device_serial));

    return deviceSerials.every(serial => allowedSerials.has(serial));
  }
}

export const supabaseClient = new SupabaseClient();
