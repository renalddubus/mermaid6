# Architecture — Internationalization, preferences, and preview reliability

Status: proposed, 24 September 2026. Extends the existing [architecture](../architecture.md) for [FR7–FR14](prd.md). Implementation remains React/TypeScript/Vite with browser-only rendering, localStorage preferences, and IndexedDB drafts.

## Current integration points

- `src/main.tsx` mounts React; `src/Root.tsx` selects routes and owns the lazy-loading boundary.
- `src/App.tsx`, `src/CataloguePage.tsx`, and editor components contain French UI copy. `src/catalogue.ts` and `src/models.ts` mix display labels with example data; some category and ink values also act as identities.
- `src/editor/EditorEntry.tsx` restores drafts and shows startup/conflict states before mounting the editor.
- `src/editor/CodeEditor.tsx` creates one CodeMirror instance; its current accessible name is hard-coded.
- `src/editor/appearance.ts` reads/writes diagram frontmatter. `src/editor/render.ts` serializes Mermaid calls and sanitizes output. `src/editor/EditorPage.tsx` debounces rendering and guards against obsolete results.
- `src/styles.css`, `src/components/catalogue.css`, and `src/editor/editor.css` include small 8–13-pixel text rules and several fixed light colors. Identify the actual helper selectors and computed sizes during the typography audit.
- `docs/strings.md` and `docs/strings-complet.json` are starting inventories, not guaranteed current or complete translation catalogues.

These paths describe the current repository, not a request to rewrite unrelated parts of the application.

## Preference state and persistence

Introduce a small preference module and a React provider above route selection and Suspense. Keep storage parsing, locale resolution, and visual presentation separately testable.

Proposed modules:

```text
src/preferences/preferences.ts
src/preferences/PreferencesProvider.tsx
src/preferences/SettingsDialog.tsx
src/i18n/index.ts
src/i18n/locales/en.ts
src/i18n/locales/fr.ts
src/i18n/locales/es.ts
src/i18n/locales/de.ts
```

Persist a single record under `mermaid6.preferences`:

```json
{
  "version": 1,
  "language": "system",
  "theme": "light"
}
```

`language` accepts `system | en | fr | es | de`; `theme` accepts `light | dark`. Defaults are `system` and `light`. Store the preference, not the resolved system locale. No source text, diagram configuration, draft identifier, or export options belong in this record.

At bootstrap, safely read and validate storage before mounting normal content, compute the locale, and set root language/theme attributes. Pass the same snapshot into the provider to avoid different first-render defaults. Use an external entry module compatible with the existing deployment security policy; no inline script or relaxed policy is required.

Storage behavior:

- Catch failures when accessing localStorage as well as when reading, parsing, or writing it.
- A missing/unreadable record or unknown schema version uses defaults. For version 1, validate each field independently so a bad theme does not discard a valid language.
- Do not erase corrupt/future-version records or unrelated keys at startup. An explicit user preference change may replace this application's record with valid version-1 data.
- Apply state changes even when saving fails; retain an observable session-only status and localized warning. Retry on a subsequent user change, without an uncontrolled retry loop.
- Process storage events through the same validator, without writing the incoming value back. A removed key uses defaults; ignore malformed updates. Preserve diagram state in all cases.
- Keep IndexedDB draft handling unchanged. localStorage availability and IndexedDB availability are separate concerns.

## Locale resolution and message ownership

Resolve an explicit supported choice first. In system mode, scan the browser's ordered language list, normalize supported language tags to their lowercase base language, and use the first match. Fall back to `navigator.language` when the preferred list is absent/empty and then to English if no supported language is found. Ignore malformed values safely. Listen for `languagechange` only to update system-mode resolution.

Use an English canonical catalogue with typed keys and four eagerly available, bundled locale resources. A lightweight typed translation interface is sufficient for this scope; an external translation service is unnecessary. Provide interpolation and locale-aware formatting/plural handling through standard `Intl` APIs, rather than string concatenation.

Separate stable data from labels. Category/example/ink identifiers remain stable English identifiers, while display names are message keys. Preserve legacy draft `origin` values when moving any identity away from a translated label. Catalogue search uses translated metadata plus syntax names and stable aliases.

Application services should return structured error codes and parameters, with raw diagnostics retained separately. Translate errors/notices at presentation time so a visible error changes language immediately. Avoid storing translated display text as durable state. Do not attempt to translate Mermaid parser output.

Update `document.documentElement.lang`, document titles, modal labels, statuses, and CodeMirror accessibility when the locale changes. CodeMirror compartments or equivalent reconfiguration should update phrases/accessibility and theme without recreating the editor. Rendering helpers must not embed a permanently French SVG accessible name; apply/update a translated accessible description without changing diagram content or export colors.

New bundled examples use English labels in their source, independent of interface locale. Preserve already opened or restored source verbatim. The same rule applies to the default `diagram.mmd` name versus existing imported/saved names.

## Settings interaction

Mount a shared Settings dialog/provider outside individual page implementations so all routes and startup states use one preference source. Add consistent header access on each route; use an accessible entry point on draft recovery. Localize the Suspense fallback through the provider.

Apply changes on selection. Explain that preferences stay in this browser and that the theme controls the application interface. Keep the dialog open while a language selection updates its text. Implement focus trapping, Escape dismissal, opener focus restoration, and descriptive control labels. Expose the resolved locale alongside System language.

