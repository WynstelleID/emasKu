'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ArrowLeft,
  Calendar,
  RefreshCw,
  BarChart2,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { useHistoricalPrices } from '@/features/gold-prices/api/queries';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { formatIDR, formatGrams, formatDate } from '@/lib/utils';
import { getProviderInfo } from '@/lib/pricing/providers';

export function PriceHistory() {
  const [selectedProvider, setSelectedProvider] = useState('galeri24');
  const [selectedWeight, setSelectedWeight] = useState<number>(1);

  const {
    data: history = [],
    isLoading,
    isFetching,
    refetch,
  } = useHistoricalPrices(selectedProvider);

  // Available weights in this provider's history
  const availableWeights = useMemo(() => {
    const weights = new Set<number>();
    history.forEach((h) => {
      if (h.weight > 0) weights.add(h.weight);
    });
    return Array.from(weights).sort((a, b) => a - b);
  }, [history]);

  // Filter and sort chronologically for Recharts
  const chartData = useMemo(() => {
    return history
      .filter((h) => Math.abs(h.weight - selectedWeight) < 0.01)
      .sort((a, b) => new Date(a.recordedDate).getTime() - new Date(b.recordedDate).getTime())
      .map((item) => ({
        date: formatDate(item.recordedDate),
        rawDate: item.recordedDate,
        sellPrice: item.sellPrice || null,
        buybackPrice: item.buybackPrice || null,
      }));
  }, [history, selectedWeight]);

  const providerInfo = getProviderInfo(selectedProvider);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/gold-prices">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Daftar Harga
              </Button>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-amber-500" />
            Grafik Riwayat Harga Emas
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Tren historis harga jual dan buyback resmi berdasarkan data riil dari penyedia.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-1.5 text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          Perbarui Riwayat
        </Button>
      </div>

      {/* Selector Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Pilih Produsen Emas:
              </label>
              <Select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
              >
                <option value="galeri24">Galeri 24 (Tersedia Jual & Buyback)</option>
                <option value="logammulia">Logam Mulia (Antam)</option>
                <option value="pegadaian">Pegadaian</option>
                <option value="hartadinataabadi">Hartadinata Abadi</option>
                <option value="indogold">IndoGold</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Denominasi Berat:
              </label>
              <Select
                value={String(selectedWeight)}
                onChange={(e) => setSelectedWeight(Number(e.target.value))}
                disabled={availableWeights.length === 0}
              >
                {availableWeights.length > 0 ? (
                  availableWeights.map((w) => (
                    <option key={w} value={String(w)}>
                      {formatGrams(w)}
                    </option>
                  ))
                ) : (
                  <option value="1">1,00 gr</option>
                )}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                Grafik Harga {providerInfo.name} ({formatGrams(selectedWeight)})
              </CardTitle>
              <CardDescription className="text-xs">
                Pergerakan harga jual dan buyback yang tercatat dalam sistem
              </CardDescription>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="font-medium text-foreground">Harga Jual</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="font-medium text-foreground">Harga Buyback</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-72 flex flex-col items-center justify-center space-y-2">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-muted-foreground">Mengambil riwayat harga...</p>
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-72 flex flex-col items-center justify-center space-y-3 text-center p-6">
              <Calendar className="w-10 h-10 text-muted-foreground" />
              <h4 className="text-sm font-semibold text-foreground">
                Riwayat Belum Tersedia
              </h4>
              <p className="text-xs text-muted-foreground max-w-sm">
                Penyedia {providerInfo.shortName} untuk denominasi {formatGrams(selectedWeight)} belum
                memiliki catatan historis yang cukup pada server upstream.
              </p>
            </div>
          ) : (
            <div className="h-80 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ strokeOpacity: 0.3 }}
                  />
                  <YAxis
                    tickFormatter={(val) => `Rp ${(val / 1000).toLocaleString('id-ID')}k`}
                    tick={{ fontSize: 11 }}
                    width={75}
                    tickLine={false}
                    axisLine={{ strokeOpacity: 0.3 }}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip
                    formatter={(value: unknown, name: unknown) => [
                      formatIDR(Number(value)),
                      name === 'sellPrice' ? 'Harga Jual' : 'Harga Buyback',
                    ]}
                    labelFormatter={(label) => `Tanggal: ${label}`}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    formatter={(val) => (val === 'sellPrice' ? 'Harga Jual' : 'Harga Buyback')}
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sellPrice"
                    stroke="#F59E0B"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#F59E0B' }}
                    activeDot={{ r: 6 }}
                    name="sellPrice"
                  />
                  <Line
                    type="monotone"
                    dataKey="buybackPrice"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#10B981' }}
                    activeDot={{ r: 6 }}
                    name="buybackPrice"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transparency Note */}
      <div className="p-4 rounded-xl bg-background border border-border text-xs text-muted-foreground flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-foreground block mb-0.5">
            Transparansi Data Historis:
          </span>
          Semua titik data pada grafik berasal langsung dari pencatatan harian API publik Logam Mulia tanpa interpolasi buatan. Jika terjadi jeda hari libur atau provider belum merilis harga resmi pada tanggal tertentu, sistem tidak akan membuat-buat data fiktif.
        </div>
      </div>
    </div>
  );
}
