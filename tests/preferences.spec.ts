import { expect, test } from '@playwright/test';

test('system language, explicit language, and theme persist', async ({
  browser,
}) => {
  const context = await browser.newContext({ locale: 'de-DE' });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Editor öffnen' })).toBeVisible();

  await page.getByRole('button', { name: 'Einstellungen' }).click();
  await page.getByLabel('Sprache').selectOption('es');
  await expect(page.getByRole('link', { name: 'Abrir editor' })).toBeVisible();
  await page.getByRole('radio', { name: 'Oscuro' }).check();
  await expect(page.locator('html')).toHaveAttribute('data-app-theme', 'dark');
  await page.getByRole('button', { name: 'Cerrar ajustes' }).click();

  await page.reload();
  await expect(page.getByRole('link', { name: 'Abrir editor' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.locator('html')).toHaveAttribute('data-app-theme', 'dark');
  await context.close();
});

test('catalogue route uses destination-specific styled loading UI', async ({
  page,
}) => {
  await page.route('**/assets/CataloguePage-*.js', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await route.continue();
  });
  await page.goto('/');
  await page
    .getByRole('link', { name: 'Explorer le catalogue complet' })
    .click();
  await expect(page.getByRole('status')).toHaveText('Chargement du catalogue…');
  await expect(page.locator('.route-state-card')).toBeVisible();
  await expect(page.locator('.catalogue-intro h1')).toContainText(
    'À chaque idée,son diagramme.',
  );
});
