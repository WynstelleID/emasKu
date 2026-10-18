'use client';

import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Coins,
  Scale,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { usePortfolio } from '@/features/portfolio/hooks/use-portfolio';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  formatIDR,
  formatGrams,
  formatPercentage,
  formatDate,
} from '@/lib/utils';
import { getProviderInfo } from '@/lib/pricing/providers';

export function DashboardView() {
  const {
    holdings,
    prices,
    summary,
    isLoading,
    isPricesFetching,
    refetchPrices,
  } = usePortfolio();

  const isProfit = summary.unrealizedPnL >= 0;

  // Key prices for quick ticker (1 gram bar from primary sources)
  const quickPrices = [
    { id: 'logammulia', label: 'Antam 1g' },
    { id: 'galeri24', label: 'Galeri 24 1g' },
    { id: 'pegadaian', label: 'Pegadaian 1g' },
    { id: 'indogold', label: 'IndoGold 1g' },
  ].map((target) => {
    const item = prices.find(
      (p) =>
        p.source.toLowerCase() === target.id &&
        Math.abs(p.weight - 1) < 0.05
    );
    return {
      id: target.id,
      label: target.label,
      price: item?.sellPrice ?? null,
      buyback: item?.buybackPrice ?? null,
      date: item?.recordedDate ?? null,
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Welcome & Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Dashboard Portofolio
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Ringkasan nilai aset emas fisik, estimasi likuidasi, dan pergerakan harga pasar.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchPrices()}
            disabled={isPricesFetching}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPricesFetching ? 'animate-spin' : ''}`} />
            Perbarui Harga
          </Button>

          <Link href="/holdings/new">
            <Button size="sm" className="gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs">
              <PlusCircle className="w-3.5 h-3.5" />
              Tambah Koleksi
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Portfolio Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Estimasi Nilai Pasar */}
        <Card className="relative overflow-hidden border-amber-200/60 dark:border-amber-900/40 bg-gradient-to-br from-card via-card to-amber-500/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Estimasi Nilai Pasar</span>
              <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums text-foreground mt-1">
              {isLoading ? (
                <div className="h-8 w-36 bg-muted animate-pulse rounded" />
              ) : (
                formatIDR(summary.estimatedMarketValue || summary.totalAcquisitionCost)
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground flex items-center justify-between">
              <span>Nilai Buyback (Resale):</span>
              <span className="font-semibold tabular-nums text-foreground">
                {formatIDR(summary.estimatedResaleValue)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Keuntungan / Kerugian (PnL) */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Untung / Rugi (Unrealized)</span>
              {isProfit ? (
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              )}
            </div>
            <div
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums mt-1 ${
                summary.totalAcquisitionCost === 0
                  ? 'text-muted-foreground'
                  : isProfit
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {isLoading ? (
                <div className="h-8 w-28 bg-muted animate-pulse rounded" />
              ) : summary.totalAcquisitionCost === 0 ? (
                'Rp 0'
              ) : (
                formatIDR(summary.unrealizedPnL)
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground flex items-center justify-between">
              <span>Imbal Hasil:</span>
              <span
                className={`font-semibold tabular-nums ${
                  summary.totalAcquisitionCost === 0
                    ? 'text-muted-foreground'
                    : isProfit
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {formatPercentage(summary.unrealizedReturnPct)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Total Bobot Emas */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Total Bobot Emas</span>
              <Scale className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums text-foreground mt-1">
              {isLoading ? (
                <div className="h-8 w-24 bg-muted animate-pulse rounded" />
              ) : (
                formatGrams(summary.totalGrams)
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground flex items-center justify-between">
              <span>Jumlah Keping / Koleksi:</span>
              <span className="font-semibold tabular-nums text-foreground">
                {summary.holdingsCount} unit
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Modal / Biaya Akuisisi */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Total Modal Beli</span>
              <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums text-foreground mt-1">
              {isLoading ? (
                <div className="h-8 w-32 bg-muted animate-pulse rounded" />
              ) : (
                formatIDR(summary.totalAcquisitionCost)
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground flex items-center justify-between">
              <span>Rata-rata / gram:</span>
              <span className="font-semibold tabular-nums text-foreground">
                {summary.totalGrams > 0 && summary.totalAcquisitionCost > 0
                  ? formatIDR(summary.totalAcquisitionCost / summary.totalGrams)
                  : 'Rp -'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Price Monitor Banner */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Harga Emas Pasar Hari Ini (1 Gram)
            </CardTitle>
            <CardDescription className="text-xs">
              Harga acuan terkini dari produsen & platform resmi Indonesia
            </CardDescription>
          </div>
          <Link
            href="/gold-prices"
            className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickPrices.map((p) => (
              <div
                key={p.id}
                className="p-3 rounded-lg border border-border/80 bg-background/50 hover:bg-background transition-colors"
              >
                <div className="text-xs font-medium text-muted-foreground">{p.label}</div>
                <div className="text-base sm:text-lg font-bold tabular-nums text-foreground mt-0.5">
                  {p.price ? formatIDR(p.price) : 'Rp -'}
                </div>
                <div className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between">
                  <span>Buyback:</span>
                  <span className="font-medium text-foreground">
                    {p.buyback ? formatIDR(p.buyback) : '-'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Empty State vs Recent Holdings & Allocation */}
      {holdings.length === 0 ? (
        <Card className="border-dashed border-2 p-8 text-center bg-card/40">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                Mulai Catat Portofolio Emas Anda
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Belum ada emas fisik yang tercatat. Masukkan keping emas Antam, Galeri 24, UBS,
                atau perhiasan emas Anda untuk memantau nilai likuidasi secara otomatis.
              </p>
            </div>
            <Link href="/holdings/new">
              <Button className="bg-amber-600 hover:bg-amber-700 text-white gap-2 text-sm">
                <PlusCircle className="w-4 h-4" />
                Tambah Koleksi Pertama
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Holdings List (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Koleksi Emas Terbaru
              </h2>
              <Link
                href="/holdings"
                className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                Lihat Semua ({holdings.length}) <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {holdings.slice(0, 5).map((holding) => {
                const info = getProviderInfo(holding.providerId);
                const val = summary.valuations[holding.id];
                const holdingProfit = (val?.unrealizedPnL ?? 0) >= 0;

                return (
                  <Link
                    key={holding.id}
                    href={`/holdings/${holding.id}`}
                    className="block p-4 rounded-xl border border-border bg-card hover:border-amber-500/50 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-700 dark:text-amber-300 font-bold text-xs shrink-0">
                          {formatGrams(holding.weightGrams)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-sm text-foreground truncate">
                            {holding.productName}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <span className="font-medium text-foreground">{info.name}</span>
                            <span>•</span>
                            <span>{holding.quantity} keping</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(holding.purchaseDate)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 pl-2">
                        <div className="font-bold text-sm sm:text-base tabular-nums text-foreground">
                          {val?.totalEstimatedResaleValue
                            ? formatIDR(val.totalEstimatedResaleValue)
                            : formatIDR(holding.purchaseCost)}
                        </div>
                        {val?.unrealizedPnL !== null && val?.unrealizedPnL !== undefined && (
                          <div
                            className={`text-xs tabular-nums font-medium ${
                              holdingProfit
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {formatIDR(val.unrealizedPnL)} ({formatPercentage(val.unrealizedReturnPct)})
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Allocation Breakdown Widget (1 col) */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Alokasi Emas per Produsen
                </CardTitle>
                <CardDescription className="text-xs">
                  Berdasarkan berat gram fisik
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {summary.providerBreakdown.map((item) => (
                  <div key={item.providerId} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-foreground">{item.displayName}</span>
                      <span className="text-muted-foreground tabular-nums">
                        {formatGrams(item.grams)} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(item.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}

                <div className="pt-2">
                  <Link href="/portfolio">
                    <Button variant="outline" size="sm" className="w-full text-xs gap-1">
                      Analisis Portofolio Lengkap <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
