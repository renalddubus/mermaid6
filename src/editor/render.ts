import mermaid from 'mermaid';
import DOMPurify from 'dompurify';
import { normalizeSvgLabels } from './svgLabels';

export const MAX_SOURCE_LENGTH = 50_000;
let counter = 0;
let queue: Promise<unknown> = Promise.resolve();

export function renderDiagram(source: string, isCurrent: () => boolean) {
  // Mermaid has shared configuration: run one render at a time, skipping obsolete work.
  const result = queue.then(async () => {
    if (!isCurrent()) return null;
    if (!source.trim())
      throw new Error(
        'Écrivez un diagramme ou choisissez un exemple pour commencer.',
      );
    if (source.length > MAX_SOURCE_LENGTH)
      throw new Error(
        'Ce diagramme dépasse la limite de 50 000 caractères. Réduisez sa taille pour afficher l’aperçu.',
      );
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      suppressErrorRendering: true,
      htmlLabels: false,
      fontFamily: 'Arial, sans-serif',
      themeCSS: '',
      maxTextSize: MAX_SOURCE_LENGTH,
      maxEdges: 500,
      logLevel: 'fatal',
      secure: [
        'secure',
        'securityLevel',
        'startOnLoad',
        'maxTextSize',
        'maxEdges',
        'htmlLabels',
        'fontFamily',
        'themeCSS',
        'suppressErrorRendering',
        'dompurifyConfig',
      ],
    });
    const container = document.createElement('div');
    container.className = 'mermaid-render-stage';
    container.setAttribute('aria-hidden', 'true');
    document.body.append(container);
    try {
      const { svg, diagramType } = await mermaid.render(
        `mermaid6-${++counter}`,
        source.replace(/^\uFEFF/, ''),
        container,
      );
      if (!isCurrent()) return null;
      const variables = mermaid.mermaidAPI.getConfig().themeVariables;
      const normalized = normalizeSvgLabels(
        svg,
        diagramType === 'journey'
          ? variables?.primaryTextColor
          : variables?.textColor,
      );
      const safe = DOMPurify.sanitize(normalized, {
        USE_PROFILES: { svg: true, svgFilters: true },
        ADD_TAGS: ['style'],
        FORBID_TAGS: ['foreignObject', 'image', 'a'],
      });
      const parsed = new DOMParser().parseFromString(safe, 'image/svg+xml');
      const element = parsed.documentElement;
      if (element.localName !== 'svg' || parsed.querySelector('parsererror'))
        throw new Error('Le diagramme n’a pas pu être affiché.');
      element.setAttribute('width', '100%');
      element.setAttribute('height', '100%');
      element.setAttribute(
        'style',
        'max-width: none; width: 100%; height: 100%;',
      );
      element.setAttribute('role', 'img');
      element.setAttribute('aria-label', 'Diagramme Mermaid');
      return new XMLSerializer().serializeToString(element);
    } finally {
      container.remove();
    }
  });
  queue = result.catch(() => undefined);
  return result;
}

export function describeError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const line = message.match(/(?:line|ligne)\s+(\d+)/i)?.[1];
  return {
    title: line
      ? `Erreur de syntaxe à la ligne ${line}`
      : 'Le diagramme ne peut pas être affiché',
    detail: message.slice(0, 1800),
  };
}
