import { expect, test, type Page } from '@playwright/test';
import { copy, translateText, type Locale } from '../src/i18n/copy';
import { catalogue, categories } from '../src/catalogue';
import { inks, models } from '../src/models';
import { colorFields, themes } from '../src/editor/appearance';

test('every catalogue and dynamic label has complete translations and matching placeholders', () => {
  const labels = [
    ...categories,
    ...catalogue.flatMap((item) => [item.label, item.description, item.note]),
    ...models.flatMap((item) => [item.label, item.title, item.description]),
    ...inks.map((ink) => ink.name),
    ...themes.map((theme) => theme.label),
    ...Object.values(colorFields)
      .flat()
      .map((field) => field.label),
  ];
  for (const label of labels)
    expect(Object.hasOwn(copy, label), label).toBe(true);
  const placeholders = (value: string) =>
    [...value.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
  for (const [english, translations] of Object.entries(copy)) {
    expect(translations, english).toHaveLength(3);
    for (const translated of translations) {
      expect(translated.trim(), english).not.toBe('');
      expect(placeholders(translated), english).toEqual(placeholders(english));
    }
  }
  expect(translateText('de', 'Unknown engine diagnostic')).toBe(
    'Unknown engine diagnostic',
  );
  expect(
    translateText('es', 'No examples for “{query}”.', {
      query: '<b>{query}</b>',
    }),
  ).toBe('No hay ejemplos para «<b>{query}</b>».');
});

const localeUi = {
  en: {
    settings: 'Settings',
    search: 'Search examples',
    full: 'Explore the full catalogue',
    flow: 'Flow',
    category: 'Software',
    use: 'Use this example',
    browser: 'Browse examples',
    code: 'Mermaid code',
    ready: 'Preview up to date',
    export: 'Export image',
    dialog: 'Export an image',
    background: 'Background',
    close: 'Close export',
    format: 'Format',
    saved: 'Draft saved in this browser.',
    home: 'Your ideas.',
    catalogueSearch: 'Search the catalogue',
    noMatches: 'No examples match your search.',
    syntax: 'Syntax error on line',
    import: 'Import a Mermaid file',
    fileError: 'Choose a Mermaid file in .mmd format.',
    find: 'Find',
  },
  fr: {
    settings: 'Réglages',
    search: 'Rechercher un exemple',
    full: 'Explorer le catalogue complet',
    flow: 'Flux',
    category: 'Logiciel',
    use: 'Utiliser cet exemple',
    browser: 'Parcourir les exemples',
    code: 'Code Mermaid',
    ready: 'Aperçu à jour',
    export: 'Exporter l’image',
    dialog: 'Exporter une image',
    background: 'Fond',
    close: 'Fermer l’export',
    format: 'Format',
    saved: 'Brouillon enregistré dans ce navigateur.',
    home: 'Vos idées.',
    catalogueSearch: 'Rechercher dans le catalogue',
    noMatches: 'Aucun exemple ne correspond à votre recherche.',
    syntax: 'Erreur de syntaxe à la ligne',
    import: 'Importer un fichier Mermaid',
    fileError: 'Choisissez un fichier Mermaid au format .mmd.',
    find: 'Rechercher',
  },
  es: {
    settings: 'Ajustes',
    search: 'Buscar un ejemplo',
    full: 'Explorar el catálogo completo',
    flow: 'Flujo',
    category: 'Software',
    use: 'Usar este ejemplo',
    browser: 'Explorar ejemplos',
    code: 'Código Mermaid',
    ready: 'Vista previa actualizada',
    export: 'Exportar imagen',
    dialog: 'Exportar una imagen',
    background: 'Fondo',
    close: 'Cerrar exportación',
    format: 'Formato',
    saved: 'Borrador guardado en este navegador.',
    home: 'Tus ideas.',
    catalogueSearch: 'Buscar en el catálogo',
    noMatches: 'Ningún ejemplo coincide con tu búsqueda.',
    syntax: 'Error de sintaxis en la línea',
    import: 'Importar un archivo Mermaid',
    fileError: 'Elige un archivo Mermaid en formato .mmd.',
    find: 'Buscar',
  },
  de: {
    settings: 'Einstellungen',
    search: 'Beispiel suchen',
    full: 'Vollständigen Katalog öffnen',
    flow: 'Ablauf',
    category: 'Software',
    use: 'Dieses Beispiel verwenden',
    browser: 'Beispiele durchsuchen',
    code: 'Mermaid-Code',
    ready: 'Vorschau aktuell',
    export: 'Bild exportieren',
    dialog: 'Ein Bild exportieren',
    background: 'Hintergrund',
    close: 'Export schließen',
    format: 'Format',
    saved: 'Entwurf in diesem Browser gespeichert.',
    home: 'Deine Ideen.',
    catalogueSearch: 'Im Katalog suchen',
    noMatches: 'Keine Beispiele entsprechen deiner Suche.',
    syntax: 'Syntaxfehler in Zeile',
    import: 'Mermaid-Datei importieren',
    fileError: 'Wähle eine Mermaid-Datei im .mmd-Format.',
    find: 'Suchen',
  },
} as const;

for (const locale of ['en', 'fr', 'es', 'de'] as const) {
  test.describe(locale, () => {
    test.use({ locale });
    const ui = localeUi[locale];

    test('home, catalogue, search, and editor dialogs use the selected language', async ({
      page,
    }) => {
      await page.goto('/');
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(page.locator('.about h2')).toContainText(ui.home);
      await expect(
        page.getByRole('searchbox', { name: ui.search }),
      ).toBeVisible();
      await page.getByRole('link', { name: ui.full }).click();
      await expect(page.locator('.catalogue-item')).toHaveCount(35);
      await expect(page.locator('.catalogue-detail h2')).toHaveText(ui.flow);
      const search = page.getByRole('searchbox', { name: ui.catalogueSearch });
      await search.fill('no-example-match');
      await expect(page.getByText(ui.noMatches)).toBeVisible();
      await search.fill('');
      await page
        .getByRole('button', { name: ui.category, exact: true })
        .click();
      await expect(page.locator('.catalogue-item small').first()).toContainText(
        ui.category,
      );
      await page.getByRole('link', { name: ui.use }).click();
      await expect(page.locator('.render-status')).toHaveText(ui.ready);
      await expect(page.getByRole('textbox', { name: ui.code })).toBeVisible();
      await expect(page.locator('.editor-bottom')).toContainText(ui.saved);
      await page.getByRole('button', { name: ui.export, exact: true }).click();
      const dialog = page.getByRole('dialog', { name: ui.dialog });
      await expect(dialog).toBeVisible();
      await expect(
        dialog.getByRole('combobox', { name: ui.background, exact: true }),
      ).toBeVisible();
      await expect(
        dialog.getByRole('combobox', { name: ui.format, exact: true }),
      ).toBeVisible();
      await page.getByRole('button', { name: ui.close }).click();
      await page.getByRole('button', { name: ui.browser }).click();
      await expect(
        page
          .getByRole('dialog')
          .getByRole('searchbox', { name: ui.catalogueSearch }),
      ).toBeVisible();
      if (locale !== 'fr') {
        const visibleText = await page.locator('body').innerText();
        expect(visibleText).not.toMatch(
          /Parcourir les exemples|Préparation de|Choisir un|Personnalisation\.|Décrire les|Votre texte/,
        );
      }
    });

    test('render errors, import errors, and editor search controls are translated', async ({
      page,
    }) => {
      await page.goto('/editor');
      await expect(page.locator('.render-status')).toHaveText(ui.ready);
      const code = page.getByRole('textbox', { name: ui.code });
      await code.fill('flowchart LR\n A[Unfinished');
      await expect(page.locator('.render-error strong')).toContainText(
        ui.syntax,
      );
      await page.getByLabel(ui.import, { exact: true }).setInputFiles({
        name: 'wrong.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('flowchart LR\n A'),
      });
      await expect(page.locator('.announcement')).toHaveText(
        new RegExp(ui.fileError.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
      );
      await code.focus();
      await page.keyboard.press('ControlOrMeta+f');
      await expect(
        page
          .locator('.cm-search')
          .getByRole('textbox', { name: ui.find, exact: true }),
      ).toBeVisible();
    });
  });
}

async function changeLocaleFromAnotherTab(
  page: Page,
  language: Locale,
  theme: 'light' | 'dark' = 'light',
) {
  await page.evaluate(
    ({ language: nextLanguage, theme }) => {
      const value = JSON.stringify({
        version: 1,
        language: nextLanguage,
        theme,
      });
      localStorage.setItem('mermaid6.preferences', value);
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'mermaid6.preferences',
          newValue: value,
        }),
      );
    },
    { language, theme },
  );
}

