import { describe, it, expect, beforeEach } from 'vitest';
import {
  holdingsRepo,
  priceSnapshotRepo,
  settingsRepo,
  alertsRepo,
  db,
} from '@/lib/db';
import type { NormalizedPriceItem } from '@/types/gold';

describe('IndexedDB Repositories', () => {
  beforeEach(async () => {
    await db.holdings.clear();
    await db.priceSnapshots.clear();
    await db.alerts.clear();
    await db.settings.clear();
  });

  it('performs CRUD operations on holdings', async () => {
    // 1. Add
    const id = await holdingsRepo.add({
      providerId: 'logammulia',
      productName: 'Antam 10g CertiCard',
      category: 'bullion',
      weightGrams: 10,
      quantity: 1,
      purchaseDate: '2026-01-15',
      purchaseCost: 24000000,
    });
    expect(id).toBeDefined();

    // 2. GetById
    const fetched = await holdingsRepo.getById(id);
    expect(fetched?.productName).toBe('Antam 10g CertiCard');
    expect(fetched?.weightGrams).toBe(10);

    // 3. Update
    await holdingsRepo.update(id, { quantity: 2, purchaseCost: 48000000 });
    const updated = await holdingsRepo.getById(id);
    expect(updated?.quantity).toBe(2);
    expect(updated?.purchaseCost).toBe(48000000);

    // 4. GetAll
    const all = await holdingsRepo.getAll();
    expect(all).toHaveLength(1);

    // 5. Delete
    await holdingsRepo.delete(id);
    const deleted = await holdingsRepo.getById(id);
    expect(deleted).toBeUndefined();
  });

  it('stores and retrieves price snapshots for offline mode', async () => {
    const snapshot: NormalizedPriceItem[] = [
      {
        id: 'antam-1g-test',
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
        fetchedAt: new Date().toISOString(),
      },
    ];

    await priceSnapshotRepo.saveAll(snapshot);
    const retrieved = await priceSnapshotRepo.getAll();
    expect(retrieved).toHaveLength(1);
    expect(retrieved[0].sellPrice).toBe(2500000);

    const bySource = await priceSnapshotRepo.getBySource('logammulia');
    expect(bySource).toHaveLength(1);
  });

  it('manages settings and defaults', async () => {
    const defaultSettings = await settingsRepo.get();
    expect(defaultSettings.currency).toBe('IDR');

    await settingsRepo.save({ theme: 'dark' });
    const updated = await settingsRepo.get();
    expect(updated.theme).toBe('dark');
  });

  it('manages alerts in repository', async () => {
    const alertId = await alertsRepo.add({
      provider: 'logammulia',
      targetPrice: 2600000,
      priceType: 'sell',
      condition: 'above',
      enabled: true,
    });
    expect(alertId).toBeDefined();

    const all = await alertsRepo.getAll();
    expect(all).toHaveLength(1);

    await alertsRepo.delete(alertId);
    const afterDelete = await alertsRepo.getAll();
    expect(afterDelete).toHaveLength(0);
  });
});
