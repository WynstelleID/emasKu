import type {
  GoldHolding,
  NormalizedPriceItem,
  ValuationDetail,
  PortfolioSummary,
  HoldingCategory,
} from '@/types/gold';
import { getProviderInfo } from './providers';

// ponytail: calculate purity multiplier (24k = 1.0, 750/18k = 0.75)
export function getPurityFactor(purity?: number | null): number {
  if (!purity || purity <= 0) return 1.0;
  if (purity > 24) {
    // Millesimal fineness e.g. 750, 999.9
    return Math.min(purity / 1000, 1.0);
  }
  // Karat scale e.g. 24, 22, 18
  return Math.min(purity / 24, 1.0);
}

// Find best matching price record for holding
export function matchHoldingPrice(
  holding: GoldHolding,
  prices: NormalizedPriceItem[]
): {
  unitSellPrice: number | null;
  unitBuybackPrice: number | null;
  matchedSource: string | null;
  matchedDate: string | null;
  method: ValuationDetail['valuationMethod'];
} {
  if (!prices || prices.length === 0) {
    return {
      unitSellPrice: null,
      unitBuybackPrice: null,
      matchedSource: null,
      matchedDate: null,
      method: 'unavailable',
    };
  }

  const purityFactor = getPurityFactor(holding.purity);
  const holdingWeight = holding.weightGrams;

  // 1. Try exact provider and exact denomination match
  const exactProviderPrices = prices.filter(
    (p) => p.source.toLowerCase() === holding.providerId.toLowerCase()
  );

  const exactWeightMatch = exactProviderPrices.find(
    (p) => Math.abs(p.weight - holdingWeight) < 0.001
  );

  if (exactWeightMatch && exactWeightMatch.sellPrice) {
    return {
      unitSellPrice: Math.round(exactWeightMatch.sellPrice * purityFactor),
      unitBuybackPrice: exactWeightMatch.buybackPrice
        ? Math.round(exactWeightMatch.buybackPrice * purityFactor)
        : null,
      matchedSource: exactWeightMatch.source,
      matchedDate: exactWeightMatch.recordedDate,
      method: 'exact_denomination',
    };
  }

  // 2. Try provider per-gram rate from nearest denomination (prefer 1g)
  if (exactProviderPrices.length > 0) {
    const sortedByDistance = [...exactProviderPrices]
      .filter((p) => p.sellPrice && p.weight > 0)
      .sort((a, b) => Math.abs(a.weight - 1) - Math.abs(b.weight - 1));

    const baseline = sortedByDistance[0];
    if (baseline && baseline.sellPrice) {
      const perGramSell = baseline.sellPrice / baseline.weight;
      const perGramBuyback = baseline.buybackPrice ? baseline.buybackPrice / baseline.weight : null;

      return {
        unitSellPrice: Math.round(perGramSell * holdingWeight * purityFactor),
        unitBuybackPrice: perGramBuyback
          ? Math.round(perGramBuyback * holdingWeight * purityFactor)
          : null,
        matchedSource: baseline.source,
        matchedDate: baseline.recordedDate,
        method: 'provider_weight_rate',
      };
    }
  }

  // 3. Fallback: Generic market average per gram from all valid 1g or base prices
  const validPrices = prices.filter((p) => p.sellPrice && p.weight > 0);
  if (validPrices.length > 0) {
    const rates = validPrices.map((p) => ({
      sellPerGram: (p.sellPrice as number) / p.weight,
      buybackPerGram: p.buybackPrice ? p.buybackPrice / p.weight : null,
      source: p.source,
      date: p.recordedDate,
    }));

    const avgSellPerGram =
      rates.reduce((sum, r) => sum + r.sellPerGram, 0) / rates.length;
    const buybackRates = rates.filter((r) => r.buybackPerGram !== null);
    const avgBuybackPerGram =
      buybackRates.length > 0
        ? buybackRates.reduce((sum, r) => sum + (r.buybackPerGram as number), 0) / buybackRates.length
        : null;

    return {
      unitSellPrice: Math.round(avgSellPerGram * holdingWeight * purityFactor),
      unitBuybackPrice: avgBuybackPerGram
        ? Math.round(avgBuybackPerGram * holdingWeight * purityFactor)
        : null,
      matchedSource: rates[0].source,
      matchedDate: rates[0].date,
      method: 'market_average',
    };
  }

  return {
    unitSellPrice: null,
    unitBuybackPrice: null,
    matchedSource: null,
    matchedDate: null,
    method: 'unavailable',
  };
}

