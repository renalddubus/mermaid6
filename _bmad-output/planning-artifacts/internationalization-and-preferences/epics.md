# Epics and stories — Internationalization, preferences, and preview reliability

Status: proposed backlog, 24 September 2026. All stories below are **not started**. Numbering continues the original [epics](../epics.md); Epic 5 remains deferred premium work. Acceptance criteria refer to the [PRD](prd.md), with implementation guidance in the [architecture](architecture.md).

## Epic 6 — Language and persistent preferences

### Story 6.1 — English code and localization foundation

As a contributor, I want English development conventions and a complete translation structure so the application can evolve consistently in four languages.

**Requirements:** FR7, FR11, NFR5. **Dependencies:** none.

Acceptance criteria:

- Inventory first-party UI copy across source, services, metadata, editor phrases, and accessible labels, using the existing string inventories as a starting point.
- Create the canonical English message catalogue and equivalent French, Spanish, and German catalogues with typed keys, interpolation, English fallback, and completeness checks.
- Separate stable category/example/ink IDs from translated labels, preserving legacy draft origins and public example URLs.
- Audit and migrate non-English code identifiers, comments, test descriptions, and maintained filenames; update all imports and documentation links. Record intentional locale/user-data exceptions.
- Use English for new bundled example source and `diagram.mmd` for new default names. Existing drafts, imported source, and user filenames survive unchanged.

**Validation:** key/interpolation parity; meaningful fallback/formatting tests; build/import/link checks; existing draft-origin fixtures survive migration. Tests and checks for this story remain green while later stories integrate the interface.

### Story 6.2 — Resolve and persist preferences safely

As a user, I want my system language used automatically and my chosen settings remembered in this browser.

**Requirements:** FR8, FR9.3–FR9.8, NFR5–NFR6. **Dependencies:** 6.1 message/error foundation.

Acceptance criteria:

- Implement version-1 localStorage preferences with `system` language and `light` theme defaults; bootstrap the same snapshot before normal content mounts.
- Resolve ordered system languages, regional variants, explicit overrides, unsupported/malformed languages, and English fallback as specified in FR8.
- Handle browser language changes in system mode and valid cross-tab preference events without loops.
- Handle absent/corrupt/future-version data, invalid fields, access denial, and write failures without blocking the application or touching IndexedDB drafts.
- Keep failed writes effective for the session, surface persistence status, and clear the warning after a later successful write.

**Validation:** system `fr-CA` → French; `it-IT, de-DE` → German; unsupported-only preferences → English; saved Spanish overrides a German system; invalid saved language retains a valid saved theme; blocked storage still permits use; reload restores valid choices.

### Story 6.3 — Settings and complete interface translation

As a user, I want to choose my language from any page and immediately understand the entire interface in that language.

**Requirements:** FR7, FR8.4–FR8.5, FR9.1–FR9.2, FR9.9, NFR7–NFR8. **Dependencies:** 6.1–6.2.

Acceptance criteria:

- Provide shared Settings access from home, examples, editor, and draft recovery, with the language and theme controls defined in the PRD. Theme styling is completed by 7.1.
- Translate every defined interface surface, including startup/loading states, metadata, CodeMirror labels/phrases, errors, statuses, catalogue search/filter labels, and dialog copy.
- Selecting a language updates the open dialog, current page, document language/title, numbers, and accessible names immediately; System language shows the effective locale.
- Translate application errors at display time while retaining engine diagnostics in details. Do not re-render or mutate diagrams just to relabel the interface.
- Preserve document, editor history/selection, zoom, draft, and export choices through changes. Implement keyboard access, focus trapping, Escape, and focus return.

**Validation:** route × locale smoke matrix; explicit override and return-to-system journeys; open-error and open-dialog language switches; localized search plus syntax-name search; keyboard/focus journey; existing source and undo remain intact.

## Epic 7 — Application appearance and readable help

### Story 7.1 — Persistent light and dark application themes

As a user, I want to choose a comfortable application theme without changing my diagram's appearance.

**Requirements:** FR10, FR9, NFR6–NFR8. **Dependencies:** 6.2–6.3.

Acceptance criteria:

