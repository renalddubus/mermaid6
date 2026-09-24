const SVG_NS = 'http://www.w3.org/2000/svg';

// A few Mermaid engines emit HTML even with htmlLabels=false. Convert only
// their text in an inert XML document; never insert this HTML into the page.
export function normalizeSvgLabels(svg: string, color: unknown) {
  const document = new DOMParser().parseFromString(svg, 'image/svg+xml');
  if (document.querySelector('parsererror'))
    throw new Error('The diagram could not be displayed.');
  const fill =
    typeof color === 'string' && /^#[\da-f]{3,8}$/i.test(color)
      ? color
      : '#292923';
  const canvas = window.document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (context) context.font = '16px Arial';
  for (const object of document.querySelectorAll('foreignObject')) {
    object
      .querySelectorAll('script, style, img, iframe, object')
      .forEach((element) => element.remove());
    object
      .querySelectorAll('br')
      .forEach((element) => element.replaceWith('\n'));
    const content = object.textContent?.trim() ?? '';
    const width = Number(object.getAttribute('width'));
    const height = Number(object.getAttribute('height'));
    const x = Number(object.getAttribute('x')) || 0;
    const y = Number(object.getAttribute('y')) || 0;
    if (
      !content ||
      !Number.isFinite(width) ||
      !Number.isFinite(height) ||
      width <= 0 ||
      height <= 0
    ) {
      object.remove();
      continue;
    }
    const lines: string[] = [];
    for (const paragraph of content.split('\n')) {
      let line = '';
      for (const word of paragraph.trim().split(/\s+/)) {
        const candidate = line ? `${line} ${word}` : word;
        if (line && context && context.measureText(candidate).width > width) {
          lines.push(line);
          line = word;
        } else line = candidate;
      }
      lines.push(line);
    }
    const text = document.createElementNS(SVG_NS, 'text');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'central');
    text.setAttribute('style', `fill: ${fill}; font: 16px Arial, sans-serif;`);
    if (object.hasAttribute('transform'))
      text.setAttribute('transform', object.getAttribute('transform')!);
    for (const [index, line] of lines.entries()) {
      const span = document.createElementNS(SVG_NS, 'tspan');
      span.setAttribute('x', String(x + width / 2));
      span.setAttribute(
        'y',
        String(y + height / 2 + (index - (lines.length - 1) / 2) * 19),
      );
      span.textContent = line;
      if (context && context.measureText(line).width > width) {
        span.setAttribute('textLength', String(width));
        span.setAttribute('lengthAdjust', 'spacingAndGlyphs');
      }
      text.append(span);
    }
    // Journey includes an SVG fallback in <switch>; keeping both duplicates it.
    if (object.parentElement?.localName === 'switch')
      object.parentElement.replaceWith(text);
    else object.replaceWith(text);
  }
  return new XMLSerializer().serializeToString(document.documentElement);
}
