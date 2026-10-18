export type HoldingCategory = 'bullion' | 'jewelry' | 'other';

export interface GoldHolding {
  id: string;
  providerId: string; // e.g. 'logammulia', 'galeri24', 'hartadinataabadi', 'pegadaian', 'indogold', 'other'
  productName: string; // e.g. 'Emas Batangan 1g', 'Cincin 22k'
  category: HoldingCategory;
  weightGrams: number;
  quantity: number;
  purchaseDate: string; // YYYY-MM-DD
  purchaseCost: number; // IDR total acquisition cost
  purity?: number; // Karat (e.g. 24, 22, 18) or millesimal fineness (e.g. 99.99)
  makingCharges?: number; // Ongkos pembuatan (IDR)
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiRawPriceItem {
  source: string;
  material?: string;
  materialType?: string;
  weight: number;
  weightUnit?: string;
  sellPrice?: number | null;
  buybackPrice?: number | null;
  currency?: string;
  recordedDate: string;
  createdAt?: string;
  displayName?: string;
  logo?: string;
  favicon?: string | null;
  url?: string;
  urlHomepage?: string | null;
}

export interface NormalizedPriceItem {
  id: string;
  source: string;
  displayName: string;
  material: 'gold' | 'silver' | string;
  materialType: string;
  weight: number;
  weightUnit: string;
  sellPrice: number | null;
  buybackPrice: number | null;
  currency: string;
  recordedDate: string;
  fetchedAt: string;
  urlHomepage?: string | null;
}

export interface ApiProviderSummary {
  name: string;
  displayName: string;
  logo?: string;
  favicon?: string | null;
  cover?: string | null;
  url: string;
  urlHomepage?: string | null;
}

export interface ValuationDetail {
  holdingId: string;
  unitSellPrice: number | null;
  unitBuybackPrice: number | null;
  totalEstimatedMarketValue: number | null;
  totalEstimatedResaleValue: number | null;
  totalAcquisitionCost: number;
  unrealizedPnL: number | null;
  unrealizedReturnPct: number | null;
  matchedSource: string | null;
  matchedRecordedDate: string | null;
  valuationMethod: 'exact_denomination' | 'provider_weight_rate' | 'market_average' | 'unavailable';
}

export interface PortfolioSummary {
  totalGrams: number;
  totalAcquisitionCost: number;
  estimatedMarketValue: number;
  estimatedResaleValue: number;
  unrealizedPnL: number;
  unrealizedReturnPct: number;
  holdingsCount: number;
  valuedHoldingsCount: number;
  providerBreakdown: Array<{
    providerId: string;
    displayName: string;
    grams: number;
    value: number;
    count: number;
    percentage: number;
  }>;
  categoryBreakdown: Array<{
    category: HoldingCategory;
    displayName: string;
    grams: number;
    value: number;
    count: number;
    percentage: number;
  }>;
  valuations: Record<string, ValuationDetail>;
}

export interface PriceAlert {
  id: string;
  provider: string;
  targetPrice: number;
  priceType: 'sell' | 'buyback';
  condition: 'above' | 'below';
  enabled: boolean;
  notes?: string;
  createdAt: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  currency: 'IDR';
  defaultProvider: string;
  offlineNoticeDismissed?: boolean;
}
