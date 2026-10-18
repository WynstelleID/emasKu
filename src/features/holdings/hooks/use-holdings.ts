'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { holdingsRepo } from '@/lib/db';

export function useHoldings() {
  const holdings = useLiveQuery(() => holdingsRepo.getAll(), []);

  return {
    holdings: holdings ?? [],
    isLoading: holdings === undefined,
    addHolding: holdingsRepo.add,
    updateHolding: holdingsRepo.update,
    deleteHolding: holdingsRepo.delete,
    clearHoldings: holdingsRepo.clear,
    bulkAddHoldings: holdingsRepo.bulkAdd,
  };
}

export function useHolding(id: string) {
  const holding = useLiveQuery(() => (id ? holdingsRepo.getById(id) : undefined), [id]);

  return {
    holding,
    isLoading: holding === undefined,
  };
}
