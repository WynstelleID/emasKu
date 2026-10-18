'use client';

import React, { useState } from 'react';
import {
  Settings,
  Download,
  Upload,
  Trash2,
  HelpCircle,
  ShieldCheck,
  Moon,
  Sun,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { useHoldings } from '@/features/holdings/hooks/use-holdings';
import { useTheme } from '@/components/providers/theme-provider';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { portfolioImportSchema } from '@/lib/validation/schemas';
import type { GoldHolding } from '@/types/gold';

export function SettingsView() {
  const { holdings, bulkAddHoldings, clearHoldings } = useHoldings();
  const { theme, setTheme } = useTheme();

  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const [importPreview, setImportPreview] = useState<GoldHolding[] | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);

  // Export JSON
  const handleExportJSON = () => {
    // ponytail: strip internal db id when exporting
    const cleanHoldings = holdings.map(({ id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...rest }) => rest);
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(cleanHoldings, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `emasku_portfolio_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'productName',
      'providerId',
      'category',
      'weightGrams',
      'quantity',
      'purchaseDate',
      'purchaseCost',
      'purity',
      'makingCharges',
      'notes',
    ];

    const rows = holdings.map((h) => [
      `"${h.productName.replace(/"/g, '""')}"`,
      h.providerId,
      h.category,
      h.weightGrams,
      h.quantity,
      h.purchaseDate,
      h.purchaseCost,
      h.purity ?? '',
      h.makingCharges ?? '',
      `"${(h.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `emasku_portfolio_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus({ type: null, message: '' });

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        const validation = portfolioImportSchema.safeParse(parsed);
        if (!validation.success) {
          setImportStatus({
            type: 'error',
            message: `Format file tidak valid: ${validation.error.issues[0]?.message || 'Kesalahan struktur'}`,
          });
          return;
        }

        const validRecords: GoldHolding[] = validation.data.map((item) => ({
          ...item,
          id: item.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())),
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString(),
          purity: item.purity ?? undefined,
          makingCharges: item.makingCharges ?? undefined,
          notes: item.notes ?? undefined,
        }));

        setImportPreview(validRecords);
      } catch (_err) {
        setImportStatus({
          type: 'error',
          message: 'Gagal membaca file JSON. Pastikan file berformat JSON valid.',
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmImport = async () => {
    if (importPreview && importPreview.length > 0) {
      await bulkAddHoldings(importPreview);
      setImportStatus({
        type: 'success',
        message: `Berhasil mengimpor ${importPreview.length} catatan koleksi emas ke portofolio.`,
      });
      setImportPreview(null);
    }
  };

  const handleClearAllData = async () => {
    await clearHoldings();
    setShowClearModal(false);
  };

  const faqs = [
    {
      q: 'Apa perbedaan Harga Jual dan Harga Buyback?',
      a: 'Harga Jual adalah harga saat Anda membeli emas fisik dari produsen/toko emas. Harga Buyback (pembelian kembali) adalah nilai yang Anda terima saat Anda menjual emas fisik tersebut kembali ke toko/produsen.',
    },
    {
      q: 'Apa itu Spread Harga Emas?',
      a: 'Spread adalah selisih antara harga jual dan harga buyback. Semakin kecil spread, semakin cepat investasi emas Anda mencapai titik impas (break-even point).',
    },
    {
      q: 'Mengapa valuasi perhiasan berbeda dengan emas batangan?',
      a: 'Emas batangan umumnya 24 Karat (99.99%) tanpa ongkos pembuatan terbuang. Pada perhiasan, kadar karat lebih bervariasi (misal 18k atau 22k) dan ongkos pembuatan biasanya tidak dinilai saat penjualan kembali (buyback hanya menghitung kadar gram murni).',
    },
    {
      q: 'Apakah data saya aman dan bisa diakses saat offline?',
      a: 'Ya! Seluruh portofolio dan riwayat disimpan secara lokal di perangkat Anda menggunakan IndexedDB browser. Tidak ada data finansial yang diunggah ke server pihak ketiga.',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Settings className="w-6 h-6 text-amber-500" />
          Pengaturan & Manajemen Data
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Kelola preferensi antarmuka, cadangan data (backup/restore), dan informasi aplikasi.
        </p>
      </div>

      {/* Theme Preference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Tampilan & Tema Aplikasi</CardTitle>
          <CardDescription className="text-xs">
            Sesuaikan kenyamanan visual sesuai preferensi pencahayaan Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setTheme('light')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-xs font-semibold transition-all ${
                theme === 'light'
                  ? 'border-amber-500 bg-amber-500/10 text-amber-800 dark:text-amber-300'
                  : 'border-border hover:bg-accent text-muted-foreground'
              }`}
            >
              <Sun className="w-5 h-5 text-amber-500" />
              <span>Terang (Light)</span>
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-xs font-semibold transition-all ${
                theme === 'dark'
                  ? 'border-amber-500 bg-amber-500/10 text-amber-800 dark:text-amber-300'
                  : 'border-border hover:bg-accent text-muted-foreground'
              }`}
            >
              <Moon className="w-5 h-5 text-amber-500" />
              <span>Gelap (Dark)</span>
            </button>

            <button
              onClick={() => setTheme('system')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-xs font-semibold transition-all ${
                theme === 'system'
                  ? 'border-amber-500 bg-amber-500/10 text-amber-800 dark:text-amber-300'
                  : 'border-border hover:bg-accent text-muted-foreground'
              }`}
            >
              <Laptop className="w-5 h-5 text-amber-500" />
              <span>Sistem Otomatis</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Backup & Restore (Export / Import) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            Cadangan & Pemulihan Portofolio
          </CardTitle>
          <CardDescription className="text-xs">
            Ekspor data kepemilikan emas Anda ke file JSON atau CSV, atau pulihkan data dari cadangan sebelumnya.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Message */}
          {importStatus.type && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                importStatus.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-destructive/10 text-destructive border border-destructive/20'
              }`}
            >
              {importStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0" />
              )}
              <span>{importStatus.message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Export Actions */}
            <div className="p-4 rounded-xl border border-border bg-background space-y-2.5">
              <span className="text-xs font-bold text-foreground block">
                Ekspor Data Portofolio ({holdings.length} item)
              </span>
              <p className="text-[11px] text-muted-foreground">
                Unduh file cadangan data untuk disimpan di penyimpanan pribadi Anda.
              </p>
              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportJSON}
                  disabled={holdings.length === 0}
                  className="gap-1.5 text-xs flex-1"
                >
                  <Download className="w-3.5 h-3.5" /> Unduh JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                  disabled={holdings.length === 0}
                  className="gap-1.5 text-xs flex-1"
                >
                  <FileText className="w-3.5 h-3.5" /> Unduh CSV
                </Button>
              </div>
            </div>

            {/* Import Actions */}
            <div className="p-4 rounded-xl border border-border bg-background space-y-2.5">
              <span className="text-xs font-bold text-foreground block">
                Impor Data Cadangan (JSON)
              </span>
              <p className="text-[11px] text-muted-foreground">
                Unggah file JSON valid untuk memulihkan atau menambahkan koleksi.
              </p>
              <label className="cursor-pointer inline-flex items-center justify-center rounded-lg text-xs font-medium border border-border bg-background hover:bg-accent h-8 px-3 w-full gap-1.5 transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Pilih File Cadangan JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Import Preview Dialog */}
          <Dialog
            open={Boolean(importPreview)}
            onOpenChange={(open) => !open && setImportPreview(null)}
          >
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-amber-500" />
                Konfirmasi Impor Data
              </DialogTitle>
              <DialogDescription>
                Ditemukan <strong>{importPreview?.length}</strong> catatan kepemilikan emas valid dalam file.
                Apakah Anda ingin menggabungkan catatan ini ke dalam portofolio Anda?
              </DialogDescription>
            </DialogHeader>

            <div className="max-h-48 overflow-y-auto border border-border rounded-lg p-2 text-xs divide-y divide-border/60">
              {importPreview?.map((item, idx) => (
                <div key={idx} className="py-1.5 flex justify-between">
                  <span className="font-semibold text-foreground">{item.productName}</span>
                  <span className="text-muted-foreground">{item.weightGrams}g ({item.providerId})</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setImportPreview(null)}>
                Batal
              </Button>
              <Button
                onClick={handleConfirmImport}
                className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5 text-xs font-semibold"
              >
                <CheckCircle2 className="w-4 h-4" /> Terapkan ke Portofolio
              </Button>
            </div>
          </Dialog>

          {/* Danger Zone: Clear Local Database */}
          <div className="pt-4 border-t border-border flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-destructive block">
                Hapus Seluruh Data Lokal
              </span>
              <p className="text-[11px] text-muted-foreground">
                Membersihkan database IndexedDB browser secara permanen.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowClearModal(true)}
              className="gap-1.5 text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" /> Kosongkan Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Clear Data Modal */}
      <Dialog open={showClearModal} onOpenChange={setShowClearModal}>
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Hapus Semua Catatan Portofolio?
          </DialogTitle>
          <DialogDescription>
            Tindakan ini akan mengosongkan seluruh catatan koleksi emas dan alarm yang tersimpan di perangkat ini. Data tidak dapat dipulihkan kecuali Anda memiliki file ekspor cadangan.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setShowClearModal(false)}>
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={handleClearAllData}
            className="gap-1.5 text-xs font-semibold"
          >
            <Trash2 className="w-4 h-4" /> Ya, Bersihkan Seluruh Data
          </Button>
        </div>
      </Dialog>

      {/* FAQ & Gold Investment Education */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-500" />
            Panduan & Tanya Jawab Investasi Emas
          </CardTitle>
          <CardDescription className="text-xs">
            Penjelasan istilah penting untuk investor emas fisik pemula dan mahir.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="space-y-1">
              <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                {faq.q}
              </h4>
              <p className="text-xs text-muted-foreground pl-3 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* App Version & Credits */}
      <div className="text-center text-xs text-muted-foreground space-y-1 py-4">
        <p className="font-semibold text-foreground">emasKu PWA v1.0.0 (Production Build)</p>
        <p>
          Data harga emas terintegrasi resmi dari{' '}
          <a
            href="https://github.com/iamutaki/logam-mulia-api"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-600 dark:text-amber-400 underline"
          >
            logam-mulia-api
          </a>
          . Dibuat untuk ekosistem investor emas Indonesia.
        </p>
      </div>
    </div>
  );
}
