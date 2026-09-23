import { Document, isMap, parseDocument } from 'yaml';

export const themes = [
  { value: 'base', label: 'Personnalisé' },
  { value: 'default', label: 'Clair' },
  { value: 'dark', label: 'Sombre' },
  { value: 'neutral', label: 'Neutre' },
  { value: 'forest', label: 'Forêt' },
];

function frontmatter(source: string) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match && source.startsWith('---'))
    throw new Error(
      'Fermez la configuration YAML avec une ligne « --- » avant de modifier le thème.',
    );
  const document = match
    ? parseDocument(match[1], { uniqueKeys: true })
    : new Document({});
  if (document.errors.length || !isMap(document.contents))
    throw new Error(
      'Corrigez la configuration YAML avant de modifier le thème.',
    );
  if (document.has('config') && !isMap(document.get('config')))
    throw new Error('La configuration doit être un objet YAML.');
  const variables = document.getIn(['config', 'themeVariables']);
  if (variables !== undefined && !isMap(variables))
    throw new Error('themeVariables doit être un objet YAML.');
  return { document, body: match ? source.slice(match[0].length) : source };
}

export function readAppearance(source: string) {
  try {
    const { document } = frontmatter(source);
    const hex = (name: string, fallback: string) => {
      const value = document.getIn(['config', 'themeVariables', name]);
      return typeof value === 'string' && /^#[\da-f]{6}$/i.test(value)
        ? value
        : fallback;
    };
    const theme = document.getIn(['config', 'theme']);
    return {
      theme:
        typeof theme === 'string' && themes.some((item) => item.value === theme)
          ? theme
          : 'default',
      primaryColor: hex('primaryColor', '#ffe7ed'),
      primaryBorderColor: hex('primaryBorderColor', '#d93655'),
      primaryTextColor: hex('primaryTextColor', '#292923'),
    };
  } catch {
    return {
      theme: 'default',
      primaryColor: '#ffe7ed',
      primaryBorderColor: '#d93655',
      primaryTextColor: '#292923',
    };
  }
}

export function changeAppearance(source: string, key: string, value: string) {
  const { document, body } = frontmatter(source);
  if (key === 'theme') document.setIn(['config', 'theme'], value);
  else {
    document.setIn(['config', 'theme'], 'base');
    document.setIn(['config', 'themeVariables', key], value);
  }
  return `---\n${document.toString()}---\n${body}`;
}
