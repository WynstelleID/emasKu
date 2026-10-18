import { describe, it, expect } from 'vitest';
import { normalizeRawPriceItem, normalizeRawPrices } from '@/lib/pricing/normalizers';

describe('Price Normalizers', () => {
  it('normalizes valid raw price item with sell and buyback prices', () => {
    const raw = {
      source: 'galeri24',
      displayName: 'Galeri 24',
      material: 'gold',
      materialType: 'GALERI 24',
      weight: 1,
      weightUnit: 'gr',
      sellPrice: 2523000,
      buybackPrice: 2375000,
      currency: 'IDR',
      recordedDate: '2026-10-18',
    };

    const normalized = normalizeRawPriceItem(raw);
    expect(normalized).not.toBeNull();
    expect(normalized?.source).toBe('galeri24');
    expect(normalized?.weight).toBe(1);
    expect(normalized?.sellPrice).toBe(2523000);
    expect(normalized?.buybackPrice).toBe(2375000);
    expect(normalized?.recordedDate).toBe('2026-10-18');
  });

  it('handles null or missing buybackPrice gracefully without fabricating prices', () => {
    const raw = {
      source: 'logammulia',
      weight: 0.5,
      sellPrice: 1336000,
      buybackPrice: null,
      recordedDate: '2026-10-18',
    };

    const normalized = normalizeRawPriceItem(raw);
    expect(normalized).not.toBeNull();
    expect(normalized?.buybackPrice).toBeNull();
    expect(normalized?.sellPrice).toBe(1336000);
  });

  it('filters out items with invalid or zero weight', () => {
    const rawInvalidWeight = {
      source: 'logammulia',
      weight: 0,
      sellPrice: 1000000,
      recordedDate: '2026-10-18',
    };
    expect(normalizeRawPriceItem(rawInvalidWeight)).toBeNull();

    const rawNaN = {
      source: 'logammulia',
      weight: NaN,
      sellPrice: 1000000,
      recordedDate: '2026-10-18',
    };
    expect(normalizeRawPriceItem(rawNaN)).toBeNull();
  });

  it('filters silver out of gold portfolio items', () => {
    const items = [
      {
        source: 'logammulia',
        material: 'silver',
        weight: 10,
        sellPrice: 200000,
        recordedDate: '2026-10-18',
      },
      {
        source: 'logammulia',
        material: 'gold',
        weight: 1,
        sellPrice: 2500000,
        recordedDate: '2026-10-18',
      },
    ];

    const results = normalizeRawPrices(items);
    expect(results).toHaveLength(1);
    expect(results[0].material).toBe('gold');
  });
});
