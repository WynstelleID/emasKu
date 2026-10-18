import { z } from 'zod';

export const holdingCategorySchema = z.enum(['bullion', 'jewelry', 'other']);

export const goldHoldingSchema = z.object({
  id: z.string().optional(),
  providerId: z.string().min(1, 'Penyedia emas wajib dipilih'),
  productName: z.string().min(2, 'Nama produk minimal 2 karakter'),
  category: holdingCategorySchema,
  weightGrams: z.coerce.number().positive('Berat harus lebih dari 0 gram'),
  quantity: z.coerce.number().int().positive('Jumlah keping minimal 1'),
  purchaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
  purchaseCost: z.coerce.number().min(0, 'Harga beli tidak boleh negatif'),
  purity: z.coerce.number().min(0).max(999.99).optional().nullable(),
  makingCharges: z.coerce.number().min(0).optional().nullable(),
  notes: z.string().max(500, 'Catatan maksimal 500 karakter').optional().nullable(),
});

export type GoldHoldingFormData = z.infer<typeof goldHoldingSchema>;

// API raw response schema
export const apiRawPriceItemSchema = z.object({
  source: z.string(),
  material: z.string().optional(),
  materialType: z.string().optional(),
  weight: z.number(),
  weightUnit: z.string().optional(),
  sellPrice: z.number().nullable().optional(),
  buybackPrice: z.number().nullable().optional(),
  currency: z.string().optional(),
  recordedDate: z.string(),
  createdAt: z.string().optional(),
  displayName: z.string().optional(),
  logo: z.string().optional(),
  favicon: z.string().nullable().optional(),
  url: z.string().optional(),
  urlHomepage: z.string().nullable().optional(),
});

export const apiPricesResponseSchema = z.object({
  success: z.boolean().optional(),
  data: z.array(apiRawPriceItemSchema).optional(),
  error: z.string().optional(),
  timestamp: z.string().optional(),
});

export const apiProviderItemSchema = z.object({
  name: z.string(),
  displayName: z.string(),
  logo: z.string().optional().nullable(),
  favicon: z.string().optional().nullable(),
  cover: z.string().optional().nullable(),
  url: z.string(),
  urlHomepage: z.string().optional().nullable(),
});

export const apiProvidersResponseSchema = z.object({
  data: z.array(apiProviderItemSchema),
});

export const priceAlertSchema = z.object({
  provider: z.string().min(1, 'Penyedia wajib dipilih'),
  targetPrice: z.coerce.number().positive('Target harga harus lebih dari 0'),
  priceType: z.enum(['sell', 'buyback']),
  condition: z.enum(['above', 'below']),
  enabled: z.boolean().default(true),
  notes: z.string().max(200).optional(),
});

export type PriceAlertFormData = z.infer<typeof priceAlertSchema>;

// Portfolio Import Schema (JSON)
export const portfolioImportSchema = z.array(
  z.object({
    id: z.string().optional(),
    providerId: z.string().min(1),
    productName: z.string().min(1),
    category: holdingCategorySchema.catch('bullion'),
    weightGrams: z.coerce.number().positive(),
    quantity: z.coerce.number().int().positive(),
    purchaseDate: z.string(),
    purchaseCost: z.coerce.number().min(0),
    purity: z.coerce.number().optional().nullable(),
    makingCharges: z.coerce.number().optional().nullable(),
    notes: z.string().optional().nullable(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
);
