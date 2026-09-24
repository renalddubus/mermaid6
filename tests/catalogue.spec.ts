import { expect, test } from '@playwright/test';
import { catalogue } from '../src/catalogue';
import { changeAppearance, colorFields } from '../src/editor/appearance';

for (const example of catalogue) {
  test(`rendu du catalogue : ${example.id}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`/editor?example=${example.id}`);
    await expect(page.locator('.render-status')).toHaveText('Aperçu à jour', {
      timeout: 15000,
    });
    const svg = page.locator('.svg-content > svg');
    await expect(svg).toBeVisible();
    expect(await svg.locator('text').count()).toBeGreaterThan(0);
    const labels: Record<string, string[]> = {
      event: ['Editor', 'CreateDiagram', 'DiagramCreated'],
      journey: ['Discovery', 'Creation', 'Return'],
      swimlane: ['Author', 'Reader'],
    };
    for (const label of labels[example.id] ?? []) {
      const text = svg.locator('tspan').filter({ hasText: label });
      await expect(text).toBeVisible();
      expect(
        await text.evaluate((element) => {
          const style = getComputedStyle(element);
          return style.fill !== 'none' && style.visibility !== 'hidden';
        }),
      ).toBe(true);
    }
    await expect(svg.locator('foreignObject')).toHaveCount(0);

    const box = await svg.evaluate((element: SVGSVGElement) => ({
      width: element.viewBox.baseVal.width,
      height: element.viewBox.baseVal.height,
    }));
    expect(box.width).toBeGreaterThan(0);
    expect(box.height).toBeGreaterThan(0);
    const code = page.getByRole('textbox', { name: 'Code Mermaid' });
    await code.fill(
      changeAppearance(
        await code.innerText(),
        'theme',
        'dark',
        colorFields[example.colors],
      ),
    );
    await expect(page.locator('.render-status')).toHaveText('Aperçu à jour');
    await expect(svg).toBeVisible();
    if (example.id === 'journey')
      await expect(
        svg.locator('tspan').filter({ hasText: 'Discovery' }),
      ).toHaveCSS('fill', 'rgb(41, 41, 35)');
    expect(errors).toEqual([]);
  });
}

test('recherche, catégories, absence de résultat et ouverture d’un exemple', async ({
  page,
}) => {
  await page.goto('/examples');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'son diagramme',
  );
  await page
    .getByRole('searchbox', { name: 'Rechercher dans le catalogue' })
    .fill('entites');
  await expect(page.locator('.catalogue-item')).toHaveCount(1);
  await expect(page.locator('.catalogue-preview svg')).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Utiliser cet exemple' }),
  ).toHaveAttribute('href', '/editor?example=er');
  await page.getByRole('button', { name: 'Données', exact: true }).click();
  await expect(
    page.getByText('Aucun exemple ne correspond à votre recherche.'),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Afficher tous les exemples' })
    .click();
  await expect(page.locator('.catalogue-item')).toHaveCount(catalogue.length);
  await page
    .getByRole('searchbox', { name: 'Rechercher dans le catalogue' })
    .fill('pie');
  await page.getByRole('link', { name: 'Utiliser cet exemple' }).click();
  await expect(page).toHaveURL(/example=pie/);
  await expect(page.locator('.render-status')).toHaveText('Aperçu à jour');
});

test('le catalogue préserve les modifications et rend le focus à l’éditeur', async ({
  page,
}) => {
  await page.goto('/editor');
  const code = page.getByRole('textbox', { name: 'Code Mermaid' });
  await code.fill('flowchart LR\n A[À garder] --> B');
  const open = page.getByRole('button', { name: 'Parcourir les exemples' });
  await open.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(open).toBeFocused();
  await open.click();
  await page
    .getByRole('searchbox', { name: 'Rechercher dans le catalogue' })
    .fill('gantt');
  await page.getByRole('button', { name: 'Utiliser cet exemple' }).click();
  await expect(page.getByRole('alert')).toContainText('Gantt');
  await page.getByRole('button', { name: 'Annuler', exact: true }).click();
  await expect(code).toContainText('À garder');
  await open.click();
  await page
    .getByRole('searchbox', { name: 'Rechercher dans le catalogue' })
    .fill('gantt');
  await page.getByRole('button', { name: 'Utiliser cet exemple' }).click();
  await page.getByRole('button', { name: 'Remplacer le code' }).click();
  await expect(code).toContainText('gantt');
  await expect(page.locator('.render-status')).toHaveText('Aperçu à jour');
});

test('le catalogue reste utilisable sur mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/examples');
  await page
    .getByRole('searchbox', { name: 'Rechercher dans le catalogue' })
    .fill('radar');
  await expect(page.locator('.catalogue-preview svg')).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole('link', { name: 'Utiliser cet exemple' }).click();
  await page.getByRole('button', { name: 'Parcourir les exemples' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Fermer le catalogue' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

for (const example of catalogue.filter((item) => item.colors !== 'code')) {
  test(`couleurs visibles : ${example.id}`, async ({ page }) => {
    await page.goto(`/editor?example=${example.id}`);
    await expect(page.locator('.render-status')).toHaveText('Aperçu à jour');
    const fields = colorFields[example.colors];
    const code = page.getByRole('textbox', { name: 'Code Mermaid' });
    for (let index = 0; index < fields.length; index++) {
      const color = ['#aabbcc', '#cc8844', '#775599'][index];
      await code.fill(
        changeAppearance(
          await code.innerText(),
          fields[index].key,
          color,
          fields,
        ),
      );
      await expect(page.locator('.render-status')).toHaveText('Aperçu à jour');
      const rgb = `rgb(${[1, 3, 5].map((start) => parseInt(color.slice(start, start + 2), 16)).join(', ')})`;
      expect(
        await page.locator('.svg-content svg').evaluate(
          (svg, target) =>
            [
              ...svg.querySelectorAll(
                'rect, path, polygon, circle, text, tspan, line, ellipse',
              ),
            ].some((element) => {
              const box = (element as SVGGraphicsElement).getBBox();
              const style = getComputedStyle(element);
              return (
                (box.width > 0 || box.height > 0) &&
                (style.fill === target || style.stroke === target)
              );
            }),
          rgb,
        ),
        `${example.id} : ${fields[index].label} doit modifier un élément visible`,
      ).toBe(true);
    }
  });
}
