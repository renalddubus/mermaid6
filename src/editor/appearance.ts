import { Document, isMap, parseDocument } from 'yaml';
import type { ColorProfile } from '../catalogue';

export type ColorField = { key: string; label: string; fallback: string };
export const colorFields: Record<ColorProfile, ColorField[]> = {
  nodes: [
    { key: 'primaryColor', label: 'Fond des éléments', fallback: '#ffe7ed' },
    {
      key: 'primaryBorderColor',
      label: 'Contour des éléments',
      fallback: '#d93655',
    },
    {
      key: 'primaryTextColor',
      label: 'Texte des éléments',
      fallback: '#292923',
    },
  ],
  actors: [
    { key: 'actorBkg', label: 'Fond des participants', fallback: '#ffe7ed' },
    {
      key: 'actorBorder',
      label: 'Contour des participants',
      fallback: '#d93655',
    },
    {
      key: 'actorTextColor',
      label: 'Texte des participants',
      fallback: '#292923',
    },
  ],
  pie: [
    { key: 'pie1', label: 'Part 1', fallback: '#d93655' },
    { key: 'pie2', label: 'Part 2', fallback: '#3158bc' },
    { key: 'pie3', label: 'Part 3', fallback: '#28715b' },
  ],
  sections: [
    { key: 'cScale0', label: 'Section 1', fallback: '#ffe7ed' },
    { key: 'cScale1', label: 'Section 2', fallback: '#dde5f7' },
    { key: 'cScale2', label: 'Section 3', fallback: '#dce9df' },
  ],
  branches: [
    { key: 'cScale1', label: 'Branche 1', fallback: '#ffe7ed' },
    { key: 'cScale2', label: 'Branche 2', fallback: '#dde5f7' },
    { key: 'cScale3', label: 'Branche 3', fallback: '#dce9df' },
  ],
  journey: [
    { key: 'fillType0', label: 'Étape 1', fallback: '#ffe7ed' },
    { key: 'fillType1', label: 'Étape 2', fallback: '#dde5f7' },
    { key: 'fillType2', label: 'Étape 3', fallback: '#dce9df' },
  ],
  code: [],
};

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

export function readAppearance(
  source: string,
  fields: ColorField[] = colorFields.nodes,
) {
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
      colors: Object.fromEntries(
        fields.map((field) => [field.key, hex(field.key, field.fallback)]),
      ),
    };
  } catch {
    return {
      theme: 'default',
      colors: Object.fromEntries(
        fields.map((field) => [field.key, field.fallback]),
      ),
    };
  }
}

export function changeAppearance(
  source: string,
  key: string,
  value: string,
  fields: ColorField[] = colorFields.nodes,
) {
  const { document, body } = frontmatter(source);
  if (key === 'theme') {
    document.setIn(['config', 'theme'], value);
    if (value === 'base')
      for (const field of fields) {
        const path = ['config', 'themeVariables', field.key];
        if (!document.hasIn(path)) document.setIn(path, field.fallback);
      }
  } else {
    document.setIn(['config', 'theme'], 'base');
    document.setIn(['config', 'themeVariables', key], value);
    if (key === 'primaryBorderColor')
      document.setIn(['config', 'themeVariables', 'nodeBorder'], value);
  }
  return `---\n${document.toString()}---\n${body}`;
}
