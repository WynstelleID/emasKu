'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Coins,
  Search,
  PlusCircle,
  Clock,
  Trash2,
  Edit,
  Eye,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
} from 'lucide-react';
import { usePortfolio } from '@/features/portfolio/hooks/use-portfolio';
import { useHoldings } from '@/features/holdings/hooks/use-holdings';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  formatIDR,
  formatGrams,
  formatPercentage,
  formatDate,
} from '@/lib/utils';
import { getProviderInfo } from '@/lib/pricing/providers';
import type { GoldHolding } from '@/types/gold';

// Label and amount row inside a holding card. The amount drops to its own
// line, right aligned, when both do not fit side by side.
const VALUE_ROW_CLASS =
  'flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 text-muted-foreground';

export function HoldingsList() {
  const { holdings, summary } = usePortfolio();
  const { deleteHolding } = useHoldings();

  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'weight' | 'value' | 'pnl'>('date');

  // Deletion modal state
  const [deletingHolding, setDeletingHolding] = useState<GoldHolding | null>(null);

  const filteredHoldings = useMemo(() => {
    return holdings
      .filter((item) => {
        const matchesSearch =
          item.productName.toLowerCase().includes(search.toLowerCase()) ||
          (item.notes && item.notes.toLowerCase().includes(search.toLowerCase()));

        const matchesProvider =
          providerFilter === 'all' ||
          item.providerId.toLowerCase() === providerFilter.toLowerCase();

        const matchesCategory =
          categoryFilter === 'all' || item.category === categoryFilter;

        return matchesSearch && matchesProvider && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'weight') {
          return b.weightGrams * b.quantity - a.weightGrams * a.quantity;
        }
        if (sortBy === 'value') {
          const valA = summary.valuations[a.id]?.totalEstimatedResaleValue ?? a.purchaseCost;
          const valB = summary.valuations[b.id]?.totalEstimatedResaleValue ?? b.purchaseCost;
          return valB - valA;
        }
        if (sortBy === 'pnl') {
          const pnlA = summary.valuations[a.id]?.unrealizedPnL ?? 0;
          const pnlB = summary.valuations[b.id]?.unrealizedPnL ?? 0;
          return pnlB - pnlA;
        }
        // Default by date desc
        return new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime();
      });
  }, [holdings, search, providerFilter, categoryFilter, sortBy, summary.valuations]);

  const handleDeleteConfirm = async () => {
    if (deletingHolding) {
      await deleteHolding(deletingHolding.id);
      setDeletingHolding(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Coins className="w-6 h-6 shrink-0 text-amber-500" />
            Koleksi Emas Fisik
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Daftar lengkap kepemilikan emas batangan dan perhiasan yang tersimpan di brankas Anda.
          </p>
        </div>

        <Link href="/holdings/new" className="shrink-0">
          <Button className="w-full sm:w-auto gap-2 whitespace-nowrap bg-amber-600 hover:bg-amber-700 text-white font-semibold">
            <PlusCircle className="w-4 h-4" />
            Tambah Emas Baru
          </Button>
        </Link>
      </div>

      {/* Filters Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative min-w-0">
              <Search className="pointer-events-none w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari nama emas, sertifikat..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs sm:text-sm"
              />
            </div>

            {/* Provider Filter */}
            <div className="min-w-0">
              <Select
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value)}
                className="text-xs sm:text-sm"
              >
                <option value="all">Semua Produsen</option>
                <option value="logammulia">Antam (Logam Mulia)</option>
                <option value="galeri24">Galeri 24</option>
                <option value="pegadaian">Pegadaian</option>
                <option value="hartadinataabadi">Hartadinata</option>
                <option value="indogold">IndoGold</option>
                <option value="ubs">UBS</option>
                <option value="other">Lainnya</option>
              </Select>
            </div>

            {/* Category Filter */}
            <div className="min-w-0">
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs sm:text-sm"
              >
                <option value="all">Semua Kategori</option>
                <option value="bullion">Emas Batangan</option>
                <option value="jewelry">Perhiasan</option>
                <option value="other">Koin / Lainnya</option>
              </Select>
            </div>

            {/* Sort Options */}
            <div className="min-w-0">
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'weight' | 'value' | 'pnl')}
                className="text-xs sm:text-sm"
              >
                <option value="date">Urutkan: Tanggal Beli</option>
                <option value="weight">Urutkan: Berat Terbesar</option>
                <option value="value">Urutkan: Nilai Tertinggi</option>
                <option value="pnl">Urutkan: Untung Terbesar</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Holdings List */}
      {filteredHoldings.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <div className="max-w-sm mx-auto space-y-3">
            <Coins className="w-10 h-10 text-muted-foreground mx-auto" />
            <h3 className="text-base font-semibold text-foreground">
              {holdings.length === 0
                ? 'Belum ada koleksi emas yang dicatat'
                : 'Tidak ada koleksi yang cocok dengan filter'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {holdings.length === 0
                ? 'Klik tombol Tambah Emas Baru untuk mulai melacak emas fisik Anda.'
                : 'Coba ubah kata kunci pencarian atau bersihkan filter di atas.'}
            </p>
            {holdings.length === 0 && (
              <Link href="/holdings/new">
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5 mt-2">
                  <PlusCircle className="w-4 h-4" /> Tambah Emas
                </Button>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Menampilkan{' '}
            <span className="font-semibold text-foreground tabular-nums">
              {filteredHoldings.length}
            </span>{' '}
            dari {holdings.length} koleksi
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredHoldings.map((holding) => {
              const info = getProviderInfo(holding.providerId);
              const val = summary.valuations[holding.id];
              const isProfit = (val?.unrealizedPnL ?? 0) >= 0;
              const totalGrams = holding.weightGrams * holding.quantity;
  
              return (
                <Card
                  key={holding.id}
                  className="min-w-0 hover:border-amber-500/50 hover:shadow-md transition-all flex flex-col"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="min-w-0 truncate text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                        {info.shortName}
                      </span>
                      <span className="shrink-0 whitespace-nowrap text-sm font-bold tabular-nums text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg">
                        {formatGrams(totalGrams)}
                      </span>
                    </div>
  
                    <h3
                      className="font-bold text-base leading-snug text-foreground line-clamp-2 break-words"
                      title={holding.productName}
                    >
                      {holding.productName}
                    </h3>
  
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        Beli: {formatDate(holding.purchaseDate)}
                      </span>
                      <span aria-hidden>•</span>
                      <span className="whitespace-nowrap">
                        {holding.quantity} keping @ {holding.weightGrams}g
                      </span>
                    </div>
                  </CardHeader>
  
                  <CardContent className="flex flex-1 flex-col gap-3 pt-0">
                    <div className="p-3 rounded-lg bg-background/60 border border-border/80 space-y-1.5 text-xs">
                      <div className={VALUE_ROW_CLASS}>
                        <span>Modal Beli Total:</span>
                        <span className="ml-auto font-medium text-foreground tabular-nums">
                          {formatIDR(holding.purchaseCost)}
                        </span>
                      </div>
                      <div className={VALUE_ROW_CLASS}>
                        <span>Estimasi Resale (Buyback):</span>
                        <span className="ml-auto font-bold text-foreground tabular-nums">
                          {val?.totalEstimatedResaleValue
                            ? formatIDR(val.totalEstimatedResaleValue)
                            : formatIDR(holding.purchaseCost)}
                        </span>
                      </div>
  
                      {val?.unrealizedPnL !== null && val?.unrealizedPnL !== undefined && (
                        <div className={`${VALUE_ROW_CLASS} pt-1.5 border-t border-border/50`}>
                          <span>Untung/Rugi:</span>
                          <span
                            className={`ml-auto font-bold tabular-nums flex items-center gap-1 ${
                              isProfit
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {isProfit ? (
                              <TrendingUp className="w-3 h-3 shrink-0" />
                            ) : (
                              <TrendingDown className="w-3 h-3 shrink-0" />
                            )}
                            {formatIDR(val.unrealizedPnL)} ({formatPercentage(val.unrealizedReturnPct)})
                          </span>
                        </div>
                      )}
                    </div>
  
                    {/* Actions */}
                    <div className="mt-auto flex items-center justify-between pt-2 border-t border-border">
                      <Link href={`/holdings/${holding.id}`}>
                        <Button variant="ghost" size="sm" className="gap-1 text-xs">
                          <Eye className="w-3.5 h-3.5" /> Detail
                        </Button>
                      </Link>
  
                      <div className="flex items-center gap-1">
                        <Link href={`/holdings/${holding.id}/edit`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs"
                            aria-label={`Ubah ${holding.productName}`}
                            title="Ubah"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
  
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingHolding(holding)}
                          className="text-xs text-destructive hover:bg-destructive/10"
                          aria-label={`Hapus ${holding.productName}`}
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog
        open={Boolean(deletingHolding)}
        onOpenChange={(open) => !open && setDeletingHolding(null)}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <ShieldAlert className="w-5 h-5" />
            Hapus Koleksi Emas?
          </DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus <strong>{deletingHolding?.productName}</strong>?
            Tindakan ini akan menghapus data kepemilikan dari database perangkat lokal Anda.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setDeletingHolding(null)}>
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteConfirm}
            className="gap-1.5"
          >
            <Trash2 className="w-4 h-4" /> Ya, Hapus Data
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
