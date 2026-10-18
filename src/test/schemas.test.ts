import { describe, it, expect } from 'vitest';
import {
  goldHoldingSchema,
  portfolioImportSchema,
  priceAlertSchema,
} from '@/lib/validation/schemas';

describe('Validation Schemas', () => {
  it('validates correct gold holding input', () => {
    const valid = {
      providerId: 'logammulia',
      productName: 'Emas Antam CertiCard 1g',
      category: 'bullion',
      weightGrams: 1.0,
      quantity: 1,
      purchaseDate: '2026-10-18',
      purchaseCost: 2500000,
      purity: 24,
    };

    const res = goldHoldingSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('rejects invalid or negative weight and quantity', () => {
    const invalidWeight = {
      providerId: 'logammulia',
      productName: 'Emas',
      category: 'bullion',
      weightGrams: -5,
      quantity: 1,
      purchaseDate: '2026-10-18',
      purchaseCost: 1000,
    };
    expect(goldHoldingSchema.safeParse(invalidWeight).success).toBe(false);

    const invalidQty = {
      providerId: 'logammulia',
      productName: 'Emas',
      category: 'bullion',
      weightGrams: 1,
      quantity: 0,
      purchaseDate: '2026-10-18',
      purchaseCost: 1000,
    };
    expect(goldHoldingSchema.safeParse(invalidQty).success).toBe(false);
  });

  it('validates portfolio import array', () => {
    const validImport = [
      {
        providerId: 'galeri24',
        productName: 'Galeri 24 5g',
        category: 'bullion',
        weightGrams: 5,
        quantity: 2,
        purchaseDate: '2025-05-10',
        purchaseCost: 12000000,
      },
    ];

    const parsed = portfolioImportSchema.safeParse(validImport);
    expect(parsed.success).toBe(true);
  });

  it('rejects malformed portfolio import array', () => {
    const malformed = [
      {
        providerId: '',
        productName: '',
        weightGrams: -1,
      },
    ];
    expect(portfolioImportSchema.safeParse(malformed).success).toBe(false);
  });

  it('validates price alert settings', () => {
    const alert = {
      provider: 'logammulia',
      targetPrice: 2600000,
      priceType: 'sell',
      condition: 'above',
    };
    expect(priceAlertSchema.safeParse(alert).success).toBe(true);
  });
});
