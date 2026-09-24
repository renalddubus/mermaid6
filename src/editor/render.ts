import mermaid from 'mermaid';
import DOMPurify from 'dompurify';
import { normalizeSvgLabels } from './svgLabels';

export const MAX_SOURCE_LENGTH = 50_000;
let counter = 0;
let queue: Promise<unknown> = Promise.resolve();

export function normalizeThemeColorsForRender(source: string) {
  const bom = source.startsWith('\uFEFF') ? '\uFEFF' : '';
  const content = source.slice(bom.length);
  const match = content.match(/^(---\r?\n)([\s\S]*?)(\r?\n---(?:\r?\n|$))/);
  if (!match) return source;
  const lines = match[2].split(/\r?\n/);
  let variablesIndent = -1;
  const normalized = lines.map((line) => {
    const indentation = line.match(/^\s*/)?.[0].length ?? 0;
    if (/^\s*themeVariables\s*:/.test(line)) {
      variablesIndent = indentation;
      return line;
    }
    if (
      variablesIndent >= 0 &&
      line.trim() &&
      indentation <= variablesIndent &&
      !line.trimStart().startsWith('#')
    )
      variablesIndent = -1;
    if (variablesIndent < 0) return line;
    return line.replace(
      /^(\s*[\w-]+\s*:\s*)(#[\da-f]{6}|#[\da-f]{3})(\s*(?:#.*)?)$/i,
      "$1'$2'$3",
    );
  });
  return `${bom}${match[1]}${normalized.join('\n')}${match[3]}${content.slice(match[0].length)}`;
}

export function renderDiagram(source: string, isCurrent: () => boolean) {
  // Mermaid has shared configuration: run one render at a time, skipping obsolete work.
  const result = queue.then(async () => {
    if (!isCurrent()) return null;
    if (!source.trim())
      throw new Error('Write a diagram or choose an example to get started.');
    if (source.length > MAX_SOURCE_LENGTH)
      throw new Error(
        'This diagram exceeds the 50,000-character limit. Reduce its size to display the preview.',
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
        normalizeThemeColorsForRender(source).replace(/^\uFEFF/, ''),
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
        throw new Error('The diagram could not be displayed.');
      element.setAttribute('width', '100%');
      element.setAttribute('height', '100%');
      element.setAttribute(
        'style',
        'max-width: none; width: 100%; height: 100%; font-family: Arial, sans-serif;',
      );
      element.setAttribute('role', 'img');
      element.setAttribute('aria-label', 'Mermaid diagram');
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
      ? 'Syntax error on line {line}'
      : 'The diagram cannot be displayed',
    detail: message.slice(0, 1800),
    line,
  };
}
