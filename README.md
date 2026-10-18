# emasKu — Pelacak Portofolio Emas Fisik PWA

Aplikasi Progressive Web App (PWA) modern untuk investor emas fisik Indonesia. Lacak koleksi emas batangan dan perhiasan, pantau pergerakan harga jual & buyback dari berbagai produsen resmi, serta hitung estimasi nilai likuidasi portofolio secara akurat dan offline-ready.

---

## Fitur Utama

- **Dashboard Portofolio Terpadu**: Pantau total gramasi fisik, estimasi nilai pasar, nilai likuidasi buyback, total modal beli, dan laba/rugi belum terealisasi (*unrealized PnL*).
- **Manajemen Koleksi Emas (CRUD)**:
  - Catat emas batangan (*bullion*), perhiasan (*jewelry*), maupun koin/dinar.
  - Dukungan kadar karat/fineness (24k, 22k, 18k / 750) dan ongkos pembuatan.
  - Input modal beli terformat otomatis dengan pemisah ribuan Rupiah (*currency separator*).
  - Pencarian, filter per produsen/kategori, dan pengurutan (tanggal, bobot, nilai, keuntungan).
- **Pemantauan & Komparasi Harga Emas**:
  - Integrasi API data harga riil produsen resmi: PT Antam (Logam Mulia), Galeri 24 (Pegadaian), Tabungan Emas Pegadaian, Hartadinata Abadi, dan IndoGold.
  - Matriks perbandingan harga jual dan buyback antar produsen untuk berbagai pecahan (0.5g – 100g) beserta selisih (*spread*).
- **Grafik Riwayat Harga**: Visualisasi historis harga jual & buyback menggunakan Recharts tanpa rekayasa data fiktif.
- **Analisis Alokasi Aset**: Diagram donat interaktif untuk melihat komposisi portofolio berdasarkan bobot fisik (gram) maupun nilai valuasi (IDR).
- **Offline-First PWA**:
  - Penyimpanan data lokal aman di perangkat menggunakan IndexedDB (Dexie.js).
  - Cache Service Worker (`public/sw.js`) dan web app manifest (`public/manifest.json`) agar aplikasi dapat diinstal di Android, iOS, maupun Desktop.
  - Snapshot harga otomatis tersimpan untuk referensi ketika offline.
- **Cadangan & Pemulihan Data**:
  - Ekspor portofolio ke format file JSON dan CSV.
  - Impor data cadangan JSON dengan validasi skema Zod dan pratinjau sebelum disimpan.
- **Pengaturan & Personalisasi**:
  - Dukungan tema Gelap (*Dark*), Terang (*Light*), dan Sistem Otomatis.
  - Konfigurasi ambang batas alarm pengingat harga emas.
  - Edukasi & FAQ istilah investasi emas fisik (karat, buyback, spread, LBMA).

---

## Teknologi yang Digunakan

- **Framework**: Next.js 15 (App Router) & React 19
- **Bahasa**: TypeScript (Strict mode)
- **Styling**: Tailwind CSS dengan palet aksen emas premium
- **Komponen UI**: Konvensi shadcn/ui & Lucide React Icons
- **Visualisasi Grafik**: Recharts
- **Database Lokal**: IndexedDB via Dexie.js & `dexie-react-hooks`
- **Data Fetching & Caching**: TanStack Query (React Query)
- **Validasi Skema**: Zod
- **PWA & Offline**: Web App Manifest & Service Worker Cache
- **Pengujian**: Vitest, React Testing Library, dan Playwright E2E

---

## Sumber Data API

Menggunakan API publik komunitas:
- **Repository**: [iamutaki/logam-mulia-api](https://github.com/iamutaki/logam-mulia-api)
- **Base URL**: `https://logam-mulia-api.iamutaki.workers.dev`
- **Proxy Cache Route**: `/api/gold/[...path]` (Next.js route handler dengan ISR cache 300s untuk mencegah limitasi CORS & network timeout).

---

## Memulai Proyek

### 1. Prasyarat

- Node.js versi 20+ atau 22+
- npm versi 10+

### 2. Instalasi Dependensi

```bash
npm install
```

### 3. Konfigurasi Lingkungan

Salin file konfigurasi environment:

```bash
cp .env.example .env.local
```

Isi `.env.local`:

```env
NEXT_PUBLIC_GOLD_PRICE_API_BASE_URL=https://logam-mulia-api.iamutaki.workers.dev
```

### 4. Menjalankan Server Pengembangan

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.

---

## Skrip Pengujian & Build

```bash
# Menjalankan unit & integration test (Vitest)
npm test

# Menjalankan test mode watch
npm run test:watch

# Menjalankan End-to-End test lengkap (Playwright)
npm run test:e2e

# Pemeriksaan linter ESLint
npm run lint

# Membangun versi produksi teroptimasi
npm run build

# Menjalankan server produksi
npm run start
```

---

## Lisensi

Proyek ini dibuat untuk tujuan pencatatan portofolio pribadi dan manajemen aset emas fisik.
