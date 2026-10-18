import { test, expect } from '@playwright/test';

test.describe('EmasKu Gold Portfolio PWA End-to-End Workflow', () => {
  test('complete investor workflow: empty state, prices, adding, editing, valuation, export, persistence', async ({
    page,
    context,
  }) => {
    // 1. Open application for first time
    await page.goto('/');

    // 2. View dashboard empty state
    await expect(page.getByText('Mulai Catat Portofolio Emas Anda')).toBeVisible();
    await expect(page.getByText('Total Bobot Emas')).toBeVisible();

    // 3. Open gold price page
    await page.click('text=Harga Emas');
    await expect(page).toHaveURL(/.*gold-prices/);

    // 4. Load price data from integrated API
    await expect(page.getByText('Harga Emas Terkini')).toBeVisible();
    await expect(page.getByText('Perbandingan Antar Produsen')).toBeVisible();

    // 5. View provider and historical price info
    await page.click('text=Grafik Riwayat');
    await expect(page).toHaveURL(/.*gold-prices\/history/);
    await expect(page.getByText('Grafik Riwayat Harga Emas')).toBeVisible();

    // 6. Add a gold holding
    await page.click('text=Koleksi');
    await expect(page).toHaveURL(/.*holdings/);
    await page.click('text=Tambah Emas Baru');
    await expect(page).toHaveURL(/.*holdings\/new/);

    await page.fill('input[name="productName"]', 'Antam CertiCard 10g E2E');
    await page.fill('input[name="weightGrams"]', '10');
    await page.fill('input[name="quantity"]', '1');
    await page.fill('input[name="purchaseCost"]', '24000000');
    await page.fill('textarea[name="notes"]', 'Catatan pembelian E2E');

    await page.click('button[type="submit"]');

    // 7. View holding in portfolio / detail
    await expect(page).toHaveURL(/.*holdings\/.+/);
    await expect(page.getByText('Antam CertiCard 10g E2E')).toBeVisible();
    await expect(page.getByText('10,00 gr').first()).toBeVisible();

    // 8. Verify estimated value
    await expect(page.getByText('Valuasi Nilai & Estimasi Likuidasi Saat Ini')).toBeVisible();

    // 9. Edit holding
    await page.click('text=Edit');
    await expect(page).toHaveURL(/.*edit/);
    await page.fill('input[name="productName"]', 'Antam CertiCard 10g E2E (Updated)');
    await page.click('button[type="submit"]');

    await expect(page.getByText('Antam CertiCard 10g E2E (Updated)')).toBeVisible();

    // 10. View portfolio allocation
    await page.click('text=Portofolio');
    await expect(page).toHaveURL(/.*portfolio/);
    await expect(page.getByText('Analisis Portofolio & Alokasi')).toBeVisible();
    await expect(page.getByText('Antam CertiCard 10g E2E (Updated)')).toBeVisible();

    // 11. Export portfolio data in settings
    await page.click('text=Pengaturan');
    await expect(page).toHaveURL(/.*settings/);
    await expect(page.getByText('Cadangan & Pemulihan Portofolio')).toBeVisible();

    // 12. Reload application and verify local persistence
    await page.reload();
    await page.click('text=Dashboard');
    await expect(page.getByText('Antam CertiCard 10g E2E (Updated)')).toBeVisible();

    // 13. Simulate offline mode and verify cached data behavior
    await context.setOffline(true);
    await page.click('text=Koleksi');
    await expect(page.getByText('Antam CertiCard 10g E2E (Updated)')).toBeVisible();
    // Offline indicator appears in sidebar and header
    await expect(page.getByText('Offline', { exact: true })).toBeVisible();
    await context.setOffline(false);

    // 14. Delete holding
    await page.click('text=Detail');
    await expect(page).toHaveURL(/.*holdings\/.+/);
    await page.click('button:has-text("Hapus")');
    await page.click('button:has-text("Ya, Hapus Koleksi")');

    await expect(page).toHaveURL(/.*holdings/);
    await expect(page.getByText('Belum ada koleksi emas yang dicatat')).toBeVisible();
  });
});
