'use client';

import { useQuery } from '@tanstack/react-query';
import { goldPriceClient, PRIMARY_PROVIDERS } from '@/lib/api/gold-price-client';
import { priceSnapshotRepo } from '@/lib/db';
import type { NormalizedPriceItem, ApiProviderSummary } from '@/types/gold';

export const priceQueryKeys = {
  all: ['gold-prices'] as const,
  providers: () => [...priceQueryKeys.all, 'providers'] as const,
  combined: () => [...priceQueryKeys.all, 'combined'] as const,
  provider: (id: string) => [...priceQueryKeys.all, 'provider', id] as const,
  history: (id: string) => [...priceQueryKeys.all, 'history', id] as const,
};

// Fetch providers list
export function useGoldProviders() {
  return useQuery<ApiProviderSummary[]>({
    queryKey: priceQueryKeys.providers(),
    queryFn: async () => {
      return goldPriceClient.getProviders();
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

// Fetch combined prices across primary providers with IndexedDB offline fallback
export function useAllGoldPrices() {
  return useQuery<NormalizedPriceItem[]>({
    queryKey: priceQueryKeys.combined(),
    queryFn: async () => {
      try {
        const prices = await goldPriceClient.getCombinedPrices(PRIMARY_PROVIDERS);
        if (prices.length > 0) {
          // Save snapshot to IndexedDB for offline access
          priceSnapshotRepo.saveAll(prices).catch((err) => {
            console.warn('Failed to save price snapshot to IndexedDB:', err);
          });
          return prices;
        }
        // Fallback to cached snapshot in DB if API returned empty
        const cached = await priceSnapshotRepo.getAll();
        return cached;
      } catch (err) {
        console.warn('Network error, attempting IndexedDB offline cache:', err);
        const cached = await priceSnapshotRepo.getAll();
        if (cached.length > 0) return cached;
        throw err;
      }
    },
  });
}

// Fetch prices for a single provider
export function useProviderPrices(providerId: string) {
  return useQuery<NormalizedPriceItem[]>({
    queryKey: priceQueryKeys.provider(providerId),
    queryFn: async () => {
      const prices = await goldPriceClient.getPricesByProvider(providerId);
      if (prices.length > 0) {
        priceSnapshotRepo.saveAll(prices).catch(() => {});
        return prices;
      }
      return priceSnapshotRepo.getBySource(providerId);
    },
    enabled: Boolean(providerId),
  });
}

// Fetch historical prices for a provider
export function useHistoricalPrices(providerId: string) {
  return useQuery<NormalizedPriceItem[]>({
    queryKey: priceQueryKeys.history(providerId),
    queryFn: async () => {
      return goldPriceClient.getHistoricalPrices(providerId);
    },
    enabled: Boolean(providerId),
    staleTime: 30 * 60 * 1000,
  });
}
