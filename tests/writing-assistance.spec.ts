import { CompletionContext } from '@codemirror/autocomplete';
import { EditorState } from '@codemirror/state';
import { expect, test } from '@playwright/test';
import {
  diagramIdentifiers,
  mermaidCompletions,
} from '../src/editor/completions';
import { translateText, type CopyKey } from '../src/i18n/copy';
import { describeError } from '../src/editor/render';

test('suggestions remain accessible on mobile in the dark theme and follow language changes', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.addInitScript(() =>
    localStorage.setItem(
      'mermaid6.preferences',
      JSON.stringify({ version: 1, language: 'fr', theme: 'dark' }),
    ),
  );
  await page.goto('/editor');
  const editor = page.getByRole('textbox', { name: 'Code Mermaid' });
  const source = 'flowchart LR\n  Start[Start] --> Finish[Finish]\n  su';
  await editor.fill(source);
  await page.getByRole('button', { name: 'Suggestions', exact: true }).click();
  await expect(
    page.getByRole('option').filter({ hasText: /^subgraph/ }),
  ).toContainText('Insérer un bloc Mermaid');
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(375);
  await page.screenshot({
    path: testInfo.outputPath('suggestions-mobile-dark.png'),
  });
  await page.evaluate(() => {
    const value = JSON.stringify({ version: 1, language: 'de', theme: 'dark' });
    localStorage.setItem('mermaid6.preferences', value);
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'mermaid6.preferences',
        newValue: value,
      }),
    );
  });
  await expect(
    page.getByRole('button', { name: 'Vorschläge', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Vorschläge', exact: true }).click();
  await expect(
    page.getByRole('option').filter({ hasText: /^subgraph/ }),
  ).toContainText('Mermaid-Block einfügen');
  await expect(page.getByRole('textbox', { name: 'Mermaid-Code' })).toHaveText(
    source,
  );
});

function suggestions(
  source: string,
  position = source.length,
  explicit = true,
) {
  return mermaidCompletions((key: CopyKey) => translateText('fr', key))(
    new CompletionContext(
      EditorState.create({ doc: source }),
      position,
      explicit,
    ),
  );
}

test('error lines account for configuration, removed comments and end-of-file errors', () => {
  const failure = new Error('Parse error on line 3:');
  expect(describeError(failure, 'flowchart LR\n A[Broken').line).toBe('2');
  expect(
    describeError(
      failure,
      '---\nconfig:\n  theme: base\n---\nflowchart LR\n A[Broken',
    ).line,
  ).toBe('6');
  expect(
    describeError(
      failure,
      'sequenceDiagram\n %% Comment\n participant Alice\n Broken',
    ).line,
  ).toBe('4');
  const positioned = Object.assign(new Error('Invalid shape on line 6'), {
    hash: { token: null, loc: { first_line: 6 } },
  });
  expect(
    describeError(
      positioned,
      '---\nconfig:\n  theme: base\n---\nflowchart LR\n A@{shape: bad}',
    ).line,
  ).toBe('6');
});

test('an error after Mermaid configuration navigates to the diagram body', async ({
  page,
}) => {
  await page.goto('/editor');
  const editor = page.getByRole('textbox', { name: 'Code Mermaid' });
  await editor.fill(
    '---\nconfig:\n  theme: base\n---\nflowchart LR\n  A[Start] --> B[Broken',
  );
  await page
    .getByRole('button', { name: 'Aller à la ligne 6', exact: true })
    .click();
  await expect(editor).toBeFocused();
  expect(await page.evaluate(() => window.getSelection()?.toString())).toBe(
    '  A[Start] --> B[Broken',
  );
});

test('starter blocks produce valid diagrams', async ({ page }) => {
  await page.goto('/editor');
  const editor = page.getByRole('textbox', { name: 'Code Mermaid' });
  for (const type of [
    'flowchart',
    'sequenceDiagram',
    'stateDiagram-v2',
    'classDiagram',
    'erDiagram',
    'gantt',
    'mindmap',
    'timeline',
    'pie',
  ]) {
    await editor.fill('');
    await page
      .getByRole('button', { name: 'Suggestions', exact: true })
      .click();
    await page
      .getByRole('option')
      .filter({
        has: page.locator('.cm-completionLabel', {
          hasText: new RegExp(`^${type}$`),
        }),
      })
      .click();
    await expect(editor).toContainText(type);
    await expect(page.locator('.render-status'), type).toHaveText(
      'Aperçu à jour',
    );
    await page.keyboard.press('Escape');
  }
});

test('suggestions follow diagram context, skip prose and preserve existing declarations', () => {
  expect(suggestions('')?.options.map((option) => option.label)).toContain(
    'flowchart',
  );
  expect(
    suggestions('flo', 3, false)?.options.find(
      (option) => option.label === 'flowchart',
    )?.apply,
  ).toBeInstanceOf(Function);
  const flow = suggestions('flowchart LR\n  su')!;
  expect(flow.options.map((option) => option.label)).toContain('subgraph');
  expect(flow.options.map((option) => option.label)).not.toContain(
    'participant',
  );
  expect(
    suggestions('sequenceDiagram\n  lo')?.options.map((option) => option.label),
  ).toContain('loop');
  expect(
    suggestions('flowchart ')?.options.map((option) => option.label),
  ).toEqual(['LR', 'RL', 'TB', 'TD', 'BT']);
  expect(
    suggestions('flowchart LR\n  A[Label] --> B', 4)?.options.find(
      (option) => option.label === 'flowchart',
    )?.apply,
  ).toBeUndefined();
  for (const source of [
    'flowchart LR\n  %% comment',
    'flowchart LR\n  A[Some text',
    'flowchart LR\n  A["Quoted text',
    'flowchart LR\n  A -->|Label',
    'sequenceDiagram\n  Alice->>Bob: Message',
    '---\nconfig:\n  theme: ba',
    '---\nconfig:\n\n---\nflowchart LR',
  ]) {
    const position = source.includes('\n\n')
      ? source.indexOf('\n\n') + 1
      : source.length;
    expect(suggestions(source, position), source).toBeNull();
  }
  expect(
    suggestions(
      '---\nconfig:\n  theme: base\n---\nflowchart LR\n  su',
    )?.options.map((option) => option.label),
  ).toContain('subgraph');
});

test('identifiers come from nodes, participants and relations rather than labels or configuration', () => {
  const flow =
    '---\nconfig:\n  theme: base\n---\nflowchart LR\n  Start[Visible label] --> Finish{Done}\n  Finish --> Start\n  %% Ignore\n  classDef custom fill:red\n  class Start custom';
  expect(diagramIdentifiers(flow, 'flowchart')).toEqual(['Start', 'Finish']);
  expect(
    diagramIdentifiers(
      'flowchart LR\n API-service((Start)) --> Step[[Subroutine]]\n Step -->|Done| Finish@{shape: rect, label: "Final"}',
      'flowchart',
    ),
  ).toEqual(['API-service', 'Step', 'Finish']);
  expect(
    diagramIdentifiers(
      'sequenceDiagram\n participant Alice as Alice Smith\n Alice->>+Bob: Hello\n Bob-->>-Alice: Reply',
      'sequenceDiagram',
    ),
  ).toEqual(['Alice', 'Bob']);
  expect(
    diagramIdentifiers(
      'stateDiagram-v2\n state "Ready to go" as Ready\n [*] --> Ready\n Ready --> Running',
      'stateDiagram-v2',
    ),
  ).toEqual(['Ready', 'Running']);
  expect(
    diagramIdentifiers(
      'classDiagram\n class Parent\n Parent "1" o-- "*" Child',
      'classDiagram',
    ),
  ).toEqual(['Parent', 'Child']);
  expect(
    diagramIdentifiers(
      'erDiagram\n CUSTOMER ||--o{ ORDER : places',
      'erDiagram',
    ),
  ).toEqual(['CUSTOMER', 'ORDER']);
  const result = suggestions(`${flow}\n  Start --> Fi`)!;
  expect(result.options.map((option) => option.label)).toEqual([
    'Start',
    'Finish',
  ]);
  expect(result.options[0].detail).toBe('Identifiant existant');
});

test('a starter and a block can be inserted and edited with keyboard fields', async ({
  page,
}) => {
  await page.goto('/editor');
  const editor = page.getByRole('textbox', { name: 'Code Mermaid' });
  await expect(editor).toBeVisible();
  await editor.fill('');
  await page.getByRole('button', { name: 'Suggestions', exact: true }).click();
  await page
    .getByRole('option')
    .filter({ hasText: /^flowchart/ })
    .click();
  await expect(editor).toContainText('flowchart LR');
  await page.keyboard.press('Tab');
  await page.keyboard.insertText('StartNode');
  await expect(editor).toContainText('StartNode[Start]');
  await page.keyboard.press('Escape');
  await editor.fill(
    'sequenceDiagram\n  participant Alice\n  participant Bob\n  lo',
  );
  await page.keyboard.press('Control+Space');
  await page.getByRole('option').filter({ hasText: /^loop/ }).click();
  await page.keyboard.insertText('Retry');
  await expect(editor).toContainText('loop Retry');
  await page.keyboard.press('Tab');
  await page.keyboard.insertText('Client');
  await expect(editor).toContainText('Client->>Bob: Message');
  await page.keyboard.press('Escape');
  await page.keyboard.press('ControlOrMeta+z');
  await expect(editor).toContainText('Alice->>Bob: Message');
});

test('typing an identifier offers existing nodes and accepting it updates the preview', async ({
  page,
}) => {
  await page.goto('/editor');
  const editor = page.getByRole('textbox', { name: 'Code Mermaid' });
  await editor.fill(
    'flowchart LR\n  Start[Start] --> Finish[Finish]\n  Start --> ',
  );
  await page.keyboard.type('Fi');
  const option = page.getByRole('option').filter({ hasText: /^Finish/ });
  await expect(option).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(editor).toContainText('Start --> Finish');
  await expect(page.locator('.render-status')).toHaveText('Aperçu à jour');
});

for (const mobile of [false, true]) {
  test(`syntax errors navigate to the marked line${mobile ? ' on mobile' : ''}`, async ({
    page,
  }) => {
    if (mobile) await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/editor');
    const editor = page.getByRole('textbox', { name: 'Code Mermaid' });
    await editor.fill('flowchart LR\n  A[Start] --> B[Broken');
    if (mobile)
      await page.getByRole('button', { name: 'Aperçu', exact: true }).click();
    const link = page.getByRole('button', { name: /Aller à la ligne \d+/ });
    await expect(link).toBeVisible();
    const line = Number(
      (await link.getAttribute('aria-label'))!.match(/\d+/)![0],
    );
    await link.click();
    await expect(editor).toBeFocused();
    await expect(
      page.locator(`.cm-error-line[data-error-line="${line}"]`),
    ).toBeVisible();
    const selection = await page.evaluate(() =>
      window.getSelection()?.toString(),
    );
    expect(selection).toBe('  A[Start] --> B[Broken');
    await editor.fill('flowchart LR\n  A[Start] --> B[Fixed]');
    await expect(page.locator('.render-status')).toHaveText('Aperçu à jour');
    await expect(page.locator('.cm-error-line')).toHaveCount(0);
  });
}
