import type { ApiProviderSummary, NormalizedPriceItem } from '@/types/gold';
import { normalizeRawPrices } from '@/lib/pricing/normalizers';

const DEFAULT_API_BASE =
  process.env.NEXT_PUBLIC_GOLD_PRICE_API_BASE_URL ||
  'https://logam-mulia-api.iamutaki.workers.dev';

// Primary trusted providers to fetch for overview
export const PRIMARY_PROVIDERS = [
  'logammulia',
  'galeri24',
  'pegadaian',
  'indogold',
  'hartadinataabadi',
];

export class GoldPriceClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = (baseUrl || DEFAULT_API_BASE).replace(/\/$/, '');
  }

  // Get list of all available gold price providers
  async getProviders(): Promise<ApiProviderSummary[]> {
    try {
      const res = await fetch(`${this.baseUrl}/api/prices`, {
        next: { revalidate: 3600 },
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch providers: ${res.statusText}`);
      }
      const json = await res.json();
      return Array.isArray(json.data) ? json.data : [];
    } catch (error) {
      console.warn('Failed to load providers list, using static primary providers', error);
      return PRIMARY_PROVIDERS.map((id) => ({
        name: id,
        displayName: id.toUpperCase(),
        url: `/api/prices/${id}`,
      }));
    }
  }

  // Fetch prices for a single provider
  async getPricesByProvider(provider: string): Promise<NormalizedPriceItem[]> {
    try {
      const res = await fetch(`${this.baseUrl}/api/prices/${provider}`, {
        next: { revalidate: 300 },
      });

      if (!res.ok) {
        console.warn(`Provider ${provider} returned status ${res.status}`);
        return [];
      }

      const json = await res.json();
      if (!json.success && json.error) {
        console.warn(`Provider ${provider} error response:`, json.error);
        return [];
      }

      const rawItems = Array.isArray(json.data) ? json.data : [];
      return normalizeRawPrices(rawItems, provider);
    } catch (error) {
      console.warn(`Error fetching prices for provider ${provider}:`, error);
      return [];
    }
  }

  // Resilient parallel multi-provider fetch
  async getCombinedPrices(providers = PRIMARY_PROVIDERS): Promise<NormalizedPriceItem[]> {
    const promises = providers.map((provider) =>
      this.getPricesByProvider(provider).catch(() => [] as NormalizedPriceItem[])
    );

    const settled = await Promise.all(promises);
    return settled.flat();
  }

  // Fetch historical prices for a provider
  async getHistoricalPrices(provider: string): Promise<NormalizedPriceItem[]> {
    try {
      const res = await fetch(`${this.baseUrl}/api/prices/${provider}/history`, {
        next: { revalidate: 1800 },
      });

      if (!res.ok) {
        console.warn(`History for ${provider} returned ${res.status}`);
        return [];
      }

      const json = await res.json();
      if (!json.success && json.error) {
        return [];
      }

      const rawItems = Array.isArray(json.data) ? json.data : [];
      return normalizeRawPrices(rawItems, provider);
    } catch (error) {
      console.warn(`Error fetching history for ${provider}:`, error);
      return [];
    }
  }
}

// ponytail: single shared client instance
export const goldPriceClient = new GoldPriceClient();
