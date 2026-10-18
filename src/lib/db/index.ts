import Dexie, { type Table } from 'dexie';
import type { GoldHolding, NormalizedPriceItem, PriceAlert, AppSettings } from '@/types/gold';

export class EmasKuDatabase extends Dexie {
  holdings!: Table<GoldHolding, string>;
  priceSnapshots!: Table<NormalizedPriceItem, string>;
  alerts!: Table<PriceAlert, string>;
  settings!: Table<AppSettings & { id: string }, string>;

  constructor() {
    super('EmasKuDB');

    // Schema v1
    this.version(1).stores({
      holdings: 'id, providerId, category, purchaseDate, createdAt',
      priceSnapshots: 'id, source, weight, material, recordedDate',
      alerts: 'id, provider, priceType, enabled',
      settings: 'id',
    });
  }
}

// ponytail: single singleton instance
export const db = new EmasKuDatabase();

// Repositories
export const holdingsRepo = {
  async getAll(): Promise<GoldHolding[]> {
    return db.holdings.orderBy('createdAt').reverse().toArray();
  },

  async getById(id: string): Promise<GoldHolding | undefined> {
    return db.holdings.get(id);
  },

  async add(holding: Omit<GoldHolding, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<string> {
    const now = new Date().toISOString();
    const id = holding.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()));
    const record: GoldHolding = {
      ...holding,
      id,
      createdAt: now,
      updatedAt: now,
    };
    await db.holdings.add(record);
    return id;
  },

  async update(id: string, updates: Partial<GoldHolding>): Promise<void> {
    await db.holdings.update(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  },

  async delete(id: string): Promise<void> {
    await db.holdings.delete(id);
  },

  async bulkAdd(holdings: GoldHolding[]): Promise<void> {
    await db.holdings.bulkPut(holdings);
  },

  async clear(): Promise<void> {
    await db.holdings.clear();
  },
};

export const priceSnapshotRepo = {
  async saveAll(items: NormalizedPriceItem[]): Promise<void> {
    if (!items.length) return;
    await db.priceSnapshots.bulkPut(items);
  },

  async getAll(): Promise<NormalizedPriceItem[]> {
    return db.priceSnapshots.toArray();
  },

  async getBySource(source: string): Promise<NormalizedPriceItem[]> {
    return db.priceSnapshots.where('source').equals(source).toArray();
  },

  async clear(): Promise<void> {
    await db.priceSnapshots.clear();
  },
};

export const alertsRepo = {
  async getAll(): Promise<PriceAlert[]> {
    return db.alerts.toArray();
  },

  async add(alert: Omit<PriceAlert, 'id' | 'createdAt'>): Promise<string> {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
    const record: PriceAlert = {
      ...alert,
      id,
      createdAt: new Date().toISOString(),
    };
    await db.alerts.add(record);
    return id;
  },

  async update(id: string, updates: Partial<PriceAlert>): Promise<void> {
    await db.alerts.update(id, updates);
  },

  async delete(id: string): Promise<void> {
    await db.alerts.delete(id);
  },
};

export const settingsRepo = {
  async get(): Promise<AppSettings> {
    const record = await db.settings.get('default');
    if (!record) {
      return {
        theme: 'system',
        currency: 'IDR',
        defaultProvider: 'logammulia',
      };
    }
    return record;
  },

  async save(settings: Partial<AppSettings>): Promise<void> {
    const current = await this.get();
    await db.settings.put({
      ...current,
      ...settings,
      id: 'default',
    });
  },
};
