'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Search,
  RefreshCw,
  Clock,
  ExternalLink,
  Scale,
  BarChart2,
} from 'lucide-react';
import { useAllGoldPrices, useGoldProviders } from '@/features/gold-prices/api/queries';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { formatIDR, formatGrams, formatDate } from '@/lib/utils';
import { getProviderInfo } from '@/lib/pricing/providers';

// Label and amount row inside a price card. The amount drops to its own
// line, right aligned, when both do not fit side by side.
const PRICE_ROW_CLASS = 'flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5';

export function PriceBoard() {
  const { data: prices = [], isFetching, refetch } = useAllGoldPrices();
  const { data: providers = [] } = useGoldProviders();

  const [search, setSearch] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [selectedWeight, setSelectedWeight] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'compare'>('cards');

  // Extract available weights
  const availableWeights = useMemo(() => {
    const set = new Set<number>();
    prices.forEach((p) => {
      if (p.weight > 0) set.add(p.weight);
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [prices]);

  const filteredPrices = useMemo(() => {
    return prices.filter((p) => {
      const matchesSearch =
        p.displayName.toLowerCase().includes(search.toLowerCase()) ||
        p.materialType.toLowerCase().includes(search.toLowerCase());

      const matchesProvider =
        selectedProvider === 'all' ||
        p.source.toLowerCase() === selectedProvider.toLowerCase();

      const matchesWeight =
        selectedWeight === 'all' ||
        Math.abs(p.weight - Number(selectedWeight)) < 0.001;

      return matchesSearch && matchesProvider && matchesWeight;
    });
  }, [prices, search, selectedProvider, selectedWeight]);

  // Comparison Matrix by denomination: 0.5g, 1g, 2g, 5g, 10g, 25g, 50g, 100g
  const compareWeights = [0.5, 1, 2, 5, 10, 25, 50, 100];
  const compareSources = ['logammulia', 'galeri24', 'pegadaian', 'indogold'];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <TrendingUp className="w-6 h-6 shrink-0 text-amber-500" />
            Harga Emas Terkini
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitoring harga jual dan buyback langsung dari produsen resmi Indonesia.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Link href="/gold-prices/history">
            <Button variant="outline" size="sm" className="gap-1.5 whitespace-nowrap text-xs">
              <BarChart2 className="w-4 h-4 text-amber-500" /> Grafik Riwayat
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Perbarui
          </Button>
        </div>
      </div>

      {/* Switcher & Filter Controls */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className="text-xs"
              >
                Daftar Harga
              </Button>
              <Button
                variant={viewMode === 'compare' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('compare')}
                className="text-xs"
              >
                Perbandingan Antar Produsen
              </Button>
            </div>

            <div className="text-xs text-muted-foreground flex items-center gap-1.5 whitespace-nowrap">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              Total data: <span className="font-semibold text-foreground">{prices.length}</span> keping
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Search */}
            <div className="relative min-w-0">
              <Search className="pointer-events-none w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari jenis emas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>

            {/* Provider Filter */}
            <Select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="text-xs"
            >
              <option value="all">Semua Produsen ({providers.length})</option>
              {providers.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.displayName || p.name}
                </option>
              ))}
            </Select>

            {/* Weight Filter */}
            <Select
              value={selectedWeight}
              onChange={(e) => setSelectedWeight(e.target.value)}
              className="text-xs"
            >
              <option value="all">Semua Denominasi Berat</option>
              {availableWeights.map((w) => (
                <option key={w} value={String(w)}>
                  {formatGrams(w)}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Comparison View */}
      {viewMode === 'compare' ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Scale className="w-4 h-4 shrink-0 text-amber-500" />
              Matriks Perbandingan Harga Jual & Buyback
            </CardTitle>
            <CardDescription className="text-xs">
              Bandingkan harga jual dan harga pembelian kembali (buyback) dari beberapa produsen utama.
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="sticky left-0 z-10 bg-muted py-2.5 px-3 font-semibold whitespace-nowrap">
                    Denominasi
                  </th>
                  {compareSources.map((s) => {
                    const info = getProviderInfo(s);
                    return (
                      <th key={s} className="py-2.5 px-3 font-semibold text-center whitespace-nowrap">
                        {info.shortName}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {compareWeights.map((w) => (
                  <tr key={w} className="hover:bg-accent/40 transition-colors">
                    <td className="sticky left-0 z-10 bg-card py-3 px-3 font-bold tabular-nums text-foreground whitespace-nowrap">
                      {formatGrams(w)}
                    </td>
                    {compareSources.map((s) => {
                      const item = prices.find(
                        (p) => p.source.toLowerCase() === s && Math.abs(p.weight - w) < 0.01
                      );
                      const spread =
                        item?.sellPrice && item?.buybackPrice
                          ? item.sellPrice - item.buybackPrice
                          : null;

                      return (
                        <td key={s} className="py-3 px-3 text-center tabular-nums whitespace-nowrap align-top">
                          {item ? (
                            <div className="space-y-0.5">
                              <div className="font-bold text-foreground">
                                {item.sellPrice ? formatIDR(item.sellPrice) : '-'}
                              </div>
                              <div className="text-[11px] text-muted-foreground">
                                Buyback: {item.buybackPrice ? formatIDR(item.buybackPrice) : '-'}
                              </div>
                              {spread !== null && (
                                <div className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                                  Spread: {formatIDR(spread)}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : filteredPrices.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <div className="max-w-sm mx-auto space-y-2">
            <Search className="w-9 h-9 text-muted-foreground mx-auto" />
            <h3 className="text-base font-semibold text-foreground">
              {isFetching
                ? 'Memuat harga emas...'
                : prices.length === 0
                ? 'Belum ada data harga'
                : 'Tidak ada harga yang cocok dengan filter'}
            </h3>
            {!isFetching && (
              <p className="text-xs text-muted-foreground">
                {prices.length === 0
                  ? 'Klik Perbarui untuk mengambil harga terbaru.'
                  : 'Coba ubah kata kunci pencarian atau filter di atas.'}
              </p>
            )}
          </div>
        </Card>
      ) : (
        /* Regular Card Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filteredPrices.map((item) => {
            const info = getProviderInfo(item.source);
            const spread =
              item.sellPrice && item.buybackPrice ? item.sellPrice - item.buybackPrice : null;

            return (
              <Card
                key={item.id}
                className="min-w-0 hover:border-amber-500/50 hover:shadow-sm transition-all flex flex-col"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                      {info.shortName}
                    </span>
                    <span className="shrink-0 whitespace-nowrap text-xs font-bold tabular-nums text-foreground bg-accent px-2 py-0.5 rounded">
                      {formatGrams(item.weight)}
                    </span>
                  </div>
                  <CardTitle
                    className="text-sm font-semibold leading-snug line-clamp-2 break-words mt-2"
                    title={item.materialType}
                  >
                    {item.materialType}
                  </CardTitle>
                  <CardDescription className="text-[11px] flex items-center gap-1">
                    <Clock className="w-3 h-3 shrink-0" /> Tanggal: {formatDate(item.recordedDate)}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col gap-2 pt-0">
                  <div className="p-3 rounded-lg bg-background border border-border/80 space-y-1.5 text-xs">
                    <div className={PRICE_ROW_CLASS}>
                      <span className="text-muted-foreground">Harga Jual:</span>
                      <span className="ml-auto font-extrabold text-foreground tabular-nums text-sm">
                        {item.sellPrice ? formatIDR(item.sellPrice) : '-'}
                      </span>
                    </div>

                    <div className={PRICE_ROW_CLASS}>
                      <span className="text-muted-foreground">Harga Buyback:</span>
                      <span className="ml-auto font-semibold text-foreground tabular-nums">
                        {item.buybackPrice ? formatIDR(item.buybackPrice) : 'Tidak ada data'}
                      </span>
                    </div>

                    {spread !== null && (
                      <div className={`${PRICE_ROW_CLASS} pt-1.5 border-t border-border/60 text-[11px]`}>
                        <span className="text-muted-foreground">Selisih (Spread):</span>
                        <span className="ml-auto font-medium text-amber-600 dark:text-amber-400 tabular-nums">
                          {formatIDR(spread)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground pt-1">
                    <span className="min-w-0 truncate">Sumber: {info.name}</span>
                    {info.website && info.website !== '#' && (
                      <a
                        href={info.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 whitespace-nowrap hover:text-foreground flex items-center gap-1"
                      >
                        Web Resmi <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