- Apply semantic light/dark tokens to all pages, startup states, dialogs, controls, notices, and CodeMirror.
- Default to Light and apply persisted choices before normal content paints; Settings updates immediately and persists through the preference service.
- Keep Mermaid theme/configuration and SVG/PNG colors independent of application theme. Preserve explicit export backgrounds.
- Update CodeMirror appearance in place, retaining source, selection, focus, and undo history.

**Validation:** route × app-theme smoke matrix; persistence/direct-load checks; app-light/diagram-dark and app-dark/diagram-light; before/after source and export-color comparisons; no false unsaved-document indication.

### Story 7.2 — Enlarge helper text on every page

As a user, I want readable supporting text and instructions on desktop and mobile in either theme.

**Requirements:** FR12, NFR7. **Dependencies:** 6.3 and 7.1 for final visual validation; inventory can start earlier.

Acceptance criteria:

- Record helper selectors, route/state, and old/new desktop/mobile computed sizes. Include home, examples, editor, Settings, draft recovery, catalogue/export dialogs, and warning/error/replacement states.
- Increase every existing helper style by at least 2 CSS pixels, with a 16-pixel minimum at default browser settings, scalable units, and at least 1.5 line height.
- Meet the specified contrast in both themes; remove mobile overrides that violate the minimum.
- Verify all four locales at desktop and 375-pixel widths and 200% zoom. No clipped guidance, overlapping actions, or page-wide overflow; diagram labels/exports retain their original typography.

**Validation:** computed-size/contrast evidence and visual review of the affected surfaces, including the longest translations. Avoid brittle assertions on unrelated layout details.

## Epic 8 — Preview and navigation reliability

### Story 8.1 — Reproduce and diagnose the intermittent preview failure

As a maintainer, I want a minimal, repeatable color-change failure so the fix addresses the actual defect.

**Requirements:** FR13.1–FR13.3. **Dependencies:** none; may be investigated independently of the preferences work.

Acceptance criteria:

- Capture the original source, exact edit, diagram type/theme, browser, timing, and error output from a reproducible failure.
- Exercise direct frontmatter editing, quoted/unquoted hex values, incomplete/invalid values, repeated edits, and a failed render followed by a valid one. Include relevant home ink/helper paths only when evidence points there.
- Inspect existing queue/cancellation behavior and diagram-specific variable support; label hypotheses separately from confirmed findings.
- Add the smallest meaningful failing regression test for the confirmed defect. Record whether the issue is valid input failing, incorrect guidance on invalid input, stale results, or another demonstrated cause.
- If no intermittent failure can be reproduced, record tested cases and evidence still needed; do not mark the reported bug resolved based solely on unrelated passing tests. Request a source sample/exact interaction only if the independent investigation cannot establish a reproduction.

**Validation:** regression fails against the pre-fix implementation for the stated reason, with a written reproduction alongside the implementation work.

### Story 8.2 — Fix preview recovery and protect export fidelity

As a user, I want valid color edits to produce the latest preview and invalid edits to recover as soon as I correct them.

**Requirements:** FR13, NFR6, NFR8. **Dependencies:** 8.1; integrate localized messages through 6.1/6.3 before release.

Acceptance criteria:

- Apply the smallest fix supported by the reproduction, preserving serialized rendering, stale-result guards, and cleanup on success/failure.
- Rapid valid changes settle on the latest source and color. Superseded successes or errors cannot overwrite the current result.
- Invalid input retains editable source and a clearly stale last-valid preview, with actionable localized guidance. Valid input clears the error and renders without reloading.
- Preserve unrelated YAML fields/comments, diagram body, per-element styles, and configured security/size limits. Programmatic writes serialize valid quoted color strings.
- Image export is blocked while stale/pending/invalid and, after recovery, uses the latest successful rendering. `.mmd` download remains available even when rendering fails.

**Validation:** the defect regression passes; cover rapid edits, invalid-to-valid recovery, catalogue/editor render interleaving, applicable color profiles, and SVG/PNG color fidelity. Re-run existing catalogue, file, editor, and export tests to catch regressions.

### Story 8.3 — Fix blank catalogue navigation and restore styled loading states

As a user, I want the full catalogue link to open the examples page with clear, consistently styled feedback while it loads.

