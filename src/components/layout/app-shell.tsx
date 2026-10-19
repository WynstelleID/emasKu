'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Coins,
  TrendingUp,
  PieChart,
  Settings,
  PlusCircle,
  WifiOff,
  Sun,
  Moon,
  Bell,
} from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/providers/theme-provider';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/holdings', label: 'Koleksi', icon: Coins },
  { href: '/gold-prices', label: 'Harga Emas', icon: TrendingUp },
  { href: '/portfolio', label: 'Portofolio', icon: PieChart },
  { href: '/settings', label: 'Pengaturan', icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { setTheme, isDark } = useTheme();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row pb-20 md:pb-0">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card/60 backdrop-blur-md shrink-0 sticky top-0 h-screen z-30">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2.5">
            <Logo className="w-9 h-9 shrink-0 drop-shadow-md" size={36} />
            <div>
              <span className="font-bold text-lg tracking-tight text-foreground flex items-center gap-1.5">
                emasKu
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  PWA
                </span>
              </span>
              <p className="text-[11px] text-muted-foreground">Portfolio Emas Fisik</p>
            </div>
          </Link>
        </div>

        {/* Quick Add Button */}
        <div className="p-4">
          <Link href="/holdings/new">
            <Button className="w-full justify-start gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-sm">
              <PlusCircle className="w-4 h-4" />
              <span>Tambah Emas</span>
            </Button>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <Icon className={cn('w-4 h-4', isActive ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground')} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <Link
            href="/notifications"
            className={cn(
              'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors',
              pathname.startsWith('/notifications')
                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            <Bell className="w-4 h-4" />
            <span>Notifikasi</span>
          </Link>
        </nav>

        {/* Sidebar Footer: Connectivity & Theme */}
        <div className="p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Online
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                <WifiOff className="w-3.5 h-3.5" />
                Offline
              </span>
            )}
          </div>
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="p-1.5 rounded-lg hover:bg-accent text-foreground transition-colors"
            title="Ganti Tema"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-4 sm:px-6">
          <div className="flex items-center gap-2 md:hidden">
            <Link href="/" className="flex items-center space-x-2">
              <Logo className="w-8 h-8 shrink-0 drop-shadow-sm" size={32} />
              <span className="font-bold text-base tracking-tight text-foreground">
                emasKu
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-2">
            {!isOnline && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-xs font-medium">
                <WifiOff className="w-3.5 h-3.5" />
                Mode Offline — Menampilkan data tersimpan di perangkat
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Link href="/holdings/new" className="md:hidden">
              <Button size="sm" className="gap-1.5 bg-amber-600 hover:bg-amber-700 text-white">
                <PlusCircle className="w-4 h-4" />
                <span className="text-xs">Tambah</span>
              </Button>
            </Link>

            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="md:hidden p-2 rounded-lg border border-border text-foreground hover:bg-accent transition-colors"
              aria-label="Ganti Tema"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Offline Banner for Mobile */}
        {!isOnline && (
          <div className="md:hidden bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <WifiOff className="w-3.5 h-3.5 shrink-0" />
              Anda sedang offline. Data portofolio tetap tersedia.
            </span>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border flex items-center justify-around h-16 px-1 safe-area-pb">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition-colors',
                isActive
                  ? 'text-amber-600 dark:text-amber-400 font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('w-5 h-5 mb-0.5', isActive ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground')} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
