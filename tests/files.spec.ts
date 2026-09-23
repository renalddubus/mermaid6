import { expect, test, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
const code = (page: Page) =>
  page.getByRole('textbox', { name: 'Code Mermaid' });
const saved = (page: Page) =>
  expect(
    page
      .getByRole('status')
      .filter({ hasText: 'Brouillon enregistré dans ce navigateur.' }),
  ).toBeVisible();
const upload = (page: Page, name: string, source: string | Buffer) =>
  page.getByLabel('Importer un fichier Mermaid').setInputFiles({
    name,
    mimeType: 'text/plain',
    buffer: typeof source === 'string' ? Buffer.from(source) : source,
  });

async function downloaded(page: Page) {
  const wait = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Télécharger .mmd' }).click();
  const file = await wait;
  return {
    name: file.suggestedFilename(),
    source: await readFile((await file.path())!, 'utf8'),
  };
}

test('import et export conservent exactement UTF-8, commentaires, couleurs et nom', async ({
  page,
}) => {
  await page.goto('/editor');
  const source =
    '\uFEFF---\r\n# Ma couleur\r\nconfig:\r\n  theme: base\r\n  themeVariables:\r\n    primaryColor: "#aabbcc"\r\n---\r\nflowchart LR\r\n A[Départ] --> B[Arrivée]\r\n';
  await upload(page, 'mon-schéma.mmd', source);
  await expect(code(page)).toContainText('Départ');
  await expect(page.locator('.render-status')).toHaveText('Aperçu à jour');
  await saved(page);
  expect(await downloaded(page)).toEqual({ name: 'mon-schéma.mmd', source });
  await page.reload();
  await expect(code(page)).toContainText('Ma couleur');
  expect(await downloaded(page)).toEqual({ name: 'mon-schéma.mmd', source });
});

test('le dernier brouillon, même invalide, revient après rechargement de l’URL exemple', async ({
  page,
}) => {
  await page.goto('/editor?example=sequence');
  await code(page).fill('flowchart LR\n A[Mon brouillon incomplet');
  await saved(page);
  await page.reload();
  await expect(code(page)).toContainText('Mon brouillon incomplet');
  await expect(
    page.getByRole('status').filter({ hasText: 'Brouillon restauré' }),
  ).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('Erreur de syntaxe');
  await code(page).fill('flowchart LR\n A[Première version] --> B');
  await code(page).fill('flowchart LR\n A[Dernière version] --> B');
  await saved(page);
  await page.reload();
  await expect(code(page)).toContainText('Dernière version');
});

test('un nouvel exemple ne remplace pas silencieusement un brouillon', async ({
  page,
}) => {
  await page.goto('/editor');
  await code(page).fill('flowchart LR\n A[Travail précieux] --> B');
  await saved(page);
  await page.goto('/editor?example=pie');
  await expect(
    page.getByRole('heading', { name: 'Un brouillon vous attend' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Reprendre mon brouillon' }).click();
  await expect(code(page)).toContainText('Travail précieux');
  await saved(page);
  await page.reload();
  await expect(code(page)).toContainText('Travail précieux');
  await page.goto('/editor?example=gantt');
  await page.getByRole('button', { name: 'Remplacer par l’exemple' }).click();
  await expect(code(page)).toContainText('gantt');
  await saved(page);
});

test('importer un fichier invalide garde le texte pour correction et protège le travail précédent', async ({
  page,
}) => {
  await page.goto('/editor');
  await code(page).fill('flowchart LR\n A[À conserver] --> B');
  await saved(page);
  await upload(page, 'incomplet.mmd', 'flowchart LR\n X[Pas terminé');
  await expect(page.getByRole('alert')).toContainText('remplacera votre code');
  await page.getByRole('button', { name: 'Annuler', exact: true }).click();
  await expect(code(page)).toContainText('À conserver');
  await upload(page, 'incomplet.mmd', 'flowchart LR\n X[Pas terminé');
  await page.getByRole('button', { name: 'Remplacer le code' }).click();
  await expect(code(page)).toContainText('Pas terminé');
  await expect(page.locator('.render-status')).toHaveText('Erreur à corriger');
  await saved(page);
  expect((await downloaded(page)).source).toBe('flowchart LR\n X[Pas terminé');
});

test('fichiers vides, binaires et surdimensionnés ne remplacent rien', async ({
  page,
}) => {
  await page.goto('/editor');
  await expect(code(page)).toContainText('flowchart LR');
  for (const [name, content, message] of [
    ['vide.mmd', '', 'vide'],
    ['image.png', 'autre fichier', 'format .mmd'],
    ['binaire.mmd', Buffer.from([0xff, 0xfe, 0x00]), 'UTF-8'],
    ['long.mmd', 'a'.repeat(50001), '50 000'],
    ['grand.mmd', 'a'.repeat(200001), '200 Ko'],
  ] as const) {
    await upload(page, name, content);
    await expect(page.locator('.announcement')).toContainText(message);
    await expect(code(page)).toContainText('flowchart LR');
  }
});

test('un stockage indisponible laisse éditer et télécharger sans annoncer de sauvegarde', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'indexedDB', {
      get() {
        throw new Error('Storage disabled');
      },
    });
  });
  await page.goto('/editor');
  await code(page).fill('flowchart LR\n A[Sans stockage] --> B');
  await expect(
    page.getByRole('status').filter({ hasText: 'Stockage local indisponible' }),
  ).toBeVisible();
  expect((await downloaded(page)).source).toContain('Sans stockage');
});

test('un échec d’écriture est signalé sans perte de source', async ({
  page,
}) => {
  await page.addInitScript(() => {
    IDBObjectStore.prototype.put = () => {
      throw new DOMException('Full', 'QuotaExceededError');
    };
  });
  await page.goto('/editor');
  await code(page).fill('flowchart LR\n A[Quota atteint] --> B');
  await expect(
    page
      .getByRole('status')
      .filter({ hasText: 'Enregistrement local impossible' }),
  ).toBeVisible();
  expect((await downloaded(page)).source).toContain('Quota atteint');
});

test('une saisie pendant la lecture du fichier est protégée', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = File.prototype.arrayBuffer;
    File.prototype.arrayBuffer = async function () {
      await new Promise((resolve) => setTimeout(resolve, 700));
      return original.call(this);
    };
  });
  await page.goto('/editor');
  await upload(page, 'lent.mmd', 'flowchart LR\n X[Fichier] --> Y');
  await code(page).fill('flowchart LR\n A[Saisie pendant la lecture] --> B');
  await expect(page.getByRole('alert')).toContainText('remplacera votre code');
  await page.getByRole('button', { name: 'Annuler', exact: true }).click();
  await expect(code(page)).toContainText('Saisie pendant la lecture');
});

test('mobile : import et restauration du brouillon', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/editor');
  await upload(page, 'mobile.mmd', 'flowchart TB\n A[Sur mobile] --> B');
  await saved(page);
  await page.reload();
  await expect(code(page)).toContainText('Sur mobile');
  await expect(
    page.getByRole('button', { name: 'Importer .mmd' }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
