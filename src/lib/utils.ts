import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ponytail: use standard tailwind merger helper
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ponytail: native Intl formatters, no bloated moment/numeral dependencies
const idrFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export function formatIDR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return 'Rp -';
  return idrFormatter.format(amount);
}

export function formatGrams(grams: number | null | undefined): string {
  if (grams === null || grams === undefined || isNaN(grams)) return '0,00 gr';
  return (
    new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(grams) + ' gr'
  );
}

export function formatDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '-';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '-';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatPercentage(pct: number | null | undefined): string {
  if (pct === null || pct === undefined || isNaN(pct)) return '0,00%';
  const prefix = pct > 0 ? '+' : '';
  return prefix + pct.toFixed(2).replace('.', ',') + '%';
}
