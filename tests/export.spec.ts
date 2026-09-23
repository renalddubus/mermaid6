import { expect, test, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { catalogue } from '../src/catalogue';

async function download(page: Page, format: 'SVG' | 'PNG') {
  const wait = page.waitForEvent('download');
  await page
    .getByRole('button', { name: `Télécharger ${format}`, exact: true })
    .click();
  const file = await wait;
  return {
    name: file.suggestedFilename(),
    buffer: await readFile((await file.path())!),
  };
}
async function openExport(page: Page) {
  await expect(page.locator('.render-status')).toHaveText('Aperçu à jour');
  await page.getByRole('button', { name: 'Exporter l’image' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
}

for (const item of catalogue) {
  test(`export SVG et PNG fidèle : ${item.id}`, async ({ page }) => {
    await page.goto(`/editor?example=${item.id}`);
    await expect(page.locator('.render-status')).toHaveText('Aperçu à jour');
    const expectedLabels = await page
      .locator('.live-preview-panel svg text')
      .allTextContents();
    await openExport(page);
    await page.getByLabel('Fond', { exact: true }).selectOption('transparent');
    await page.getByLabel('Résolution', { exact: true }).selectOption('1');
    const png = await download(page, 'PNG');
    expect(png.name).toBe('mon-diagramme.png');
    expect([...png.buffer.subarray(0, 8)]).toEqual([
      137, 80, 78, 71, 13, 10, 26, 10,
    ]);
    await page.getByLabel('Format', { exact: true }).selectOption('svg');
    const svg = await download(page, 'SVG');
    expect(svg.name).toBe('mon-diagramme.svg');
    const report = await page.evaluate(
      async ({ svg, png }) => {
        // Decode as UTF-8 so labels with accents are compared correctly.
        const utf8 = new TextDecoder().decode(
          Uint8Array.from(atob(svg), (c) => c.charCodeAt(0)),
        );
        const parsed = new DOMParser().parseFromString(utf8, 'image/svg+xml');
        async function raster(url: string) {
          const image = new Image();
          image.src = url;
          await image.decode();
          const canvas = document.createElement('canvas');
          canvas.width = image.naturalWidth;
          canvas.height = image.naturalHeight;
          const context = canvas.getContext('2d')!;
          context.drawImage(image, 0, 0);
          return {
            width: canvas.width,
            height: canvas.height,
            pixels: context.getImageData(0, 0, canvas.width, canvas.height)
              .data,
          };
        }
        const vector = await raster(`data:image/svg+xml;base64,${svg}`);
        const bitmap = await raster(`data:image/png;base64,${png}`);
        let differences = 0;
        let visible = 0;
        let transparent = 0;
        for (let index = 0; index < bitmap.pixels.length; index++) {
          if (bitmap.pixels[index] !== vector.pixels[index]) differences++;
          if (index % 4 === 3) {
            if (bitmap.pixels[index] > 0) visible++;
            else transparent++;
          }
        }
        return {
          labels: [...parsed.querySelectorAll('text')].map(
            (element) => element.textContent,
          ),
          malformed: !!parsed.querySelector('parsererror'),
          unsafe: parsed.querySelectorAll('script, foreignObject, image, a')
            .length,
          sameSize:
            bitmap.width === vector.width && bitmap.height === vector.height,
          differences,
          visible,
          transparent,
        };
      },
      {
        svg: svg.buffer.toString('base64'),
        png: png.buffer.toString('base64'),
      },
    );
    expect(report.labels).toEqual(expectedLabels);
    expect(report.malformed).toBe(false);
    expect(report.unsafe).toBe(0);
    expect(report.sameSize).toBe(true);
    expect(report.differences).toBe(0);
    expect(report.visible).toBeGreaterThan(100);
    // Native graph backgrounds can be opaque; transparency is checked separately.
  });
}

test('résolution, fonds, nom importé et zoom indépendant', async ({ page }) => {
  await page.goto('/editor');
  await page.getByLabel('Importer un fichier Mermaid').setInputFiles({
    name: 'Mes-idées.mmd',
    mimeType: 'text/plain',
    buffer: Buffer.from('flowchart LR\n A[Départ] --> B[Arrivée]'),
  });
  await expect(page.locator('.render-status')).toHaveText('Aperçu à jour');
  await page.getByRole('button', { name: 'Agrandir', exact: true }).click();
  const viewBox = await page
    .getByRole('img', { name: 'Diagramme Mermaid', exact: true })
    .getAttribute('viewBox');
  const [, , width, height] = viewBox!.split(/[\s,]+/).map(Number);
  await openExport(page);
  for (const scale of [1, 2, 3]) {
    await page
      .getByLabel('Résolution', { exact: true })
      .selectOption(String(scale));
    const file = await download(page, 'PNG');
    expect(file.name).toBe('Mes-idées.png');
    expect(file.buffer.readUInt32BE(16)).toBe(Math.ceil(width * scale));
    expect(file.buffer.readUInt32BE(20)).toBe(Math.ceil(height * scale));
  }
  await page.getByLabel('Résolution', { exact: true }).selectOption('1');
  for (const [background, expected] of [
    ['transparent', [0, 0, 0, 0]],
    ['white', [255, 255, 255, 255]],
    ['dark', [37, 40, 50, 255]],
    ['custom', [18, 52, 86, 255]],
  ] as const) {
    await page.getByLabel('Fond', { exact: true }).selectOption(background);
    if (background === 'custom')
      await page.getByLabel('Couleur du fond').fill('#123456');
    const file = await download(page, 'PNG');
    const corner = await page.evaluate(async (data) => {
      const image = new Image();
      image.src = `data:image/png;base64,${data}`;
      await image.decode();
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      context.drawImage(image, 0, 0);
      return [...context.getImageData(0, 0, 1, 1).data];
    }, file.buffer.toString('base64'));
    expect(corner).toEqual(expected);
  }
  await page.getByLabel('Format', { exact: true }).selectOption('svg');
  const vector = await download(page, 'SVG');
  expect(vector.buffer.toString()).toContain('fill: #123456');
});

test('une erreur ou un aperçu en attente bloque l’export', async ({ page }) => {
  await page.goto('/editor');
  await expect(page.locator('.render-status')).toHaveText('Aperçu à jour');
  await page
    .getByRole('textbox', { name: 'Code Mermaid' })
    .fill('flowchart LR\n A[Incomplet');
  await expect(
    page.getByRole('button', { name: 'Exporter l’image' }),
  ).toBeDisabled();
  await expect(page.locator('.render-status')).toHaveText('Erreur à corriger');
  await expect(
    page.getByRole('button', { name: 'Exporter l’image' }),
  ).toBeDisabled();
  await page
    .getByRole('textbox', { name: 'Code Mermaid' })
    .fill('flowchart LR\n A --> B');
  await expect(
    page.getByRole('button', { name: 'Exporter l’image' }),
  ).toBeEnabled();
});

test('l’export est utilisable sur mobile et se ferme au clavier', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/editor?example=pie');
  await page.getByRole('button', { name: 'Aperçu', exact: true }).click();
  await openExport(page);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await download(page, 'PNG');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Exporter l’image' }),
  ).toBeFocused();
});

test('un PNG trop grand propose le SVG sans limiter le diagramme', async ({
  page,
}) => {
  await page.goto('/editor');
  await page
    .getByRole('textbox', { name: 'Code Mermaid' })
    .fill(
      'flowchart TB\n' +
        Array.from({ length: 99 }, (_, i) => `N${i} --> N${i + 1}`).join('\n'),
    );
  await openExport(page);
  await page.getByLabel('Résolution', { exact: true }).selectOption('3');
  await expect(page.getByRole('alert')).toContainText('Image trop grande');
  await expect(
    page.getByRole('button', { name: 'Télécharger PNG' }),
  ).toBeDisabled();
  await page.getByLabel('Format', { exact: true }).selectOption('svg');
  const svg = await download(page, 'SVG');
  expect(svg.buffer.toString()).toContain('N99');
});

test('un échec de conversion laisse le SVG disponible', async ({ page }) => {
  await page.goto('/editor');
  await openExport(page);
  await page.evaluate(() => {
    HTMLCanvasElement.prototype.toBlob = (callback) => callback(null);
  });
  await page.getByRole('button', { name: 'Télécharger PNG' }).click();
  await expect(page.getByRole('alert')).toContainText(
    'La conversion PNG a échoué',
  );
  await page.getByLabel('Format', { exact: true }).selectOption('svg');
  const svg = await download(page, 'SVG');
  expect(svg.buffer.toString()).toContain('<svg');
});

test('la fermeture annule un téléchargement encore en préparation', async ({
  page,
}) => {
  await page.goto('/editor');
  await openExport(page);
  await page.evaluate(() => {
    HTMLCanvasElement.prototype.toBlob = (callback) => {
      (window as Window & { finishExport?: BlobCallback }).finishExport =
        callback;
    };
  });
  const downloads: string[] = [];
  page.on('download', (file) => downloads.push(file.suggestedFilename()));
  await page.getByRole('button', { name: 'Télécharger PNG' }).click();
  await expect(
    page.getByRole('button', { name: 'Préparation de l’image…' }),
  ).toBeDisabled();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          !!(window as Window & { finishExport?: BlobCallback }).finishExport,
      ),
    )
    .toBe(true);
  await page.getByRole('button', { name: 'Fermer l’export' }).click();
  await page.evaluate(() =>
    (window as Window & { finishExport?: BlobCallback }).finishExport!(
      new Blob(['finished'], { type: 'image/png' }),
    ),
  );
  await openExport(page);
  await page.getByLabel('Format', { exact: true }).selectOption('svg');
  await download(page, 'SVG');
  expect(downloads).toEqual(['mon-diagramme.svg']);
});
