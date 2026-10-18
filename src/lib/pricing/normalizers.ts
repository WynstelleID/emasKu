import type { ApiRawPriceItem, NormalizedPriceItem } from '@/types/gold';

export function normalizeRawPriceItem(
  item: ApiRawPriceItem,
  fallbackSource?: string
): NormalizedPriceItem | null {
  const source = item.source || fallbackSource || 'unknown';
  const weight = Number(item.weight);

  if (isNaN(weight) || weight <= 0) {
    return null;
  }

  // Sanitize prices
  const rawSell = item.sellPrice !== null && item.sellPrice !== undefined ? Number(item.sellPrice) : null;
  const rawBuyback = item.buybackPrice !== null && item.buybackPrice !== undefined ? Number(item.buybackPrice) : null;

  const sellPrice = rawSell !== null && !isNaN(rawSell) && rawSell > 0 ? rawSell : null;
  const buybackPrice = rawBuyback !== null && !isNaN(rawBuyback) && rawBuyback > 0 ? rawBuyback : null;

  // ponytail: composite key for fast Dexie / query deduplication
  const id = `${source}-${item.material || 'gold'}-${item.materialType || 'default'}-${weight}-${item.recordedDate}`;

  return {
    id,
    source,
    displayName: item.displayName || source,
    material: (item.material || 'gold').toLowerCase(),
    materialType: item.materialType || 'Emas Batangan',
    weight,
    weightUnit: item.weightUnit || 'gr',
    sellPrice,
    buybackPrice,
    currency: item.currency || 'IDR',
    recordedDate: item.recordedDate || new Date().toISOString().split('T')[0],
    fetchedAt: item.createdAt || new Date().toISOString(),
    urlHomepage: item.urlHomepage || null,
  };
}

export function normalizeRawPrices(
  items: unknown[],
  fallbackSource?: string
): NormalizedPriceItem[] {
  if (!Array.isArray(items)) return [];

  const results: NormalizedPriceItem[] = [];

  for (const raw of items) {
    if (typeof raw === 'object' && raw !== null) {
      const normalized = normalizeRawPriceItem(raw as ApiRawPriceItem, fallbackSource);
      if (normalized) {
        // We focus primarily on gold products for the portfolio
        if (normalized.material === 'gold' || !normalized.material) {
          results.push(normalized);
        }
      }
    }
  }

  return results;
}
