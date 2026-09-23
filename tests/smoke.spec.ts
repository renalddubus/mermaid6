import { expect, test } from '@playwright/test';

for (const viewport of [
  { width: 1280, height: 800 },
  { width: 375, height: 812 },
]) {
  test(`l’application démarre sans erreur à ${viewport.width}px`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    await page.setViewportSize(viewport);
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Mermaid6, accueil' }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
  });
}

test('le conteneur sert sa santé et les ressources de production', async ({
  request,
}) => {
  test.skip(
    !process.env.PLAYWRIGHT_BASE_URL,
    'Contrôle du serveur Docker uniquement.',
  );
  const health = await request.get('/healthz');
  expect(health.status()).toBe(200);
  expect((await health.text()).trim()).toBe('ok');
  const home = await request.get('/');
  expect(home.headers()['x-content-type-options']).toBe('nosniff');
  expect(home.headers()['cache-control']).toContain('no-cache');
  const html = await home.text();
  const scriptPath = html.match(/src="(\/assets\/[^"]+\.js)"/)?.[1];
  expect(scriptPath).toBeDefined();
  const script = await request.get(scriptPath!);
  expect(script.status()).toBe(200);
  expect(script.headers()['content-type']).toContain('javascript');
  expect(script.headers()['cache-control']).toContain('max-age=31536000');
  const missing = await request.get('/assets/does-not-exist.js');
  expect(missing.status()).toBe(404);
});
