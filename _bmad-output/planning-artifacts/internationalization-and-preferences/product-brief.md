# Product brief — Internationalization, preferences, and preview reliability

Status: proposed implementation scope, requested on 24 September 2026. These documents describe planned work; they do not claim implementation or validation.

## Purpose

Make Mermaid6 comfortable to use in English, French, Spanish, and German, with persistent language and appearance preferences, readable help text, and reliable preview updates after diagram color changes.

The audience remains developers, architects, and teams creating diagrams in a private, browser-based, self-hostable editor. This work extends the free MVP and requires no account or backend.

## Requested outcomes

- Support interface languages `en`, `fr`, `es`, and `de`.
- Follow the system language by default, with an explicit override in Settings.
- Persist settings in localStorage across navigation, reloads, and later visits.
- Offer application light and dark themes in Settings.
- Use English for code, identifiers, comments, test descriptions, and filenames by default; keep translated interface copy in locale resources.
- Increase helper text size across every page and dialog.
- Investigate and fix intermittent preview errors when colors change in the Mermaid configuration.
- Fix the full-catalogue link opening a blank page with an editor loading message; provide styled, destination-specific loading and recovery states.

## Planning decisions

- Settings offers **System language**, **English**, **Français**, **Español**, and **Deutsch**. System language means the ordered language preferences exposed by the browser; the application cannot read a separate operating-system locale directly.
- Unsupported system languages fall back to English. Selecting System language restores automatic selection after an override.
- The application initially uses the light theme, preserving the current presentation. Light and Dark are explicit choices. Following the system color scheme is outside this increment because it was not requested.
- Application appearance and Mermaid diagram appearance are independent. Changing Settings must preserve diagram source, diagram colors, export appearance, and editor history.
- Preferences use localStorage. The existing IndexedDB draft remains in IndexedDB.
- User-written diagram labels, imported filenames, and saved documents may use any language. A language change never translates a document. Bundled example source and generated default filenames use English; surrounding example descriptions are translated.

## Current baseline and uncertainty

The existing interface is primarily French, with copy spread across components, editor services, and catalogue data. Routing selects `/`, `/examples`, or `/editor`; there is no shared Settings interface. Drafts already survive reloads through IndexedDB. Mermaid rendering is already serialized, and the editor preserves the last valid preview after a failure.

The reported color issue has no confirmed reproduction or root cause. The current editor exposes Mermaid configuration in source; it has no dedicated color form. `appearance.ts` contains configuration helpers used by tests, and the home page has a separate ink selector. The defect story must identify the affected interaction before choosing a fix.

Additional navigation report: clicking “Explorer le catalogue complet” opens `http://localhost:8080/examples` as a blank page showing “Chargement de l'éditeur” without the application design system. The shared bare Suspense fallback is present in the current code; the reason the catalogue does not complete loading remains unconfirmed. Track the investigation and fix in Story 8.3 / FR14.

## Success criteria

- All three routes, startup states, dialogs, notices, and accessible labels are available in all four languages.
- A fresh visit follows a supported system language; an explicit choice wins and survives reloads.
- Theme changes apply immediately across the application and persist without changing a diagram.
- Helper text is visibly larger on desktop and mobile, with no clipped instructions or inaccessible controls.
- A captured color-change reproduction becomes a passing regression test; valid changes recover automatically, and genuine invalid input retains a clear error and the last valid preview.
- Maintained code and filenames follow the English convention, with existing document data and links preserved through any migration.
- The full-catalogue link reaches a usable examples page, with styled, localized loading feedback and actionable recovery if loading fails or stalls.

## Boundaries

No accounts, premium library, server persistence, cloud sync, new diagram types, new diagram color panel, automatic translation of user content, or Mermaid upgrade is required. Historical French planning documents remain a record of the original scope. New planning documents and development documentation use English.

## Document map

- [Requirements and acceptance criteria](prd.md)
- [Architecture and implementation decisions](architecture.md)
- [Epics, stories, and validation](epics.md)
- [Original product brief](../product-brief.md)

This change package extends the original MVP. Its requirements take precedence only for the behavior explicitly changed here; premium work and existing release-validation obligations remain separate.
