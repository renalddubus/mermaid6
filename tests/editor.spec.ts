import { changeAppearance, colorFields } from '../src/editor/appearance';
import { expect, test, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const code = (page: Page) =>
  page.getByRole('textbox', { name: 'Code Mermaid' });
const ready = (page: Page) =>
  expect(
    page.getByRole('status').filter({ hasText: 'Aperçu à jour' }),
  ).toBeVisible();

async function edit(page: Page, source: string) {
  await code(page).fill(source);
  await ready(page);
}

test('l’accueil transmet son exemple à l’éditeur', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Modifier cet exemple' }).click();
  await expect(page).toHaveURL(/\/editor\?example=flow&ink=0/);
  await ready(page);
  await expect(code(page)).toContainText('flowchart LR');
  await expect(
    page.getByRole('img', { name: 'Diagramme Mermaid' }),
  ).toBeVisible();
  await expect(page.locator('.svg-content')).toContainText('Une idée');
});

test('édition, erreur, reprise, zoom et téléchargement de la source', async ({
  page,
}) => {
  await page.goto('/editor');
  await ready(page);
  await edit(page, 'flowchart LR\n A[Départ] --> B[Arrivée]');
  await expect(page.locator('.svg-content')).toContainText('Arrivée');
  const validSVG = await page.locator('.svg-content').innerHTML();
  await code(page).fill('flowchart LR\n A[Non terminé');
  await expect(page.getByRole('alert')).toContainText('Erreur de syntaxe');
  await expect(page.locator('.render-status')).toHaveText('Erreur à corriger');
  expect(await page.locator('.svg-content').innerHTML()).toBe(validSVG);
  await expect(code(page)).toContainText('Non terminé');
  const source = 'flowchart LR\n A[Corrigé] --> B[Prêt]';
  await edit(page, source);
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.locator('.svg-content')).toContainText('Corrigé');
  await page.getByRole('button', { name: 'Agrandir', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Réinitialiser le zoom' }),
  ).toHaveText('120%');
  await page.getByRole('button', { name: 'Réinitialiser le zoom' }).click();
  await expect(
    page.getByRole('button', { name: 'Réinitialiser le zoom' }),
  ).toHaveText('100%');
  await code(page).focus();
  await page.keyboard.press('Tab');
  await expect(code(page)).not.toBeFocused();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Télécharger .mmd' }).click();
  const download = await downloadPromise;
  expect(await readFile((await download.path())!, 'utf8')).toBe(source);
});

test('thèmes et couleurs conservent les commentaires et les styles du code', async ({
  page,
}) => {
  await page.goto('/editor');
  await ready(page);
  await edit(
    page,
    '---\ntitle: Mon schéma\n# À conserver\nconfig:\n  flowchart:\n    curve: linear\n---\nflowchart LR\n A[Bonjour] --> B[Suite]\n classDef custom stroke-width:3px\n class B custom',
  );
  await edit(
    page,
    changeAppearance(
      await code(page).innerText(),
      'theme',
      'dark',
      colorFields.nodes,
    ),
  );
  await ready(page);
  await expect(page.locator('.live-preview-panel')).toHaveClass(/theme-dark/);
  await edit(
    page,
    changeAppearance(
      await code(page).innerText(),
      'theme',
      'base',
      colorFields.nodes,
    ),
  );
  await ready(page);
  await edit(
    page,
    changeAppearance(
      await code(page).innerText(),
      colorFields.nodes[0].key,
      '#aabbcc',
      colorFields.nodes,
    ),
  );
  await ready(page);
  await expect(code(page)).toContainText('À conserver');
  await expect(code(page)).toContainText('curve: linear');
  await expect(code(page)).toContainText('classDef custom stroke-width:3px');
  await expect(code(page)).toContainText('#aabbcc');
  const rect = page.locator('.svg-content .node rect').first();
  await expect(rect).toHaveCSS('fill', 'rgb(170, 187, 204)');
  await page.getByRole('button', { name: 'Parcourir les exemples' }).click();
  await page
    .getByRole('searchbox', { name: 'Rechercher dans le catalogue' })
    .fill('sequence');
  await page.getByRole('button', { name: 'Utiliser cet exemple' }).click();
  await expect(page.getByRole('alert')).toContainText('remplacera votre code');
  await page.getByRole('button', { name: 'Annuler', exact: true }).click();
  await expect(code(page)).toContainText('À conserver');
});

