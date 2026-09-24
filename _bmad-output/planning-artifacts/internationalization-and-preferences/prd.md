# PRD — Internationalization, preferences, and preview reliability

Status: proposed, 24 September 2026. See the [product brief](product-brief.md) for scope and defaults. IDs extend the original [PRD](../prd.md), where FR6 remains reserved for premium features.

## Functional requirements

### FR7 — Four-language interface

Provide complete English (`en`), French (`fr`), Spanish (`es`), and German (`de`) translations.

Acceptance criteria:

1. Localize navigation, home content, example names/descriptions/categories/limitations, search/filter controls, editor chrome, configuration guidance, Settings, import/export dialogs, draft recovery, empty/loading states, notices, and application-owned errors.
2. Localize document titles, placeholders, tooltips, alternative text, accessible names, and live status announcements. Set the document language to the resolved locale.
3. Localize number formatting and plural messages using the active locale. Keep Mermaid syntax, configuration keys, internal IDs, and technical units stable.
4. Use complete messages with interpolation rather than concatenated fragments. Locale resources share the same keys and interpolation parameters. Missing translations fall back to English without displaying raw keys; checks fail before release when supported locales are incomplete.
5. Localize application-owned error summaries and guidance. Preserve raw Mermaid/browser diagnostics in an expandable detail section, even when that diagnostic is in another language.
6. Switching language updates the mounted page, open Settings, existing error summaries, and accessible labels immediately, without navigation or loss of source, selection, undo history, draft, zoom, or export choices.
7. Search matches localized example metadata and stable Mermaid syntax/type names. Switching language preserves valid filter identities because category and example IDs are independent of translated labels.
8. Bundled diagram examples use English source content consistently across locales. User text, imported documents, and restored drafts are never automatically translated or renamed.

### FR8 — System language and explicit override

Acceptance criteria:

1. With no saved language choice, use `system` mode. Inspect `navigator.languages` in order; use `navigator.language` when that list is absent or empty.
2. Match supported base languages case-insensitively: `fr-CA` resolves to `fr`, `en-GB` to `en`, `es-MX` to `es`, and `de-AT` to `de`. Skip unsupported or malformed entries and choose the first supported language. Use `en` when no supported entry exists.
3. A saved explicit `en`, `fr`, `es`, or `de` always wins over browser preferences. Unsupported saved values fall back to `system`.
4. Settings exposes System language and all four native language names. In system mode it shows the resolved language, so the current choice is understandable.
5. Choosing System language again removes the explicit override. A browser `languagechange` event recomputes the locale only in system mode; explicit overrides remain stable.

### FR9 — Shared Settings and local persistence

Acceptance criteria:

