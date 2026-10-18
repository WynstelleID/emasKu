'use client';

import React from 'react';
import { useHolding } from '@/features/holdings/hooks/use-holdings';
import { HoldingForm } from './holding-form';
import { Coins } from 'lucide-react';

export function HoldingEditView({ id }: { id: string }) {
  const { holding, isLoading } = useHolding(id);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">Memuat data koleksi...</p>
      </div>
    );
  }

  if (!holding) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <Coins className="w-12 h-12 text-muted-foreground mx-auto" />
        <h2 className="text-xl font-bold">Koleksi Tidak Ditemukan</h2>
      </div>
    );
  }

  return <HoldingForm initialData={holding} isEdit={true} />;
}
