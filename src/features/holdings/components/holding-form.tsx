'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useHoldings } from '@/features/holdings/hooks/use-holdings';
import { goldHoldingSchema } from '@/lib/validation/schemas';
import type { GoldHolding, HoldingCategory } from '@/types/gold';
import { KNOWN_PROVIDERS } from '@/lib/pricing/providers';
import { ArrowLeft, ChevronDown } from 'lucide-react';
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
    <div className="mx-auto max-w-3xl space-y-8 pb-4">
      <header className="space-y-5">
        <Link
          href={isEdit && initialData ? `/holdings/${initialData.id}` : '/holdings'}
          className="inline-flex items-center gap-2 rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {isEdit ? 'Kembali ke detail emas' : 'Kembali ke koleksi'}
        </Link>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {isEdit ? 'Edit catatan emas' : 'Tambah emas'}
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Catat detail emas dan pembelian Anda dalam satu tempat.
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} noValidate className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="space-y-8 p-5 sm:p-8">
            {errors.form && (
              <div role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {errors.form}
              </div>
            )}

          <section aria-labelledby="gold-details-heading" className="space-y-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="gold-details-heading" className="text-base font-semibold">Detail emas</h2>
              <p className="text-xs text-muted-foreground">* Wajib diisi</p>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* Provider Selection */}
              <div className="space-y-1.5">
                <label htmlFor="providerId" className="text-sm font-medium text-foreground">
                  Penyedia emas <span className="text-destructive">*</span>
                </label>
                <Select
                  id="providerId"
                  name="providerId"
                  aria-invalid={Boolean(errors.providerId)}
                  aria-describedby={errors.providerId ? 'providerId-error' : undefined}
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
                  <p id="providerId-error" className="text-xs text-destructive">{errors.providerId}</p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label htmlFor="category" className="text-sm font-medium text-foreground">
                  Kategori <span className="text-destructive">*</span>
                </label>
                <Select
                  id="category"
                  name="category"
                  aria-invalid={Boolean(errors.category)}
                  aria-describedby={errors.category ? 'category-error' : undefined}
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="bullion">Emas Batangan (Logam Mulia)</option>
                  <option value="jewelry">Perhiasan Emas</option>
                  <option value="other">Emas Lainnya (Koin/Dinar)</option>
                </Select>
                {errors.category && <p id="category-error" className="text-xs text-destructive">{errors.category}</p>}
              </div>
            </div>

            {/* Product Name */}
            <div className="space-y-1.5">
              <label htmlFor="productName" className="text-sm font-medium text-foreground">
                Nama produk <span className="text-destructive">*</span>
              </label>
              <Input
                id="productName"
                name="productName"
                aria-invalid={Boolean(errors.productName)}
                aria-describedby={errors.productName ? 'productName-error' : undefined}
                value={formData.productName}
                onChange={handleChange}
                placeholder="Contoh: Emas Batangan Antam CertiCard 5g"
              />
              {errors.productName && (
                <p id="productName-error" className="text-xs text-destructive">{errors.productName}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* Weight */}
              <div className="space-y-1.5">
                <label htmlFor="weightGrams" className="text-sm font-medium text-foreground">
                  Berat per keping (gram) <span className="text-destructive">*</span>
                </label>
                <Input
                  type="number"
                  step="any"
                  id="weightGrams"
                  name="weightGrams"
                  aria-invalid={Boolean(errors.weightGrams)}
                  aria-describedby={errors.weightGrams ? 'weightGrams-error' : undefined}
                  value={formData.weightGrams}
                  onChange={handleChange}
                  placeholder="1.0"
                />
                {errors.weightGrams && (
                  <p id="weightGrams-error" className="text-xs text-destructive">{errors.weightGrams}</p>
                )}
              </div>

              {/* Quantity */}
              <div className="space-y-1.5">
                <label htmlFor="quantity" className="text-sm font-medium text-foreground">
                  Jumlah keping <span className="text-destructive">*</span>
                </label>
                <Input
                  type="number"
                  id="quantity"
                  name="quantity"
                  aria-invalid={Boolean(errors.quantity)}
                  aria-describedby={errors.quantity ? 'quantity-error' : undefined}
                  value={formData.quantity}
                  onChange={handleChange}
                  min="1"
                />
                {errors.quantity && (
                  <p id="quantity-error" className="text-xs text-destructive">{errors.quantity}</p>
                )}
              </div>
            </div>

          </section>

          <section aria-labelledby="purchase-details-heading" className="space-y-5 border-t border-border pt-7">
            <h2 id="purchase-details-heading" className="text-base font-semibold">Pembelian</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* Purchase Date */}
              <div className="space-y-1.5">
                <label htmlFor="purchaseDate" className="text-sm font-medium text-foreground">
                  Tanggal beli <span className="text-destructive">*</span>
                </label>
                <Input
                  type="date"
                  id="purchaseDate"
                  name="purchaseDate"
                  aria-invalid={Boolean(errors.purchaseDate)}
                  aria-describedby={errors.purchaseDate ? 'purchaseDate-error' : undefined}
                  value={formData.purchaseDate}
                  onChange={handleChange}
                />
                {errors.purchaseDate && (
                  <p id="purchaseDate-error" className="text-xs text-destructive">{errors.purchaseDate}</p>
                )}
              </div>

              {/* Purchase Cost */}
              <div className="space-y-1.5">
                <label htmlFor="purchaseCost" className="text-sm font-medium text-foreground">
                  Total harga beli <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-semibold text-muted-foreground select-none pointer-events-none">
                    Rp
                  </span>
                  <Input
                    type="text"
                    inputMode="numeric"
                    id="purchaseCost"
                    name="purchaseCost"
                    aria-invalid={Boolean(errors.purchaseCost)}
                    aria-describedby={errors.purchaseCost ? 'purchaseCost-error' : 'purchaseCost-hint'}
                    value={formatCurrencyInput(formData.purchaseCost)}
                    onChange={handleCurrencyChange}
                    placeholder="0"
                    className="pl-9 font-medium tabular-nums"
                  />
                </div>
                <p id="purchaseCost-hint" className="text-xs leading-relaxed text-muted-foreground">Total untuk seluruh keping, bukan harga per gram.</p>
                {errors.purchaseCost && (
                  <p id="purchaseCost-error" className="text-xs text-destructive">{errors.purchaseCost}</p>
                )}
              </div>
            </div>

          </section>

            {/* Jewelry Specific Attributes (purity & making charges) */}
            {formData.category === 'jewelry' && (
              <section aria-labelledby="jewelry-details-heading" className="space-y-5 border-t border-border pt-7">
                <h2 id="jewelry-details-heading" className="text-base font-semibold">
                  Detail perhiasan <span className="ml-1 text-xs font-normal text-muted-foreground">Opsional</span>
                </h2>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label htmlFor="purity" className="text-sm font-medium text-foreground">
                      Kadar / kemurnian
                    </label>
                    <Input
                      type="number"
                      step="any"
                      id="purity"
                      name="purity"
                      aria-invalid={Boolean(errors.purity)}
                      aria-describedby={errors.purity ? 'purity-error' : 'purity-hint'}
                      value={formData.purity}
                      onChange={handleChange}
                      placeholder="24, 22, 18, atau 750"
                    />
                    <p id="purity-hint" className="text-xs leading-relaxed text-muted-foreground">
                      Contoh: 24k, 22k, 18k, atau 750.
                    </p>
                    {errors.purity && <p id="purity-error" className="text-xs text-destructive">{errors.purity}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="makingCharges" className="text-sm font-medium text-foreground">
                      Ongkos pembuatan
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-semibold text-muted-foreground select-none pointer-events-none">
                        Rp
                      </span>
                      <Input
                        type="text"
                        inputMode="numeric"
                        id="makingCharges"
                      name="makingCharges"
                      aria-invalid={Boolean(errors.makingCharges)}
                      aria-describedby={errors.makingCharges ? 'makingCharges-error' : 'makingCharges-hint'}
                        value={formatCurrencyInput(formData.makingCharges)}
                        onChange={handleCurrencyChange}
                        placeholder="0"
                        className="pl-9 font-medium tabular-nums"
                      />
                    </div>
                    <p id="makingCharges-hint" className="text-xs leading-relaxed text-muted-foreground">
                      Biasanya tidak termasuk dalam nilai buyback.
                    </p>
                    {errors.makingCharges && <p id="makingCharges-error" className="text-xs text-destructive">{errors.makingCharges}</p>}
                  </div>
                </div>
              </section>
            )}

          <details className="group border-t border-border pt-6" open={Boolean(initialData?.notes) || Boolean(errors.notes) || undefined}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
              <span>Catatan tambahan <span className="ml-1 text-xs font-normal text-muted-foreground">Opsional</span></span>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <div className="mt-4 space-y-2">
              <label htmlFor="notes" className="text-sm font-medium text-foreground">Catatan</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                maxLength={500}
                aria-invalid={Boolean(errors.notes)}
                aria-describedby={errors.notes ? 'notes-error' : 'notes-hint'}
                className="w-full resize-y rounded-lg border border-input bg-background p-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Nomor seri, toko pembelian, atau informasi lainnya"
              />
              {errors.notes ? <p id="notes-error" className="text-xs text-destructive">{errors.notes}</p> : (
                <p id="notes-hint" className="text-xs text-muted-foreground">Maksimal 500 karakter.</p>
              )}
            </div>
          </details>
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <Link
            href={isEdit && initialData ? `/holdings/${initialData.id}` : '/holdings'}
            className="inline-flex h-11 items-center justify-center rounded-lg px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Batal
          </Link>
          <Button type="submit" disabled={isSubmitting} className="h-11 px-6 shadow-none">
            {isSubmitting ? 'Menyimpan...' : isEdit ? 'Simpan perubahan' : 'Simpan emas'}
          </Button>
        </footer>
      </form>
      <p className="text-center text-xs text-muted-foreground">Data tersimpan di perangkat Anda.</p>
    </div>
  );
}
