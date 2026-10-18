import { describe, it, expect } from 'vitest';
import {
  getPurityFactor,
  matchHoldingPrice,
  calculateHoldingValuation,
  calculatePortfolioSummary,
} from '@/lib/pricing/financial';
import type { GoldHolding, NormalizedPriceItem } from '@/types/gold';

describe('Financial Calculation Engine', () => {
  const mockPrices: NormalizedPriceItem[] = [
    {
      id: 'antam-1g',
      source: 'logammulia',
      displayName: 'Logam Mulia',
      material: 'gold',
      materialType: 'Emas Batangan',
      weight: 1,
      weightUnit: 'gr',
      sellPrice: 2500000,
      buybackPrice: 2300000,
      currency: 'IDR',
      recordedDate: '2026-10-18',
      fetchedAt: '2026-10-18T00:00:00Z',
    },
    {
      id: 'antam-5g',
      source: 'logammulia',
      displayName: 'Logam Mulia',
      material: 'gold',
      materialType: 'Emas Batangan',
      weight: 5,
      weightUnit: 'gr',
      sellPrice: 12300000,
      buybackPrice: 11500000,
      currency: 'IDR',
      recordedDate: '2026-10-18',
      fetchedAt: '2026-10-18T00:00:00Z',
    },
    {
      id: 'galeri-1g',
      source: 'galeri24',
      displayName: 'Galeri 24',
      material: 'gold',
      materialType: 'GALERI 24',
      weight: 1,
      weightUnit: 'gr',
      sellPrice: 2480000,
      buybackPrice: 2280000,
      currency: 'IDR',
      recordedDate: '2026-10-18',
      fetchedAt: '2026-10-18T00:00:00Z',
    },
  ];

  it('calculates correct purity factors', () => {
    expect(getPurityFactor(24)).toBe(1.0);
    expect(getPurityFactor(18)).toBe(0.75);
    expect(getPurityFactor(12)).toBe(0.5);
    expect(getPurityFactor(750)).toBe(0.75); // Millesimal 750/1000
    expect(getPurityFactor(999.9)).toBe(0.9999);
    expect(getPurityFactor(undefined)).toBe(1.0);
  });

  it('matches exact denomination when available', () => {
    const holding: GoldHolding = {
      id: 'h1',
      providerId: 'logammulia',
      productName: 'Antam 5g',
      category: 'bullion',
      weightGrams: 5,
      quantity: 1,
      purchaseDate: '2025-01-01',
      purchaseCost: 10000000,
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01',
    };

    const match = matchHoldingPrice(holding, mockPrices);
    expect(match.method).toBe('exact_denomination');
    expect(match.unitSellPrice).toBe(12300000);
    expect(match.unitBuybackPrice).toBe(11500000);
  });

  it('calculates proportional rate when exact denomination is missing', () => {
    const holding: GoldHolding = {
      id: 'h2',
      providerId: 'logammulia',
      productName: 'Antam 2.5g',
      category: 'bullion',
      weightGrams: 2.5,
      quantity: 1,
      purchaseDate: '2025-01-01',
      purchaseCost: 5000000,
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01',
    };

    const match = matchHoldingPrice(holding, mockPrices);
    expect(match.method).toBe('provider_weight_rate');
    // Using 1g Antam price: 2.5 * 2500000 = 6250000
    expect(match.unitSellPrice).toBe(6250000);
    expect(match.unitBuybackPrice).toBe(5750000);
  });

  it('calculates jewelry holding valuation with purity and making charges', () => {
    const holding: GoldHolding = {
      id: 'h-jewelry',
      providerId: 'galeri24',
      productName: 'Cincin 18k 4g',
      category: 'jewelry',
      weightGrams: 4,
      quantity: 1,
      purchaseDate: '2025-01-01',
      purchaseCost: 8000000,
      purity: 18, // 18k = 75%
      makingCharges: 300000,
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01',
    };

    const val = calculateHoldingValuation(holding, mockPrices);
    // Base 4g Galeri24 = 4 * 2480000 = 9920000
    // Purity 75% = 7440000
    // Resale value = 4 * 2280000 * 0.75 = 6840000
    expect(val.unitBuybackPrice).toBe(6840000);
    expect(val.totalEstimatedResaleValue).toBe(6840000);
    expect(val.unrealizedPnL).toBe(6840000 - 8000000); // -1160000
    expect(val.unrealizedReturnPct).toBeCloseTo(-14.5, 1);
  });

  it('computes aggregated portfolio summary without division by zero', () => {
    const holdings: GoldHolding[] = [
      {
        id: '1',
        providerId: 'logammulia',
        productName: 'Antam 1g',
        category: 'bullion',
        weightGrams: 1,
        quantity: 2, // Total 2g
        purchaseDate: '2025-01-01',
        purchaseCost: 4000000,
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
      },
      {
        id: '2',
        providerId: 'galeri24',
        productName: 'Galeri 24 1g',
        category: 'bullion',
        weightGrams: 1,
        quantity: 1, // Total 1g
        purchaseDate: '2025-02-01',
        purchaseCost: 2200000,
        createdAt: '2025-02-01',
        updatedAt: '2025-02-01',
      },
    ];

    const summary = calculatePortfolioSummary(holdings, mockPrices);

    expect(summary.totalGrams).toBe(3);
    expect(summary.totalAcquisitionCost).toBe(6200000);
    expect(summary.holdingsCount).toBe(2);

    // Resale value = (2 * 2300000) + (1 * 2280000) = 4600000 + 2280000 = 6880000
    expect(summary.estimatedResaleValue).toBe(6880000);
    expect(summary.unrealizedPnL).toBe(6880000 - 6200000); // 680000 profit
    expect(summary.unrealizedReturnPct).toBeGreaterThan(0);

    // Breakdowns
    expect(summary.providerBreakdown).toHaveLength(2);
    expect(summary.categoryBreakdown).toHaveLength(1);
    expect(summary.categoryBreakdown[0].category).toBe('bullion');
  });

  it('handles empty portfolio gracefully', () => {
    const summary = calculatePortfolioSummary([], mockPrices);
    expect(summary.totalGrams).toBe(0);
    expect(summary.totalAcquisitionCost).toBe(0);
    expect(summary.estimatedResaleValue).toBe(0);
    expect(summary.unrealizedPnL).toBe(0);
    expect(summary.unrealizedReturnPct).toBe(0);
    expect(summary.holdingsCount).toBe(0);
  });
});