**Requirements:** FR14, FR7, FR10, FR12, NFR7. **Priority:** high; the report affects a primary navigation path. **Dependencies:** investigate immediately; integrate translations and theme/typography tokens from 6.3 and 7.1–7.2 before release. **Status:** reported, not started.

**Reported reproduction:** from the home page, click “Explorer le catalogue complet” targeting `http://localhost:8080/examples`. The page becomes blank except for “Chargement de l'éditeur”, with no design-system layout or styling. It should open the full examples catalogue; any intermediate loading state should describe the catalogue and use the application design system.

Acceptance criteria:

- Reproduce the click path against the built application served at port 8080, capturing console errors, route/chunk requests, timing, and whether loading eventually completes. Check direct navigation and reload at `/examples` too.
- Diagnose catalogue load completion separately from the loading presentation. `src/Root.tsx` currently shares a bare editor-specific Suspense fallback across lazy routes; this confirms the wrong message and missing layout, but does not establish why the reported page stays blank.
- The link reliably reaches a usable catalogue, including search, filters, and example selection, on desktop and mobile. Direct navigation and reload behave consistently.
- While loading, retain a styled application shell with branding/navigation, spacing, readable helper text, and an accessible status appropriate to the destination. In French, use catalogue wording such as “Chargement du catalogue…”; never show an editor-specific message for `/examples`.
- Loading and error states use the active language and saved application theme from their first display. Their shared styling must be available before the lazy catalogue module loads.
- A failed or stalled route load exposes a styled, actionable recovery state with retry/reload and a way back home; it must not leave users on an indefinite bare loading paragraph. Document the stall threshold and retry behavior during implementation.
- Add regression coverage for the actual home-link journey, delayed loading, failed loading/recovery, and direct `/examples` visits. Assert both the intermediate design-system state and the final usable catalogue, rather than only the URL or disappearance of the loading text.

**Validation:** built-app navigation tests, controlled delayed/failed route requests, keyboard/status checks, and desktop/mobile visual review in all four locales and both themes. Keep the bug open until the reported failure is reproduced and verified fixed.

## Delivery sequence and requirement coverage

Recommended implementation order: 6.1 → 6.2 → 6.3 → 7.1 → 7.2. Investigate 8.1 early; complete 8.2 once its cause is established and integrate its localized messaging before release. This is a dependency plan, not a claim that implementation has begun.

Investigate the high-priority catalogue navigation failure in 8.3 early as well. Its functional diagnosis can start independently; complete the shared loading/error presentation with the locale, theme, and helper-text work before release.

| Requirement                             | Primary stories                           |
| --------------------------------------- | ----------------------------------------- |
| FR7 — Four languages                    | 6.1, 6.3                                  |
| FR8 — System language and override      | 6.2, 6.3                                  |
| FR9 — Settings and localStorage         | 6.2, 6.3, 7.1                             |
| FR10 — Application themes               | 7.1                                       |
| FR11 — English code and filenames       | 6.1; convention applies to every story    |
| FR12 — Larger helper text               | 7.2                                       |
| FR13 — Color-preview reliability        | 8.1, 8.2                                  |
| FR14 — Catalogue navigation and loading | 8.3                                       |
| NFR5–NFR8                               | Shared implementation and delivery checks |

## Definition of done for this increment

- All stories meet their acceptance criteria with evidence linked from their implementation records; an unreproduced defect is explicitly open.
- All locale catalogues are complete; both themes and larger helper text are reviewed on every required surface.
- Preference precedence, reload persistence, storage failures, state preservation, and the confirmed color regression are covered by meaningful automated tests.
- The full-catalogue link and direct `/examples` visits reach a usable catalogue, with styled, localized loading and failure-recovery states covered by regression tests.
- Run `npm run check` before `npm test`, because browser tests serve the built application. Add focused tests as needed without weakening the existing catalogue/export matrix.
- Record Safari manual validation under the existing project policy; Firefox remains deferred. Revisit the rendering performance target if scheduling changes.
- Update user/developer documentation, translation inventories, changed filename references, and implementation status. Keep prior release/premium obligations separate.

No application implementation, regression fix, runtime test execution, or user validation is implied by this documentation-only change.
