# emasKu — Pedoman Identitas Brand & Logo (CertiVault)

Dokumentasi resmi identitas visual dan aset logo **emasKu**.

---

## 1. Konsep & Filosofi Logo

* **Nama Desain:** CertiVault
* **Makna Desain:** Terinspirasi dari segel pelindung *CertiCard* yang menjadi standar emas batangan fisik investasi di Indonesia (Antam & UBS). Batangan emas 3D melambangkan akumulasi kekayaan riil, sedangkan cap bintang 5-sudut di tengah melambangkan jaminan kemurnian emas 999.9 (*fine gold*).
* **Varian Tersedia:**
  * **Simbol Utama (*Master Symbol*):** `emasku-symbol.svg`
  * **Avatar / App Tile (256x256 Squircle):** `emasku-avatar.svg`, `emasku-app-icon.svg`
  * **Lockup Horizontal:** `emasku-lockup-dark.svg` (latar gelap), `emasku-lockup.svg` (latar terang)
  * **Lockup Stacked / Vertikal:** `emasku-stacked.svg`
  * **Monokrom (1-Warna):** `emasku-black.svg` (hitam pekat), `emasku-white.svg` (putih solid), `emasku-mono-f59e0b.svg` (emas solid)
  * **Web & PWA Icons:** `favicon.ico`, `favicon.svg`, `icon-192.png`, `icon-512.png`, `maskable-512.png`, `apple-touch-icon.png`

---

## 2. Area Aman (*Clear Space*) & Proporsi

* **Clear Space Minimum:** $1\times X$, di mana $X$ adalah tebal bingkai kartu (*bezel width*) atau tinggi huruf kecil (*x-height*) pada wordmark.
* Jangan menempatkan teks atau elemen grafis lain di dalam batas zona aman ini.

---

## 3. Batas Ukuran Minimum (*Minimum Sizes*)

| Versi Logo | Layar Digital (*Screen*) | Media Cetak (*Print*) | Catatan |
|---|---|---|---|
| **Simbol Utuh (*CertiVault*)** | 24 × 24 px | 8 × 8 mm | Gunakan varian standar |
| **Favicon Tab Browser** | 16 × 16 px | - | Gunakan `favicon.ico` / `favicon.svg` |
| **Lockup Horizontal** | Lebar min. 120 px | Lebar min. 32 mm | Pertahankan keterbacaan teks `emasKu` |
| **App Icon PWA / iOS** | 48 × 48 px | 12 × 12 mm | Gunakan tile dengan sudut melengkung |

---

## 4. Palet Warna Resmi (*Brand Palette*)

| Peran Warna | Hex Code | Nilai RGB | Penggunaan |
|---|---|---|---|
| **Gold Primary** | `#F59E0B` | `rgb(245, 158, 11)` | Aksen utama, gradasi emas, harga buyback & keuntungan |
| **Gold Light** | `#FEF3C7` | `rgb(254, 243, 199)` | Refleksi cahaya atas batangan emas (*highlight facet*) |
| **Gold Amber** | `#B45309` | `rgb(180, 83, 9)` | Bayangan samping batangan emas (*shadow facet*) |
| **Gold Deep** | `#78350F` | `rgb(120, 53, 15)` | Bevel dasar batangan emas |
| **Charcoal Dark** | `#18181B` | `rgb(24, 24, 27)` | Warna kartu pelindung *CertiCard* & latar gelap |
| **Purity White** | `#FFFBEB` | `rgb(255, 251, 235)` | Cap bintang kemurnian 999.9 (*hallmark*) |

---

## 5. Tipografi Pendukung

* **Aplikasi Web & Mobile:** `Inter` (Google Fonts / Next.js font optimization).
* **Wordmark Brand:** Berbasis sans-serif geometris tegas dengan bobot *Bold*, membedakan 'emas' (putih/charcoal) dan 'Ku' (aksen gradasi emas).

---

## 6. Aturan Penggunaan (*Usage Rules & Don'ts*)

* **DILARANG** meregangkan (*stretch*) atau memampatkan (*squash*) rasio proporsi logo.
* **DILARANG** memutar (*rotate*) logo pada sudut arbitrer.
* **DILARANG** menambahkan efek drop shadow tebal atau stroke luar yang tidak terdaftar.
* **DILARANG** mengganti warna elemen di luar palet resmi brand emasKu.
* **DILARANG** mengubah susunan posisi (*lockup arrangement*) antara simbol dan wordmark.
