'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  PieChart as PieIcon,
  Scale,
  Coins,
  PlusCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { usePortfolio } from '@/features/portfolio/hooks/use-portfolio';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  formatIDR,
  formatGrams,
  formatPercentage,
} from '@/lib/utils';
import { getProviderInfo } from '@/lib/pricing/providers';

const COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280'];

export function PortfolioView() {
  const { holdings, summary } = usePortfolio();
  const [allocationMetric, setAllocationMetric] = useState<'weight' | 'value'>('weight');

  const providerChartData = summary.providerBreakdown.map((item) => ({
    name: item.displayName,
    value: allocationMetric === 'weight' ? item.grams : item.value,
    percentage: item.percentage,
  }));

  const categoryChartData = summary.categoryBreakdown.map((item) => ({
    name: item.displayName,
    value: allocationMetric === 'weight' ? item.grams : item.value,
    percentage: item.percentage,
  }));

  const isProfit = summary.unrealizedPnL >= 0;

  if (holdings.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
          <PieIcon className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold">Portofolio Emas Masih Kosong</h2>
        <p className="text-sm text-muted-foreground">
          Tambahkan koleksi emas batangan atau perhiasan Anda untuk melihat analisis alokasi aset,
          proporsi berat fisik, dan simulasi nilai likuidasi buyback.
        </p>
        <Link href="/holdings/new">
          <Button className="bg-amber-600 hover:bg-amber-700 text-white gap-2">
            <PlusCircle className="w-4 h-4" /> Tambah Emas Pertama
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <PieIcon className="w-6 h-6 text-amber-500" />
            Analisis Portofolio & Alokasi
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Komposisi aset fisik berdasarkan bobot gramasi dan nilai estimasi pasar terkini.
          </p>
        </div>

        {/* Metric Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-muted rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setAllocationMetric('weight')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              allocationMetric === 'weight'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Berdasarkan Bobot (Gram)
          </button>
          <button
            onClick={() => setAllocationMetric('value')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              allocationMetric === 'value'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Berdasarkan Nilai (Rp)
          </button>
        </div>
      </div>

      {/* Financial Health Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <span className="text-xs font-medium text-muted-foreground">
              Total Modal Pembelian
            </span>
            <div className="text-2xl font-extrabold tabular-nums text-foreground mt-1">
              {formatIDR(summary.totalAcquisitionCost)}
            </div>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {summary.holdingsCount} koleksi fisik tercatat
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <span className="text-xs font-medium text-muted-foreground">
              Estimasi Likuidasi (Buyback)
            </span>
            <div className="text-2xl font-extrabold tabular-nums text-foreground mt-1">
              {formatIDR(summary.estimatedResaleValue)}
            </div>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Nilai jual kembali jika dicairkan hari ini
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <span className="text-xs font-medium text-muted-foreground">
              Keuntungan Bersih (Unrealized)
            </span>
            <div
              className={`text-2xl font-extrabold tabular-nums mt-1 ${
                isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {formatIDR(summary.unrealizedPnL)}
            </div>
          </CardHeader>
          <CardContent
            className={`text-xs font-semibold tabular-nums ${
              isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            Imbal Hasil: {formatPercentage(summary.unrealizedReturnPct)}
          </CardContent>
        </Card>
      </div>

      {/* Allocation Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Provider Breakdown Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-500" />
              Alokasi per Produsen Emas
            </CardTitle>
            <CardDescription className="text-xs">
              Distribusi aset menurut sertifikat produsen (Antam, Galeri 24, UBS, dll)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={providerChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {providerChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [
                      allocationMetric === 'weight' ? formatGrams(Number(val)) : formatIDR(Number(val)),
                      'Proporsi',
                    ]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-500" />
              Alokasi per Kategori Produk
            </CardTitle>
            <CardDescription className="text-xs">
              Distribusi antara Emas Batangan, Perhiasan, dan Koin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryChartData.map((_, index) => (
                      <Cell key={`cell-cat-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [
                      allocationMetric === 'weight' ? formatGrams(Number(val)) : formatIDR(Number(val)),
                      'Proporsi',
                    ]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Holdings Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-500" />
            Rincian Kontribusi Koleksi
          </CardTitle>
          <CardDescription className="text-xs">
            Evaluasi per keping terhadap portofolio keseluruhan
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="py-2.5 px-3 font-semibold">Produk Emas</th>
                <th className="py-2.5 px-3 font-semibold">Produsen</th>
                <th className="py-2.5 px-3 font-semibold text-right">Bobot Total</th>
                <th className="py-2.5 px-3 font-semibold text-right">Modal Awal</th>
                <th className="py-2.5 px-3 font-semibold text-right">Nilai Buyback</th>
                <th className="py-2.5 px-3 font-semibold text-right">Untung / Rugi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {holdings.map((h) => {
                const info = getProviderInfo(h.providerId);
                const val = summary.valuations[h.id];
                const profit = (val?.unrealizedPnL ?? 0) >= 0;
                const totalGrams = h.weightGrams * h.quantity;

                return (
                  <tr key={h.id} className="hover:bg-accent/40 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-foreground">
                      <Link href={`/holdings/${h.id}`} className="hover:underline">
                        {h.productName}
                      </Link>
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground">{info.shortName}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-foreground">
                      {formatGrams(totalGrams)}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-foreground">
                      {formatIDR(h.purchaseCost)}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-foreground">
                      {val?.totalEstimatedResaleValue
                        ? formatIDR(val.totalEstimatedResaleValue)
                        : formatIDR(h.purchaseCost)}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right tabular-nums font-semibold ${
                        profit
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {val?.unrealizedPnL !== null ? formatIDR(val.unrealizedPnL) : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
