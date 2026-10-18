import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GoldPriceClient } from '@/lib/api/gold-price-client';

describe('GoldPriceClient', () => {
  let client: GoldPriceClient;

  beforeEach(() => {
    client = new GoldPriceClient('https://mock-api.local');
    vi.restoreAllMocks();
  });

  it('handles provider fetch errors without crashing', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    } as unknown as Response);

    const prices = await client.getPricesByProvider('logammulia');
    expect(prices).toEqual([]);
  });

  it('processes valid provider prices payload', async () => {
    const mockPayload = {
      success: true,
      data: [
        {
          source: 'galeri24',
          material: 'gold',
          materialType: 'GALERI 24',
          weight: 1,
          weightUnit: 'gr',
          sellPrice: 2500000,
          buybackPrice: 2350000,
          currency: 'IDR',
          recordedDate: '2026-10-18',
        },
      ],
    };

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockPayload,
    } as unknown as Response);

    const prices = await client.getPricesByProvider('galeri24');
    expect(prices).toHaveLength(1);
    expect(prices[0].sellPrice).toBe(2500000);
    expect(prices[0].buybackPrice).toBe(2350000);
  });

  it('continues combined fetch even if one provider fails (partial failure tolerance)', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('treasury')) {
        return {
          ok: false,
          status: 403,
          statusText: 'Forbidden',
        } as unknown as Response;
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: [
            {
              source: 'logammulia',
              material: 'gold',
              weight: 1,
              sellPrice: 2500000,
              recordedDate: '2026-10-18',
            },
          ],
        }),
      } as unknown as Response;
    });

    const combined = await client.getCombinedPrices(['logammulia', 'treasury']);
    expect(combined).toHaveLength(1);
    expect(combined[0].source).toBe('logammulia');
  });
});
