'use client';

import { useMemo } from 'react';
import { useHoldings } from '@/features/holdings/hooks/use-holdings';
import { useAllGoldPrices } from '@/features/gold-prices/api/queries';
import { calculatePortfolioSummary } from '@/lib/pricing/financial';
import type { PortfolioSummary } from '@/types/gold';

export function usePortfolio() {
  const { holdings, isLoading: isHoldingsLoading } = useHoldings();
  const {
    data: prices = [],
    isLoading: isPricesLoading,
    isError: isPricesError,
    error: pricesError,
    refetch: refetchPrices,
    isFetching: isPricesFetching,
  } = useAllGoldPrices();

  const summary: PortfolioSummary = useMemo(() => {
    return calculatePortfolioSummary(holdings, prices);
  }, [holdings, prices]);

  return {
    holdings,
    prices,
    summary,
    isLoading: isHoldingsLoading || isPricesLoading,
    isHoldingsLoading,
    isPricesLoading,
    isPricesFetching,
    isPricesError,
    pricesError,
    refetchPrices,
  };
}