for (const example of ['sequence', 'state']) {
  test(`le modèle ${example} est rendu par Mermaid`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`/editor?example=${example}`);
    await ready(page);
    await expect(
      page.getByRole('img', { name: 'Diagramme Mermaid' }),
    ).toBeVisible();
    expect(await page.locator('.svg-content text').count()).toBeGreaterThan(3);
    expect(errors).toEqual([]);
  });
}

test('mobile : code, aperçu et zoom restent accessibles sans débordement', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/editor');
  await expect(code(page)).toBeVisible();
  await code(page).fill('flowchart TB\n A[Sur mobile] --> B[Ça fonctionne]');
  await page.getByRole('button', { name: 'Aperçu', exact: true }).click();
  await ready(page);
  await expect(page.locator('.svg-content')).toContainText('Sur mobile');
  await expect(code(page)).toBeHidden();
  await page.getByRole('button', { name: 'Agrandir', exact: true }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole('button', { name: 'Code', exact: true }).click();
  await expect(code(page)).toContainText('Ça fonctionne');
});

test('les sources trop longues sont refusées sans perdre le code ni le dernier aperçu', async ({
  page,
}) => {
  await page.goto('/editor');
  await ready(page);
  await code(page).fill('flowchart LR\n%% ' + 'x'.repeat(50_000));
  await expect(page.getByRole('alert')).toBeVisible();
  await page.getByText('Détails de l’erreur', { exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('50 000 caractères');
  await expect(page.locator('.render-status')).toHaveText('Erreur à corriger');
  await edit(page, 'flowchart LR\n A --> B');
});

test('le code ne peut pas activer du HTML ni exécuter un lien ou un script', async ({
  page,
}) => {
  const externalRequests: string[] = [];
  await page.route('https://attacker.invalid/**', async (route) => {
    externalRequests.push(route.request().url());
    await route.abort();
  });
  await page.goto('/editor');
  await ready(page);
  await edit(
    page,
    `---
config:
  securityLevel: loose
  htmlLabels: true
  themeCSS: '@import url("https://attacker.invalid/style.css");'
  flowchart:
    htmlLabels: true
---
flowchart LR
 A["<img src='https://attacker.invalid/leak' onerror='window.mermaidUnsafe=true'>"] --> B[Suite]
 click B "javascript:window.mermaidUnsafe=true"`,
  );
  await expect(
    page.locator(
      '.svg-content script, .svg-content foreignObject, .svg-content img, .svg-content a',
    ),
  ).toHaveCount(0);
  expect(
    await page.evaluate(() => Reflect.get(window, 'mermaidUnsafe')),
  ).toBeUndefined();
  expect(externalRequests).toEqual([]);
  await expect(page.locator('.mermaid-render-stage')).toHaveCount(0);
});

test('un rendu lent dépassé ne remplace pas la dernière saisie', async ({
  page,
}) => {
  await page.route('**/assets/sequenceDiagram-*.js', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    await route.continue();
  });
  await page.goto('/editor');
  await ready(page);
  const loading = page.waitForRequest(/\/assets\/sequenceDiagram-[^/]+\.js/);
  await code(page).fill('sequenceDiagram\n Alice->>Bob: Ancienne saisie');
  await loading;
  await code(page).fill('flowchart LR\n A[Dernière saisie] --> B[Conservée]');
  await ready(page);
  await expect(page.locator('.svg-content')).toContainText('Dernière saisie');
  await expect(page.locator('.svg-content')).not.toContainText(
    'Ancienne saisie',
  );
});

test('les notifications disparaissent et une nouvelle action relance leur délai', async ({
  page,
}) => {
  await page.goto('/editor');
  await ready(page);
  await page.clock.install();
  const trigger = page.getByRole('button', {
    name: 'Télécharger .mmd',
    exact: true,
  });
  await trigger.click();
  await expect(page.locator('.announcement')).toContainText(
    'Source téléchargée.',
  );
  await page.clock.fastForward(3000);
  await trigger.click();
  await page.clock.fastForward(3000);
  await expect(page.locator('.announcement')).toBeVisible();
  await page.clock.fastForward(1000);
  await expect(page.locator('.announcement')).toHaveCount(0);
});