// Calculate holding valuation
export function calculateHoldingValuation(
  holding: GoldHolding,
  prices: NormalizedPriceItem[]
): ValuationDetail {
  const match = matchHoldingPrice(holding, prices);
  const qty = holding.quantity || 1;
  const makingCharges = holding.makingCharges || 0;

  const totalAcquisitionCost = holding.purchaseCost || 0;

  let totalEstimatedMarketValue: number | null = null;
  let totalEstimatedResaleValue: number | null = null;
  let unrealizedPnL: number | null = null;
  let unrealizedReturnPct: number | null = null;

  if (match.unitSellPrice !== null) {
    // Market value includes making charge for jewelry
    totalEstimatedMarketValue = (match.unitSellPrice + makingCharges) * qty;

    // Resale value uses buyback if available, else market sell price as upper estimate
    const effectiveResaleUnit = match.unitBuybackPrice ?? match.unitSellPrice;
    totalEstimatedResaleValue = effectiveResaleUnit * qty;

    if (totalAcquisitionCost > 0) {
      unrealizedPnL = totalEstimatedResaleValue - totalAcquisitionCost;
      unrealizedReturnPct = (unrealizedPnL / totalAcquisitionCost) * 100;
    }
  }

  return {
    holdingId: holding.id,
    unitSellPrice: match.unitSellPrice,
    unitBuybackPrice: match.unitBuybackPrice,
    totalEstimatedMarketValue,
    totalEstimatedResaleValue,
    totalAcquisitionCost,
    unrealizedPnL,
    unrealizedReturnPct,
    matchedSource: match.matchedSource,
    matchedRecordedDate: match.matchedDate,
    valuationMethod: match.method,
  };
}

// Calculate full portfolio summary
export function calculatePortfolioSummary(
  holdings: GoldHolding[],
  prices: NormalizedPriceItem[]
): PortfolioSummary {
  let totalGrams = 0;
  let totalAcquisitionCost = 0;
  let estimatedMarketValue = 0;
  let estimatedResaleValue = 0;
  let valuedHoldingsCount = 0;

  const valuations: Record<string, ValuationDetail> = {};
  const providerMap = new Map<string, { grams: number; value: number; count: number }>();
  const categoryMap = new Map<HoldingCategory, { grams: number; value: number; count: number }>([
    ['bullion', { grams: 0, value: 0, count: 0 }],
    ['jewelry', { grams: 0, value: 0, count: 0 }],
    ['other', { grams: 0, value: 0, count: 0 }],
  ]);

  for (const holding of holdings) {
    const qty = holding.quantity || 1;
    const holdingGrams = holding.weightGrams * qty;
    totalGrams += holdingGrams;
    totalAcquisitionCost += holding.purchaseCost || 0;

    const valuation = calculateHoldingValuation(holding, prices);
    valuations[holding.id] = valuation;

    const effectiveVal = valuation.totalEstimatedResaleValue ?? valuation.totalEstimatedMarketValue ?? 0;
    if (effectiveVal > 0) {
      estimatedMarketValue += valuation.totalEstimatedMarketValue ?? 0;
      estimatedResaleValue += valuation.totalEstimatedResaleValue ?? 0;
      valuedHoldingsCount++;
    }

    // Provider breakdown
    const provId = holding.providerId.toLowerCase();
    const currProv = providerMap.get(provId) || { grams: 0, value: 0, count: 0 };
    currProv.grams += holdingGrams;
    currProv.value += effectiveVal;
    currProv.count += qty;
    providerMap.set(provId, currProv);

    // Category breakdown
    const cat = holding.category || 'bullion';
    const currCat = categoryMap.get(cat) || { grams: 0, value: 0, count: 0 };
    currCat.grams += holdingGrams;
    currCat.value += effectiveVal;
    currCat.count += qty;
    categoryMap.set(cat, currCat);
  }

  const unrealizedPnL = totalAcquisitionCost > 0 ? estimatedResaleValue - totalAcquisitionCost : 0;
  const unrealizedReturnPct = totalAcquisitionCost > 0 ? (unrealizedPnL / totalAcquisitionCost) * 100 : 0;

  // Breakdown formatting with percentages
  const providerBreakdown = Array.from(providerMap.entries()).map(([providerId, data]) => {
    const info = getProviderInfo(providerId);
    return {
      providerId,
      displayName: info.name,
      grams: Number(data.grams.toFixed(4)),
      value: Math.round(data.value),
      count: data.count,
      percentage: totalGrams > 0 ? Number(((data.grams / totalGrams) * 100).toFixed(1)) : 0,
    };
  });

  const categoryLabels: Record<HoldingCategory, string> = {
    bullion: 'Emas Batangan',
    jewelry: 'Perhiasan',
    other: 'Lainnya',
  };

  const categoryBreakdown = Array.from(categoryMap.entries())
    .filter(([, data]) => data.count > 0)
    .map(([category, data]) => ({
      category,
      displayName: categoryLabels[category] || category,
      grams: Number(data.grams.toFixed(4)),
      value: Math.round(data.value),
      count: data.count,
      percentage: totalGrams > 0 ? Number(((data.grams / totalGrams) * 100).toFixed(1)) : 0,
    }));

  return {
    totalGrams: Number(totalGrams.toFixed(4)),
    totalAcquisitionCost: Math.round(totalAcquisitionCost),
    estimatedMarketValue: Math.round(estimatedMarketValue),
    estimatedResaleValue: Math.round(estimatedResaleValue),
    unrealizedPnL: Math.round(unrealizedPnL),
    unrealizedReturnPct: Number(unrealizedReturnPct.toFixed(2)),
    holdingsCount: holdings.length,
    valuedHoldingsCount,
    providerBreakdown,
    categoryBreakdown,
    valuations,
  };
}
