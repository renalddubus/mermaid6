# Contributing to Mermaid6

Thank you for helping improve Mermaid6. Contributions can include bug fixes, accessibility improvements, new Mermaid examples, translations, tests, documentation, and focused feature proposals.

## Before you start

- Use Node.js 24, as recorded in `.node-version`.
- Keep changes focused and avoid mixing unrelated refactors into a feature or fix.
- Search existing issues and pull requests before starting a large change.
- Open an issue first when a proposal changes the product scope, dependencies, persisted data, or release process.

## Set up the project

```sh
git clone https://github.com/renalddubus/mermaid6.git
cd mermaid6
npm ci
npm run dev
```

The development server is available at [http://localhost:5173](http://localhost:5173).

## Repository map

| Path               | Contents                                                           |
| ------------------ | ------------------------------------------------------------------ |
| `src/editor/`      | Code editor, Mermaid rendering, drafts, file handling, and exports |
| `src/components/`  | Shared interface and catalogue components                          |
| `src/i18n/`        | Interface and catalogue translations                               |
| `src/catalogue.ts` | Built-in Mermaid examples and metadata                             |
| `tests/`           | Playwright browser tests                                           |
| `docs/`            | Translation, release, and rendering documentation                  |
| `scripts/`         | Release metadata and artifact verification                         |

## Make a change

1. Create a short, descriptive branch from the latest `main`.
2. Add or update tests for behavior changes.
3. Keep the interface responsive, keyboard accessible, and usable in both themes.
4. Update documentation when behavior, setup, or contributor expectations change.
5. Run the quality checks before opening a pull request.

## Quality checks

Run the complete static check and production build:

```sh
npm run check
```

Install Chromium once, then run the browser tests:

```sh
npx playwright install chromium
npm test
```

Release-related changes must also pass:

```sh
npm run test:release
```

For a focused change, running the relevant Playwright file while iterating is fine, but run the complete suite before requesting review.

## Interface and accessibility

When changing the UI:

- Test desktop and mobile layouts.
- Preserve visible focus states and complete keyboard access.
- Use semantic elements and accessible names for controls.
- Check light and dark themes.
- Keep normal interface text at least 12 px and descriptive text at least 14 px.
- Avoid relying on color alone to communicate status.
- Verify that long translations do not overflow their controls.

## Translations

The interface supports English, French, Spanish, and German. English strings are the source keys, and user-visible additions should include all supported translations in the same pull request.

Follow [strings.md](strings.md) when adding or changing interface copy. Run the i18n tests to catch missing or stale strings:

```sh
npx playwright test tests/i18n.spec.ts
```

## Mermaid examples

New catalogue entries should have a clear practical purpose, valid Mermaid syntax, translated labels and descriptions, and browser-test coverage. Update [diagrammes.md](diagrammes.md) when rendering support or known limitations change.

## AI-assisted contributions

AI tools may be used to help develop a contribution. The contributor is still responsible for:

- Understanding and reviewing every submitted change.
- Verifying behavior with the appropriate checks and tests.
- Avoiding secrets, private data, or incompatible copyrighted material.
- Confirming that generated code, text, and assets are compatible with the MIT-licensed project.
- Disclosing material AI assistance in the pull request when it helps reviewers understand the work.

## Commits and pull requests

Use a concise action-oriented commit subject, such as `fix: preserve draft filename` or `docs: explain image exports`.

A pull request should include:

- A clear explanation of the problem and solution.
- Screenshots or recordings for visible UI changes.
- The checks and tests that were run.
- Any known limitation or follow-up work.
- Links to related issues or discussions.

By contributing, you agree that your contribution may be distributed under the repository's [MIT License](../LICENSE).
