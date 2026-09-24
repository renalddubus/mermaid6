# Implementation record

Updated 24 September 2026.

## Localization follow-up — Stories 6.1 and 6.3

The first implementation localized settings and primary headings but left much of the interface in French. This follow-up completes the translation dictionaries and applies them to the home page, illustrations, catalogue metadata and search, editor, recovery/import/export dialogs, notifications, helper text, accessible labels, and application-owned errors.

All four languages (English, French, Spanish, and German) have complete message entries. Counts use locale-aware formatting and plural rules. The [translation guide](../../../docs/strings.md) and [inventory](../../../docs/strings-complet.json) document the current messages and contribution rules.

Language changes update open dialogs, existing notifications and errors, and CodeMirror controls. The editor document, undo history, search query, export choices, and imported filenames are preserved. Built-in example source and the default `diagram.mmd` filename are English; user source and saved drafts retain their original content. Legacy draft origin identifiers remain compatible.

Mobile screenshot review also identified light backgrounds behind dark-theme text. Page backgrounds, selected home/catalogue cards, search fields, secondary buttons, and the footer brand now use the application theme colors.

## Verification

- Static checks include formatting, lint, TypeScript, and a production build.
- Dictionary tests cover dynamic catalogue/model/appearance labels and placeholder parity.
- Browser tests exercise all four languages on every route, errors, import/export dialogs, CodeMirror search, live language switching, undo history, and draft recovery.
- Mobile coverage checks each language across the home page, catalogue, and editor export dialog in the dark application theme.
- The existing catalogue and export matrix continues to validate every built-in diagram type.

Final validation: `npm run check` passed. The full Chromium suite passed 130 tests, with one container-only health/resource check skipped because the run used the local production preview. German mobile screenshots were reviewed for the home page, catalogue, and export dialog. Safari manual validation remains outstanding. This localization record does not close the separate color-preview investigation, establish the cause of the originally reported catalogue loading failure, or certify every acceptance criterion of Epics 7–8.
