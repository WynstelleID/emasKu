'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useHoldings } from '@/features/holdings/hooks/use-holdings';
import { goldHoldingSchema } from '@/lib/validation/schemas';
import type { GoldHolding, HoldingCategory } from '@/types/gold';
import { KNOWN_PROVIDERS } from '@/lib/pricing/providers';
import { ArrowLeft, Save, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface HoldingFormProps {
  initialData?: GoldHolding;
  isEdit?: boolean;
}

// ponytail: native localized thousand separator for currency inputs
function formatCurrencyInput(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '';
  const digits = String(val).replace(/\D/g, '');
  if (!digits) return '';
  return new Intl.NumberFormat('id-ID').format(Number(digits));
}

export function HoldingForm({ initialData, isEdit = false }: HoldingFormProps) {
  const router = useRouter();
  const { addHolding, updateHolding } = useHoldings();

  const [formData, setFormData] = useState({
    providerId: initialData?.providerId || 'logammulia',
    productName: initialData?.productName || 'Emas Batangan 1g',
    category: (initialData?.category || 'bullion') as HoldingCategory,
    weightGrams: initialData?.weightGrams ? String(initialData.weightGrams) : '1',
    quantity: initialData?.quantity ? String(initialData.quantity) : '1',
    purchaseDate: initialData?.purchaseDate || new Date().toISOString().split('T')[0],
    purchaseCost: initialData?.purchaseCost ? String(initialData.purchaseCost) : '0',
    purity: initialData?.purity ? String(initialData.purity) : '24',
    makingCharges: initialData?.makingCharges ? String(initialData.makingCharges) : '0',
    notes: initialData?.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const rawDigits = value.replace(/\D/g, '');
    setFormData((prev) => ({ ...prev, [name]: rawDigits }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const parsed = goldHoldingSchema.safeParse({
      ...formData,
      weightGrams: Number(formData.weightGrams),
      quantity: Number(formData.quantity),
      purchaseCost: Number(formData.purchaseCost),
      purity: formData.purity ? Number(formData.purity) : undefined,
      makingCharges: formData.makingCharges ? Number(formData.makingCharges) : undefined,
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((err) => {
        const fieldName = err.path[0] as string;
        fieldErrors[fieldName] = err.message;
      });
      setErrors(fieldErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      if (isEdit && initialData?.id) {
        await updateHolding(initialData.id, {
          providerId: parsed.data.providerId,
          productName: parsed.data.productName,
          category: parsed.data.category,
          weightGrams: parsed.data.weightGrams,
          quantity: parsed.data.quantity,
          purchaseDate: parsed.data.purchaseDate,
          purchaseCost: parsed.data.purchaseCost,
          purity: parsed.data.purity ?? undefined,
          makingCharges: parsed.data.makingCharges ?? undefined,
          notes: parsed.data.notes ?? undefined,
        });
        router.push(`/holdings/${initialData.id}`);
      } else {
        const newId = await addHolding({
          providerId: parsed.data.providerId,
          productName: parsed.data.productName,
          category: parsed.data.category,
          weightGrams: parsed.data.weightGrams,
          quantity: parsed.data.quantity,
          purchaseDate: parsed.data.purchaseDate,
          purchaseCost: parsed.data.purchaseCost,
          purity: parsed.data.purity ?? undefined,
          makingCharges: parsed.data.makingCharges ?? undefined,
          notes: parsed.data.notes ?? undefined,
        });
        router.push(`/holdings/${newId}`);
      }
    } catch (err) {
      console.error('Failed to save holding:', err);
      setErrors({ form: 'Terjadi kesalahan saat menyimpan data ke database lokal' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link href={isEdit && initialData ? `/holdings/${initialData.id}` : '/holdings'}>
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            {isEdit ? 'Edit Catatan Emas' : 'Tambah Koleksi Emas Fisik'}
          </CardTitle>
          <CardDescription>
            Masukkan informasi kepemilikan emas untuk menghitung estimasi nilai aset dan keuntungan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.form && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {errors.form}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Provider Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Penyedia / Produsen <span className="text-destructive">*</span>
                </label>
                <Select
                  name="providerId"
                  value={formData.providerId}
                  onChange={handleChange}
                >
                  {Object.values(KNOWN_PROVIDERS).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                  <option value="ubs">PT UBS (Untung Bersama Sejahtera)</option>
                  <option value="other">Penyedia / Toko Lain</option>
                </Select>
                {errors.providerId && (
                  <p className="text-xs text-destructive">{errors.providerId}</p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Kategori Emas <span className="text-destructive">*</span>
                </label>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="bullion">Emas Batangan (Logam Mulia)</option>
                  <option value="jewelry">Perhiasan Emas</option>
                  <option value="other">Emas Lainnya (Koin/Dinar)</option>
                </Select>
              </div>
            </div>

            {/* Product Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Nama Produk / Keterangan <span className="text-destructive">*</span>
              </label>
              <Input
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                placeholder="Contoh: Emas Batangan Antam CertiCard 5g"
              />
              {errors.productName && (
                <p className="text-xs text-destructive">{errors.productName}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Weight */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Berat per Keping (Gram) <span className="text-destructive">*</span>
                </label>
                <Input
                  type="number"
                  step="any"
                  name="weightGrams"
                  value={formData.weightGrams}
                  onChange={handleChange}
                  placeholder="1.0"
                />
                {errors.weightGrams && (
                  <p className="text-xs text-destructive">{errors.weightGrams}</p>
                )}
              </div>

              {/* Quantity */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Jumlah (Keping/Unit) <span className="text-destructive">*</span>
                </label>
                <Input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="1"
                />
                {errors.quantity && (
                  <p className="text-xs text-destructive">{errors.quantity}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Purchase Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Tanggal Beli <span className="text-destructive">*</span>
                </label>
                <Input
                  type="date"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                />
                {errors.purchaseDate && (
                  <p className="text-xs text-destructive">{errors.purchaseDate}</p>
                )}
              </div>

              {/* Purchase Cost */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Total Modal Pembelian (Rp) <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-semibold text-muted-foreground select-none pointer-events-none">
                    Rp
                  </span>
                  <Input
                    type="text"
                    inputMode="numeric"
                    name="purchaseCost"
                    value={formatCurrencyInput(formData.purchaseCost)}
                    onChange={handleCurrencyChange}
                    placeholder="0"
                    className="pl-9 font-medium tabular-nums"
                  />
                </div>
                {errors.purchaseCost && (
                  <p className="text-xs text-destructive">{errors.purchaseCost}</p>
                )}
              </div>
            </div>

            {/* Jewelry Specific Attributes (purity & making charges) */}
            {formData.category === 'jewelry' && (
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Detail Perhiasan
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Kadar / Kemurnian (Karat / Fineness)
                    </label>
                    <Input
                      type="number"
                      step="any"
                      name="purity"
                      value={formData.purity}
                      onChange={handleChange}
                      placeholder="24, 22, 18, atau 750"
                    />
                    <span className="text-[11px] text-muted-foreground">
                      Standar: 24k (99.9%), 22k (91.6%), 18k / 750 (75%)
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Ongkos Pembuatan (Rp)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-semibold text-muted-foreground select-none pointer-events-none">
                        Rp
                      </span>
                      <Input
                        type="text"
                        inputMode="numeric"
                        name="makingCharges"
                        value={formatCurrencyInput(formData.makingCharges)}
                        onChange={handleCurrencyChange}
                        placeholder="0"
                        className="pl-9 font-medium tabular-nums"
                      />
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      Biasanya tidak masuk dalam nilai buyback saat dijual kembali
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Catatan (Nomor Seri / Toko Pembelian)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-lg border border-input bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Catatan tambahan seperti nomor seri sertifikat atau nota toko..."
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <Link href="/holdings">
                <Button type="button" variant="outline">
                  Batal
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-amber-600 hover:bg-amber-700 text-white gap-2 font-semibold"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambahkan ke Portofolio'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
