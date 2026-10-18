'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Coins,
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  TrendingUp,
  TrendingDown,
  Info,
  FileText,
} from 'lucide-react';
import { useHolding, useHoldings } from '@/features/holdings/hooks/use-holdings';
import { useAllGoldPrices } from '@/features/gold-prices/api/queries';
import { calculateHoldingValuation } from '@/lib/pricing/financial';
import { getProviderInfo } from '@/lib/pricing/providers';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  formatIDR,
  formatGrams,
  formatPercentage,
  formatDate,
  formatDateTime,
} from '@/lib/utils';

export function HoldingDetail({ id }: { id: string }) {
  const router = useRouter();
  const { holding, isLoading } = useHolding(id);
  const { deleteHolding } = useHoldings();
  const { data: prices = [] } = useAllGoldPrices();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">Memuat detail koleksi emas...</p>
      </div>
    );
  }

  if (!holding) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <Coins className="w-12 h-12 text-muted-foreground mx-auto" />
        <h2 className="text-xl font-bold">Koleksi Tidak Ditemukan</h2>
        <p className="text-sm text-muted-foreground">
          Catatan emas yang Anda cari tidak tersedia atau telah dihapus dari database.
        </p>
        <Link href="/holdings">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Koleksi
          </Button>
        </Link>
      </div>
    );
  }

  const provider = getProviderInfo(holding.providerId);
  const valuation = calculateHoldingValuation(holding, prices);
  const isProfit = (valuation.unrealizedPnL ?? 0) >= 0;
  const totalWeight = holding.weightGrams * holding.quantity;

  const handleDelete = async () => {
    await deleteHolding(holding.id);
    router.push('/holdings');
  };

  const valuationMethodLabels = {
    exact_denomination: 'Kecocokan Pas Denominasi (Akurat)',
    provider_weight_rate: 'Kalkulasi Proporsional Produsen Serupa',
    market_average: 'Rata-rata Harga Pasar Nasional',
    unavailable: 'Belum Ada Data Harga',
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Navigation & Action Controls */}
      <div className="flex items-center justify-between">
        <Link href="/holdings">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Button>
        </Link>

        <div className="flex items-center gap-2">
          <Link href={`/holdings/${holding.id}/edit`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Edit className="w-3.5 h-3.5" /> Edit
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            className="text-destructive hover:bg-destructive/10 text-xs gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" /> Hapus
          </Button>
        </div>
      </div>

      {/* Main Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-card to-card border border-amber-500/20">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="default" className="text-xs font-semibold">
              {provider.name}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {holding.category === 'bullion'
                ? 'Emas Batangan'
                : holding.category === 'jewelry'
                ? 'Perhiasan'
                : 'Lainnya'}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            {holding.productName}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-500" />
            Dibeli pada {formatDate(holding.purchaseDate)}
          </p>
        </div>

        <div className="text-left sm:text-right">
          <div className="text-xs text-muted-foreground">Total Bobot Fisik</div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
            {formatGrams(totalWeight)}
          </div>
          <div className="text-xs text-muted-foreground">
            {holding.quantity} keping × {holding.weightGrams} gr
          </div>
        </div>
      </div>

      {/* Valuation & Profit Analysis Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            Valuasi Nilai & Estimasi Likuidasi Saat Ini
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl bg-background border border-border">
              <span className="text-xs text-muted-foreground">Nilai Buyback (Likuidasi)</span>
              <div className="text-xl font-bold tabular-nums text-foreground mt-1">
                {valuation.totalEstimatedResaleValue
                  ? formatIDR(valuation.totalEstimatedResaleValue)
                  : 'Rp -'}
              </div>
              <span className="text-[11px] text-muted-foreground">
                Harga jual kembali ke produsen
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-background border border-border">
              <span className="text-xs text-muted-foreground">Modal Pembelian Awal</span>
              <div className="text-xl font-bold tabular-nums text-foreground mt-1">
                {formatIDR(holding.purchaseCost)}
              </div>
              <span className="text-[11px] text-muted-foreground">
                {holding.weightGrams > 0
                  ? `@ ${formatIDR(holding.purchaseCost / totalWeight)} / gram`
                  : '-'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-background border border-border">
              <span className="text-xs text-muted-foreground">Keuntungan / Kerugian</span>
              <div
                className={`text-xl font-bold tabular-nums mt-1 flex items-center gap-1 ${
                  isProfit
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {isProfit ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {valuation.unrealizedPnL !== null
                  ? formatIDR(valuation.unrealizedPnL)
                  : 'Rp -'}
              </div>
              <span
                className={`text-[11px] font-semibold tabular-nums ${
                  isProfit
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {formatPercentage(valuation.unrealizedReturnPct)}
              </span>
            </div>
          </div>

          {/* Pricing Match Disclosure */}
          <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-400">
              <Info className="w-3.5 h-3.5" />
              Metode Pencocokan Harga: {valuationMethodLabels[valuation.valuationMethod]}
            </div>
            <p className="text-muted-foreground">
              {valuation.matchedSource ? (
                <>
                  Dihitung menggunakan data acuan dari <strong>{valuation.matchedSource.toUpperCase()}</strong> per tanggal {formatDate(valuation.matchedRecordedDate)}.
                </>
              ) : (
                'Belum ditemukan data harga dari API yang cocok dengan produsen atau berat ini.'
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Holding Attributes Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-500" />
            Spesifikasi & Informasi Pembelian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs sm:text-sm">
            <div className="flex justify-between py-1.5 border-b border-border/60">
              <dt className="text-muted-foreground">Produsen Resmi:</dt>
              <dd className="font-semibold text-foreground">{provider.name}</dd>
            </div>

            <div className="flex justify-between py-1.5 border-b border-border/60">
              <dt className="text-muted-foreground">Kategori Produk:</dt>
              <dd className="font-semibold text-foreground capitalize">{holding.category}</dd>
            </div>

            <div className="flex justify-between py-1.5 border-b border-border/60">
              <dt className="text-muted-foreground">Berat per Unit:</dt>
              <dd className="font-semibold text-foreground tabular-nums">
                {formatGrams(holding.weightGrams)}
              </dd>
            </div>

            <div className="flex justify-between py-1.5 border-b border-border/60">
              <dt className="text-muted-foreground">Jumlah Unit:</dt>
              <dd className="font-semibold text-foreground tabular-nums">
                {holding.quantity} keping
              </dd>
            </div>

            <div className="flex justify-between py-1.5 border-b border-border/60">
              <dt className="text-muted-foreground">Kadar Kemurnian:</dt>
              <dd className="font-semibold text-foreground">
                {holding.purity ? `${holding.purity} Karat` : '24 Karat (99.99%)'}
              </dd>
            </div>

            <div className="flex justify-between py-1.5 border-b border-border/60">
              <dt className="text-muted-foreground">Ongkos Pembuatan:</dt>
              <dd className="font-semibold text-foreground tabular-nums">
                {holding.makingCharges ? formatIDR(holding.makingCharges) : 'Rp 0'}
              </dd>
            </div>

            <div className="flex justify-between py-1.5 border-b border-border/60">
              <dt className="text-muted-foreground">Tanggal Dicatat:</dt>
              <dd className="font-semibold text-foreground">
                {formatDateTime(holding.createdAt)}
              </dd>
            </div>

            <div className="flex justify-between py-1.5 border-b border-border/60">
              <dt className="text-muted-foreground">Terakhir Diperbarui:</dt>
              <dd className="font-semibold text-foreground">
                {formatDateTime(holding.updatedAt)}
              </dd>
            </div>
          </dl>

          {holding.notes && (
            <div className="mt-4 p-3 rounded-lg bg-background border border-border text-xs">
              <span className="font-semibold text-foreground block mb-1">Catatan Tambahan:</span>
              <p className="text-muted-foreground whitespace-pre-wrap">{holding.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center gap-2">
            <Trash2 className="w-5 h-5" /> Konfirmasi Penghapusan
          </DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus data kepemilikan <strong>{holding.productName}</strong>? Tindakan ini permanen.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
            Batal
          </Button>
          <Button variant="destructive" onClick={handleDelete} className="gap-1.5">
            <Trash2 className="w-4 h-4" /> Ya, Hapus Koleksi
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
