# Interface translations

Updated 24 September 2026. Mermaid6 supports English, French, Spanish, and German across the home page, catalogue, editor, settings, loading states, dialogs, notifications, and application-owned errors.

## Translation sources

- `src/i18n/copy.ts`: English messages with French, Spanish, and German translations. Use `t()` for statically known messages and `tx()` for translated metadata and application errors.
- `src/i18n/catalogue.ts`: example names, descriptions, categories, and customization notes.
- `src/preferences.tsx`: settings, navigation, landing-page headings, and route-loading messages; preference resolution and persistence.
- [Translation inventory](strings-complet.json): a snapshot of all 416 messages with `key`, `en`, `fr`, `es`, and `de` fields. The source dictionaries remain authoritative.

## Adding interface text

Write new keys, code, and filenames in English. Add all three translations with the same named placeholders, such as `{filename}`, before using the message. Pass dynamic values separately instead of constructing translated sentences from fragments. Use the active locale for counts and plural selection.

Translate accessible labels, tooltips, empty states, helper text, errors, and third-party editor controls as well as visible headings. CodeMirror phrases are configured without replacing the document or undo history.

Imported filenames, user-authored Mermaid source, saved drafts, and raw Mermaid diagnostics are user or engine content and are not translated. Bundled example source is English; its catalogue description is localized. Switching languages must preserve source, search queries, selection, and open dialog choices.

## Validation

`tests/i18n.spec.ts` checks dictionary coverage and placeholder parity, all four languages on every route, editor search, errors, dialogs, live language changes, undo history, and draft recovery. `tests/preferences.spec.ts` checks system-language detection, explicit overrides, persistence, themes, and route loading.

Build with `npm run check` before running browser tests, which serve the built application. When copy changes, update this inventory alongside the dictionaries. Browser-generated file pickers and native select menus follow browser/operating-system conventions.