## Application themes and helper typography

Set a root attribute such as `data-app-theme="light"` or `data-app-theme="dark"` and matching CSS `color-scheme`. Define semantic tokens for page/panel surfaces, text/muted text, borders, accent, focus, errors, warnings, and disabled controls. Replace hard-coded application colors where needed, including dialogs and CodeMirror gutters/selections.

Keep the existing diagram-derived preview styling separate from the application attribute. Never pass the app theme into `changeAppearance`, write it into frontmatter, or allow app text/background selectors to recolor sanitized diagram SVG elements. Existing diagram themes, source styles, and export background choices remain authoritative.

Define helper typography tokens, starting at `1rem` with line height `1.5`; use a larger token such as `1.125rem` where the audited baseline requires it. Record each helper selector's old and new computed desktop/mobile size. A blanket minimum alone is insufficient: FR12 also requires every existing helper style to increase. Check wrapping and spacing after enlarging text.

## Color-preview defect investigation and fix boundaries

The renderer already has a shared queue, and the editor already cancels obsolete attempts. Do not assume an absent queue or claim a race is proven. Establish the failing input and timing first.

Investigate these hypotheses, without treating them as confirmed causes:

- A raw YAML color such as `primaryColor: #ff0000` is interpreted as a comment rather than the intended string; compare with `primaryColor: '#ff0000'`.
- Intermediate edits leave incomplete strings/frontmatter or malformed `config`/`themeVariables` mappings.
- A valid-looking value is unsupported by the active Mermaid theme/diagram type, or configuration from another render affects the result.
- A slow previous render or rejection changes status after a newer edit, or a failure leaves shared Mermaid configuration/rendering in an unhealthy state.

Use a source/revision identity consistently for both success and failure. Only the latest attempt may update the visible error, current SVG, or export eligibility. Keep queue recovery and temporary-container cleanup on every completion path. Preserve Mermaid's strict security, sanitization, and size/complexity limits.

On invalid input, preserve source and the last valid SVG with an explicit stale status. On a subsequent valid input, render again automatically and clear the prior error when the latest render succeeds. Localized guidance must distinguish configuration/color errors when confidently identifiable; otherwise show a general render error with technical details. Do not silently normalize or discard user input to hide failures.

For programmatic appearance changes, continue using parsed YAML documents and valid string serialization to preserve unrelated fields and comments. A fix need not introduce a new color-control UI. If the defect is entirely invalid input, document that finding and improve actionable guidance/recovery rather than asserting that malformed input must render.

## Catalogue navigation and shared loading states

The home-page full-catalogue link in `src/App.tsx` targets `/examples`. `src/Root.tsx` lazy-loads the catalogue and editor behind one Suspense boundary whose fallback is a bare paragraph saying “Chargement de l’éditeur…”. This establishes the incorrect shared loading presentation; it does not prove the cause or duration of the reported catalogue load failure.

For Story 8.3, reproduce the click against the built app at port 8080 and inspect route/chunk requests, console errors, and catalogue initialization. Separate successful-but-slow loading from rejected imports, runtime errors, or stalled requests before selecting a fix.

Provide a shared loading shell outside the lazy page module, with eagerly available design-system styles and the preference/locale provider above it. Use destination-specific status copy and keep navigation available. Cover rejected route loads with an error boundary or equivalent recovery mechanism; Suspense alone only covers pending loading. Define a stalled-load threshold and explicit recovery behavior, including whether retry reloads the page to recover a rejected lazy import. Do not erase preferences or drafts to recover navigation.

Verify the actual home-link journey and direct `/examples` loads. Use controlled delays/failures to inspect loading and recovery states, then assert that the catalogue's real controls become usable. Localization or fallback styling alone does not close the reported navigation failure.

## English migration

Audit source, tests, scripts, configuration, and maintained file paths. Move localized messages to resources; use English identifiers and comments. Review French filenames, update all consumers atomically, and preserve stable public routes and persistence contracts. Existing English `catalogue` names are acceptable.

Historical French BMAD content may remain. New documentation is English; locale values, language fixtures, third-party protocol keys, and user content are intentional exceptions to the code-language convention. Regenerate or update the string inventory after extraction and any filename changes.

## Validation strategy

- Test locale precedence, regional language matching, unsupported lists, language-change events, schema parsing, and storage failures.
- Exercise all routes under all four locales and both app themes, with fresh and persisted preferences. Include startup, open dialogs, error states, cross-tab changes, and direct route loads.
- Verify keyboard navigation, focus restoration, document language, localized accessible names, text size, contrast, long translations, narrow viewports, and zoom.
- Assert that language/theme changes preserve source, cursor/selection, undo, draft, zoom, and export settings; compare diagram/export colors across app themes.
- Reproduce the color defect through the actual affected interaction; cover rapid changes, failure recovery, catalogue/editor interleaving, and current-source export fidelity.
- Extend existing tests with English test descriptions. Give existing browser suites an explicit locale when testing a particular language so host-language changes do not make tests nondeterministic.
- Run the project checks and Chromium suite after implementation. Record Safari manual validation according to the existing browser policy. Only broaden renderer performance testing if scheduling changes.