1. Settings is reachable from `/`, `/examples`, and `/editor`, including the editor's draft-recovery state. It contains language and application theme controls with explanatory helper text.
2. Changes apply immediately and attempt to persist immediately. Dismissing Settings keeps applied choices. The interface indicates that preferences are stored in this browser.
3. Store only a versioned preference record in localStorage, separate from IndexedDB drafts. The planned key is `mermaid6.preferences`; see the [schema](architecture.md#preference-state-and-persistence).
4. Restore saved choices before the first normal page paint, including direct visits to `/examples` and `/editor`. Resolve language before showing application loading messages.
5. Missing storage, malformed JSON, unsupported versions, invalid individual fields, blocked access, and quota failures never prevent the application from opening or editing a diagram. Use safe defaults for unreadable/invalid values and retain valid fields from a supported schema.
6. A failed save keeps the current choices active for the session and displays a localized, non-blocking message that persistence is unavailable. Do not claim they were saved. A later successful save clears that warning.
7. Clearing site data returns language to System language and appearance to Light on the next load. Preference recovery never clears or rewrites diagram drafts.
8. A valid preference change from another tab is reflected through the storage event without an echo-write loop. A removed record restores defaults; malformed events are safely ignored.
9. Settings has a localized accessible title, labeled controls, keyboard operation, visible focus, and a close control. A modal implementation traps focus, closes with Escape, and restores focus to its opener.

### FR10 — Application light and dark themes

Acceptance criteria:

1. Settings offers Light and Dark. The initial value is Light when no valid theme is saved; theme selection is independent of language selection.
2. Apply the selected theme immediately to page surfaces, navigation, text, helper text, forms, dialogs, focus/hover/disabled states, notices, and CodeMirror chrome on every route.
3. The saved theme survives reload and route navigation. Loading and draft-recovery states use the same theme without a visible flash of the opposite theme.
4. Application theme changes never write Mermaid `config.theme` or `themeVariables`, modify source, dirty a document, or change diagram/export colors. Diagram preview backgrounds remain appropriate to the diagram's own configuration; explicit export backgrounds remain unchanged.
5. Text, controls, and editor syntax remain legible in both themes, including when application and diagram themes differ. Verify app-light/diagram-dark and app-dark/diagram-light combinations.
6. Reconfigure the mounted editor's appearance without resetting its document, focus, cursor, selection, or undo history.

### FR11 — English development convention

Acceptance criteria:

1. Use English for first-party source filenames and folders, identifiers, translation keys, comments, test descriptions, build/configuration descriptions, and newly written technical documentation.
2. Move non-English application copy into locale resources. English is the canonical message set; French, Spanish, and German occur as translation values or intentional language test fixtures. Bundled example source defaults to English.
3. Audit existing maintained code and filenames as part of this increment; do not limit the convention to newly added files. English spellings such as `catalogue` are valid and need no cosmetic rename.
4. Rename clearly non-English maintained documentation/asset filenames, updating imports, tests, scripts, and Markdown links together. Initial candidates are `docs/diagrammes.md` → `docs/diagrams.md` and `docs/strings-complet.json` → `docs/strings-complete.json`; confirm usage before changing them.
5. Use `diagram.mmd` as the new default document filename in every interface language. Preserve user-supplied names and existing saved names verbatim.
6. Preserve stable URLs, example IDs, external/library configuration keys, and stored document data. If an internal identifier used in persistence changes, supply an explicit backward-compatible reader or migration.

### FR12 — Larger helper text throughout the application

Helper text includes supporting descriptions, instructions, field hints, limitations, empty/loading guidance, save/render statuses, error guidance, and footer notes. It includes all pages and dialogs, including Settings and draft recovery; it excludes diagram labels and user-authored source.

Acceptance criteria:

1. Inventory current helper text and its desktop/mobile computed size before implementation. Increase each existing helper text style by at least 2 CSS pixels at the default browser font size and enforce a minimum of 16 CSS pixels. Use scalable `rem` tokens; larger existing helpers may need a larger token.
2. Use at least `1.5` line height for helper text and a minimum text/background contrast ratio of `4.5:1` in both application themes.
3. At 375 CSS pixels wide and at 200% browser zoom, instructions wrap without truncation, overlap, inaccessible actions, or page-wide horizontal scrolling. Diagram/code regions may retain intentional internal scrolling.
4. Verify all four languages, especially longer German/Spanish text, on the home page, examples page, editor, Settings, catalogue dialog, export dialog, and draft/replacement/error states.
5. No mobile rule shrinks helper text below the new minimum. This change must not alter exported diagram font sizes.

### FR13 — Reliable preview after color configuration changes

User report: changing a color in the configuration sometimes puts the preview in an error state. Root cause and exact triggering input are unconfirmed.

Acceptance criteria:

1. Capture a minimal reproduction with original source, changed field/value, diagram type, theme, browser, exact diagnostic, and interaction timing. Cover direct edits to Mermaid frontmatter; inspect the separate home ink selector and appearance helpers when relevant.
2. Starting from a supported valid diagram/configuration, replacing a supported color with another valid color renders the latest complete source without a persistent error. Repeat changes and rapid successive edits must settle on the newest value.
3. Distinguish malformed YAML, invalid color values, unsupported diagram-specific variables, temporary incomplete typing, and failures on valid configuration. Do not describe all failures as syntax errors or claim unsupported variables necessarily affect a diagram.
4. Temporary invalid input may show a truthful error. Preserve source and the last valid preview, mark that preview as out of date, and automatically clear the error after valid input is restored, without requiring a reload.
5. An obsolete success or failure must never overwrite the newest render state. A failed render must not prevent a later valid source from rendering, including when a catalogue preview uses the same renderer.
6. Keep image export disabled while the current source is pending or invalid. After recovery, PNG/SVG export must match the current valid source and colors. Source `.mmd` download remains available for recovery.
7. Configuration changes preserve unrelated frontmatter, comments, diagram body, and explicit per-element styles. Any programmatic color write emits valid quoted YAML strings. Direct invalid input remains editable and is not silently rewritten or discarded.
8. Add a regression test that fails before the fix for the reproduced defect, plus coverage of rapid changes, invalid-to-valid recovery, and color fidelity after export. Preserve existing rendering security and size/complexity limits.

### FR14 — Reliable catalogue navigation and styled loading states

User report: clicking “Explorer le catalogue complet” on the home page opens `http://localhost:8080/examples`, but the page becomes blank with “Chargement de l'éditeur” and no design-system presentation. The duration and cause of the load failure are not yet verified.

Acceptance criteria:

1. The home-page link reaches a usable full catalogue at `/examples`, including search, filters, and example selection. Direct visits and reloads also work against the built application served at port 8080.
2. During lazy loading, show a styled application shell with branding/navigation and a destination-appropriate accessible status. The examples route uses catalogue wording, such as “Chargement du catalogue…” in French, rather than the editor loading message.
3. Loading/error states use shared design-system spacing, typography, colors, and readable helper text on desktop and mobile, in all four languages and both themes. Shared styles are available before the catalogue module resolves.
4. Load rejection or a request stalled beyond a documented threshold displays an actionable, styled recovery state with retry/reload and home navigation. Loading must not remain an indefinite bare paragraph. Recovery must preserve saved preferences and drafts.
5. Investigate the page-load failure separately from correcting the fallback text/layout. Record actual console/network evidence and confirm the final catalogue is interactive before closing the issue.
6. Add regression tests for the clicked link, direct visit/reload, controlled slow loading, and failed loading/recovery. Verify the intermediate presentation and completed catalogue, including keyboard/status accessibility.

## Non-functional requirements

- **NFR5 — Local operation:** ship all locale resources and theme assets with the application; changing preferences requires no external translation service or backend.
- **NFR6 — State integrity:** preference failures or changes cannot corrupt a diagram or its draft. Maintain the existing rendering/export privacy and security constraints.
- **NFR7 — Accessible presentation:** satisfy FR9 keyboard/focus behavior and FR12 sizing/contrast across both themes and all supported locales.
- **NFR8 — Responsiveness:** locale/theme changes do not reload the page or trigger diagram re-rendering solely to change interface appearance. Preserve the original editor responsiveness target; validate rendering performance if the defect fix changes scheduling.

## Delivery gate

All acceptance criteria must be traceable to the [stories](epics.md). Run formatting, lint, type checking, build, focused preference/render tests, and the existing Chromium suite after implementation. Follow the existing project browser policy: record Safari manual validation and leave Firefox deferred unless scope changes. These checks are future implementation requirements; documentation creation alone does not satisfy them.