test('switching language updates existing errors, notices, dialogs and search without losing source or undo', async ({
  page,
}) => {
  await page.goto('/editor');
  await expect(page.locator('.render-status')).toHaveText(localeUi.fr.ready);
  const content = page.locator('.cm-content');
  const original = 'flowchart LR\n A[Bonjour à tous] --> B[Une idée]';
  await content.fill(original);
  await expect(page.locator('.render-status')).toHaveText(localeUi.fr.ready);
  await content.fill('flowchart LR\n A[Incomplete');
  await expect(page.locator('.render-error strong')).toContainText(
    localeUi.fr.syntax,
  );
  await changeLocaleFromAnotherTab(page, 'de');
  await expect(page.locator('.render-error strong')).toContainText(
    localeUi.de.syntax,
  );
  await expect(content).toHaveText('flowchart LR\n A[Incomplete');
  await content.focus();
  await page.keyboard.press('ControlOrMeta+z');
  await expect(content).toHaveText(original);
  await expect(page.locator('.render-status')).toHaveText(localeUi.de.ready);
  await expect(page.locator('.svg-content')).toContainText('Bonjour à tous');

  await content.focus();
  await page.keyboard.press('ControlOrMeta+f');
  await page.locator('.cm-search input[name="search"]').fill('Bonjour');
  await changeLocaleFromAnotherTab(page, 'es');
  await expect(
    page
      .locator('.cm-search')
      .getByRole('textbox', { name: 'Buscar', exact: true }),
  ).toHaveValue('Bonjour');
  await page.keyboard.press('Escape');
  await page
    .getByRole('button', { name: localeUi.es.export, exact: true })
    .click();
  await page
    .getByRole('combobox', { name: localeUi.es.background, exact: true })
    .selectOption('transparent');
  await changeLocaleFromAnotherTab(page, 'en');
  await expect(
    page.getByRole('dialog', { name: localeUi.en.dialog }),
  ).toBeVisible();
  await expect(
    page.getByRole('combobox', { name: 'Background', exact: true }),
  ).toHaveValue('transparent');
  await page.getByRole('button', { name: 'Close export' }).click();
  await expect(content).toHaveText(original);
  await expect(page.locator('.svg-content svg')).toHaveAttribute(
    'aria-label',
    'Mermaid diagram',
  );
  await expect(page.locator('.svg-content')).toContainText('Bonjour à tous');
  await page
    .getByLabel('Import a Mermaid file', { exact: true })
    .setInputFiles({
      name: 'wrong.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('flowchart LR\n A'),
    });
  await expect(page.locator('.announcement')).toContainText(
    localeUi.en.fileError,
  );
  await changeLocaleFromAnotherTab(page, 'de');
  await expect(page.locator('.announcement')).toContainText(
    localeUi.de.fileError,
  );
});

