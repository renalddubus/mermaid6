const MAX_SIDE = 16_384;
const MAX_PIXELS = 32_000_000;
export type ImageOptions = {
  format: 'svg' | 'png';
  scale: number;
  background: string | null;
};

function parseSvg(svg: string) {
  const parsed = new DOMParser().parseFromString(svg, 'image/svg+xml');
  if (
    parsed.querySelector('parsererror') ||
    parsed.documentElement.localName !== 'svg'
  )
    throw new Error('The preview cannot be exported.');
  return parsed.documentElement;
}
export function imageSize(svg: string, scale = 1) {
  const element = parseSvg(svg);
  const [x, y, width, height] = (element.getAttribute('viewBox') ?? '')
    .trim()
    .split(/[\s,]+/)
    .map(Number);
  if (
    ![x, y, width, height, scale].every(Number.isFinite) ||
    width <= 0 ||
    height <= 0 ||
    scale <= 0
  )
    throw new Error('The diagram dimensions are invalid.');
  return {
    x,
    y,
    width: Math.ceil(width * scale),
    height: Math.ceil(height * scale),
    viewWidth: width,
    viewHeight: height,
  };
}
export function pngSizeError(width: number, height: number) {
  return width > MAX_SIDE || height > MAX_SIDE || width * height > MAX_PIXELS
    ? 'The image is too large for PNG. Reduce the resolution or choose SVG (maximum 16,384 px per side and 32 million pixels).'
    : '';
}

export function standaloneSvg(svg: string, background: string | null) {
  const root = parseSvg(svg);
  const size = imageSize(svg);
  // Only local references are allowed in downloaded SVGs. Browser CSP does
  // not travel with a standalone file, so reject external CSS resources too.
  for (const element of [root, ...root.querySelectorAll('*')]) {
    for (const attribute of element.attributes) {
      if (attribute.localName === 'href' && !attribute.value.startsWith('#'))
        throw new Error('External resources cannot be exported.');
      if (attribute.localName === 'style') validateCss(attribute.value);
    }
    if (element.localName === 'style') validateCss(element.textContent ?? '');
  }
  root.setAttribute('width', String(size.width));
  root.setAttribute('height', String(size.height));
  root.setAttribute(
    'style',
    'max-width: none; background: transparent; font-family: Arial, sans-serif;',
  );
  if (background) {
    if (!/^#[\da-f]{6}$/i.test(background))
      throw new Error('The background color is invalid.');
    const rect = root.ownerDocument.createElementNS(
      'http://www.w3.org/2000/svg',
      'rect',
    );
    rect.setAttribute('x', String(size.x));
    rect.setAttribute('y', String(size.y));
    rect.setAttribute('width', String(size.viewWidth));
    rect.setAttribute('height', String(size.viewHeight));
    rect.setAttribute('style', `fill: ${background}; stroke: none;`);
    rect.setAttribute('data-export-background', 'true');
    root.insertBefore(rect, root.firstChild);
  }
  return new XMLSerializer().serializeToString(root);
}

function validateCss(value: string) {
  if (/@import|@font-face|\\/i.test(value))
    throw new Error('This style contains a resource that cannot be exported.');
  for (const match of value.matchAll(/url\s*\(([^)]*)\)/gi)) {
    if (
      !match[1]
        .trim()
        .replace(/^["']|["']$/g, '')
        .startsWith('#')
    )
      throw new Error('External resources cannot be exported.');
  }
}

function dataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Image preparation failed.'));
    reader.readAsDataURL(blob);
  });
}

export async function exportImage(svg: string, options: ImageOptions) {
  const standalone = standaloneSvg(svg, options.background);
  const blob = new Blob([standalone], { type: 'image/svg+xml;charset=utf-8' });
  if (options.format === 'svg') return blob;
  const size = imageSize(svg, options.scale);
  const issue = pngSizeError(size.width, size.height);
  if (issue) throw new Error(issue);
  await document.fonts.ready;
  const image = new Image();
  image.src = await dataUrl(blob);
  try {
    await image.decode();
  } catch {
    throw new Error(
      'Le navigateur ne peut pas convertir ce diagramme en PNG. Essayez le SVG.',
    );
  }
  const canvas = document.createElement('canvas');
  canvas.width = size.width;
  canvas.height = size.height;
  try {
    const context = canvas.getContext('2d');
    if (!context)
      throw new Error('The browser cannot create this image. Try SVG.');
    context.drawImage(image, 0, 0, size.width, size.height);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (result) =>
          result
            ? resolve(result)
            : reject(
                new Error('PNG conversion failed. Reduce the resolution.'),
              ),
        'image/png',
      ),
    );
  } finally {
    canvas.width = 0;
    canvas.height = 0;
  }
}

export function downloadImage(
  blob: Blob,
  sourceName: string,
  format: 'svg' | 'png',
) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${sourceName.replace(/\.mmd$/i, '') || 'diagram'}.${format}`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
