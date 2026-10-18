'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  PlusCircle,
  Trash2,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { alertsRepo } from '@/lib/db';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { formatIDR } from '@/lib/utils';
import { KNOWN_PROVIDERS } from '@/lib/pricing/providers';
import type { PriceAlert } from '@/types/gold';

export function NotificationsView() {
  const alerts = useLiveQuery(() => alertsRepo.getAll(), []) ?? [];

  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [provider, setProvider] = useState('logammulia');
  const [targetPrice, setTargetPrice] = useState('2600000');
  const [priceType, setPriceType] = useState<'sell' | 'buyback'>('sell');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  const handleRequestPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const res = await Notification.requestPermission();
      setPermissionStatus(res);
      if (res === 'granted') {
        new Notification('emasKu — Notifikasi Aktif', {
          body: 'Notifikasi browser lokal berhasil diaktifkan.',
          icon: '/icons/icon-192x192.png',
        });
      }
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPrice || Number(targetPrice) <= 0) return;

    setIsSubmitting(true);
    try {
      await alertsRepo.add({
        provider,
        targetPrice: Number(targetPrice),
        priceType,
        condition,
        enabled: true,
        notes: notes || undefined,
      });
      setNotes('');
    } catch (err) {
      console.error('Failed to create alert:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (alert: PriceAlert) => {
    await alertsRepo.update(alert.id, { enabled: !alert.enabled });
  };

  const handleDelete = async (id: string) => {
    await alertsRepo.delete(id);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Bell className="w-6 h-6 text-amber-500" />
          Pengingat & Notifikasi Harga
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Atur alarm batasan harga jual atau buyback untuk memaksimalkan momentum pembelian & penjualan emas.
        </p>
      </div>

      {/* Browser Notification Permission Banner */}
      <Card className="border-amber-200/60 dark:border-amber-900/40 bg-card">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Izin Notifikasi Perangkat Browser
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Status saat ini:{' '}
                <span className="font-semibold text-foreground capitalize">
                  {permissionStatus === 'granted'
                    ? 'Diizinkan (Aktif)'
                    : permissionStatus === 'denied'
                    ? 'Diblokir Pengguna'
                    : 'Belum Dikonfigurasi'}
                </span>
              </p>
            </div>
          </div>

          {permissionStatus !== 'granted' && (
            <Button
              onClick={handleRequestPermission}
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs shrink-0"
            >
              Izinkan Notifikasi Lokal
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Add Alert Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-amber-500" />
            Buat Target Alarm Harga Baru
          </CardTitle>
          <CardDescription className="text-xs">
            Dapatkan peringatan saat harga emas produsen menyentuh atau melewati target yang Anda tentukan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateAlert} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Penyedia Emas</label>
                <Select value={provider} onChange={(e) => setProvider(e.target.value)}>
                  {Object.values(KNOWN_PROVIDERS).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Jenis Harga</label>
                <Select
                  value={priceType}
                  onChange={(e) => setPriceType(e.target.value as 'sell' | 'buyback')}
                >
                  <option value="sell">Harga Jual (Beli dari Toko)</option>
                  <option value="buyback">Harga Buyback (Jual Kembali ke Toko)</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Kondisi Pemicu</label>
                <Select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as 'above' | 'below')}
                >
                  <option value="above">Mencapai Di Atas (&ge;)</option>
                  <option value="below">Turun Di Bawah (&le;)</option>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Target Harga (Rp / gram)</label>
                <Input
                  type="number"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="2500000"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Catatan Target (Opsional)</label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Beli keping Antam 10g jika harga buyback naik"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-amber-600 hover:bg-amber-700 text-white gap-2 text-xs font-semibold"
              >
                <PlusCircle className="w-4 h-4" /> Simpan Pengingat
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Active Alerts List */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-500" />
          Daftar Pengingat Tersimpan ({alerts.length})
        </h3>

        {alerts.length === 0 ? (
          <Card className="p-6 text-center border-dashed">
            <p className="text-xs text-muted-foreground">
              Belum ada alarm target harga yang dibuat.
            </p>
          </Card>
        ) : (
          <div className="space-y-2.5">
            {alerts.map((item) => (
              <Card key={item.id} className="p-4 flex items-center justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400">
                      {item.provider.toUpperCase()}
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      {item.priceType === 'sell' ? 'Harga Jual' : 'Harga Buyback'}{' '}
                      {item.condition === 'above' ? '≥' : '≤'} {formatIDR(item.targetPrice)}
                    </span>
                  </div>
                  {item.notes && (
                    <p className="text-xs text-muted-foreground truncate">{item.notes}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggle(item)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      item.enabled
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {item.enabled ? 'Aktif' : 'Nonaktif'}
                  </button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="text-destructive hover:bg-destructive/10 text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Background Push Infrastructure Limitation Disclaimer */}
      <div className="p-4 rounded-xl bg-background border border-border text-xs text-muted-foreground flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-foreground block">
            Catatan Teknis Pengiriman Notifikasi:
          </span>
          <p>
            Pengingat saat ini diproses secara lokal pada browser saat aplikasi aktif. Notifikasi push latar belakang saat browser tertutup sepenuhnya membutuhkan infrastruktur backend server-side scheduling (VAPID / Web Push Server). Antarmuka konfigurasi ini telah siap terhubung ke backend push saat server dijadwalkan.
          </p>
        </div>
      </div>
    </div>
  );
}