test('German draft recovery preserves a French filename and imported content', async ({
  page,
}) => {
  await page.goto('/editor');
  await expect(page.locator('.render-status')).toHaveText(localeUi.fr.ready);
  const source = 'flowchart LR\n A[Texte français conservé]';
  await page.getByLabel(localeUi.fr.import, { exact: true }).setInputFiles({
    name: 'été.mmd',
    mimeType: 'text/plain',
    buffer: Buffer.from(source),
  });
  await expect(page.locator('.editor-bottom')).toContainText('été.mmd');
  await expect(page.locator('.editor-bottom')).toContainText(localeUi.fr.saved);
  await changeLocaleFromAnotherTab(page, 'de');
  await page.goto('/editor?example=sequence');
  await expect(
    page.getByRole('heading', { name: 'Ein Entwurf wartet auf dich' }),
  ).toBeVisible();
  await expect(page.locator('.draft-start')).toContainText('été.mmd');
  await page.getByRole('button', { name: 'Meinen Entwurf fortsetzen' }).click();
  await expect(page.getByRole('textbox', { name: 'Mermaid-Code' })).toHaveText(
    source,
  );
  await expect(page.locator('.draft-filename')).toContainText('été.mmd');
});

test('all locales fit mobile pages and dark dialogs', async ({
  page,
}, testInfo) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  for (const locale of ['en', 'fr', 'es', 'de'] as const) {
    await changeLocaleFromAnotherTab(page, locale, 'dark');
    for (const route of ['/', '/examples', '/editor']) {
      await page.goto(route);
      if (route === '/editor') {
        await expect(page.locator('.render-status')).toHaveText(
          localeUi[locale].ready,
        );
        await page
          .getByRole('button', {
            name: translateText(locale, 'Preview'),
            exact: true,
          })
          .click();
        await page
          .getByRole('button', { name: localeUi[locale].export, exact: true })
          .click();
        await expect(
          page.getByRole('dialog', { name: localeUi[locale].dialog }),
        ).toBeVisible();
      } else if (route === '/examples') {
        await expect(
          page.getByRole('searchbox', {
            name: localeUi[locale].catalogueSearch,
          }),
        ).toBeVisible();
      } else {
        await expect(
          page.getByRole('link', { name: localeUi[locale].full }),
        ).toBeVisible();
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        `${locale} ${route}`,
      ).toBe(true);
      if (locale === 'de') {
        await page.screenshot({
          path: testInfo.outputPath(
            `german-mobile-${route === '/' ? 'home' : route.slice(1)}.png`,
          ),
          fullPage: true,
        });
      }
    }
  }
});
