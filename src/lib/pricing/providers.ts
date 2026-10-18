export interface ProviderConfig {
  id: string;
  name: string;
  shortName: string;
  description: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  hasBuyback: boolean;
  website: string;
}

export const KNOWN_PROVIDERS: Record<string, ProviderConfig> = {
  logammulia: {
    id: 'logammulia',
    name: 'PT Antam (Logam Mulia)',
    shortName: 'Antam',
    description: 'Produsen emas batangan terakreditasi LBMA di Indonesia',
    color: '#D97706',
    badgeBg: 'bg-amber-100 dark:bg-amber-950/50',
    badgeText: 'text-amber-800 dark:text-amber-300',
    hasBuyback: true,
    website: 'https://www.logammulia.com',
  },
  galeri24: {
    id: 'galeri24',
    name: 'Galeri 24 (Pegadaian)',
    shortName: 'Galeri 24',
    description: 'Anak perusahaan PT Pegadaian penyedia emas batangan & perhiasan',
    color: '#059669',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/50',
    badgeText: 'text-emerald-800 dark:text-emerald-300',
    hasBuyback: true,
    website: 'https://galeri24.co.id',
  },
  pegadaian: {
    id: 'pegadaian',
    name: 'Pegadaian Tabungan Emas',
    shortName: 'Pegadaian',
    description: 'Layanan titipan emas fisik & cetak emas Pegadaian',
    color: '#10B981',
    badgeBg: 'bg-green-100 dark:bg-green-950/50',
    badgeText: 'text-green-800 dark:text-green-300',
    hasBuyback: true,
    website: 'https://sahabat.pegadaian.co.id',
  },
  hartadinataabadi: {
    id: 'hartadinataabadi',
    name: 'Hartadinata Abadi',
    shortName: 'Hartadinata',
    description: 'Produsen emas batangan EmasKITA & perhiasan emas',
    color: '#8B5CF6',
    badgeBg: 'bg-purple-100 dark:bg-purple-950/50',
    badgeText: 'text-purple-800 dark:text-purple-300',
    hasBuyback: true,
    website: 'https://hartadinataabadi.co.id',
  },
  indogold: {
    id: 'indogold',
    name: 'IndoGold',
    shortName: 'IndoGold',
    description: 'Platform jual beli emas fisik Antam & UBS resmi OJK',
    color: '#3B82F6',
    badgeBg: 'bg-blue-100 dark:bg-blue-950/50',
    badgeText: 'text-blue-800 dark:text-blue-300',
    hasBuyback: true,
    website: 'https://www.indogold.id',
  },
  treasury: {
    id: 'treasury',
    name: 'Treasury',
    shortName: 'Treasury',
    description: 'Aplikasi pedagang fisik emas digital berizin BAPPEBTI',
    color: '#EC4899',
    badgeBg: 'bg-pink-100 dark:bg-pink-950/50',
    badgeText: 'text-pink-800 dark:text-pink-300',
    hasBuyback: true,
    website: 'https://www.treasury.id',
  },
  lakuemas: {
    id: 'lakuemas',
    name: 'Lakuemas',
    shortName: 'Lakuemas',
    description: 'Platform ekosistem emas Central Mega Kencana',
    color: '#F59E0B',
    badgeBg: 'bg-amber-100 dark:bg-amber-950/50',
    badgeText: 'text-amber-800 dark:text-amber-300',
    hasBuyback: true,
    website: 'https://www.lakuemas.com',
  },
};

export function getProviderInfo(providerId: string): ProviderConfig {
  const normalizedId = providerId.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (KNOWN_PROVIDERS[normalizedId]) {
    return KNOWN_PROVIDERS[normalizedId];
  }
  return {
    id: providerId,
    name: providerId.charAt(0).toUpperCase() + providerId.slice(1),
    shortName: providerId,
    description: 'Penyedia Emas Terverifikasi',
    color: '#6B7280',
    badgeBg: 'bg-slate-100 dark:bg-slate-800',
    badgeText: 'text-slate-800 dark:text-slate-200',
    hasBuyback: false,
    website: '#',
  };
}
