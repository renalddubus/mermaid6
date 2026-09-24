import { Document, isMap, parseDocument } from 'yaml';
import type { ColorProfile } from '../catalogue';

export type ColorField = { key: string; label: string; fallback: string };
export const colorFields: Record<ColorProfile, ColorField[]> = {
  nodes: [
    { key: 'primaryColor', label: 'Element background', fallback: '#ffe7ed' },
    {
      key: 'primaryBorderColor',
      label: 'Element border',
      fallback: '#d93655',
    },
    {
      key: 'primaryTextColor',
      label: 'Element text',
      fallback: '#292923',
    },
  ],
  actors: [
    { key: 'actorBkg', label: 'Participant background', fallback: '#ffe7ed' },
    {
      key: 'actorBorder',
      label: 'Participant border',
      fallback: '#d93655',
    },
    {
      key: 'actorTextColor',
      label: 'Participant text',
      fallback: '#292923',
    },
  ],
  pie: [
    { key: 'pie1', label: 'Slice 1', fallback: '#d93655' },
    { key: 'pie2', label: 'Slice 2', fallback: '#3158bc' },
    { key: 'pie3', label: 'Slice 3', fallback: '#28715b' },
  ],
  sections: [
    { key: 'cScale0', label: 'Section 1', fallback: '#ffe7ed' },
    { key: 'cScale1', label: 'Section 2', fallback: '#dde5f7' },
    { key: 'cScale2', label: 'Section 3', fallback: '#dce9df' },
  ],
  branches: [
    { key: 'cScale1', label: 'Branch 1', fallback: '#ffe7ed' },
    { key: 'cScale2', label: 'Branch 2', fallback: '#dde5f7' },
    { key: 'cScale3', label: 'Branch 3', fallback: '#dce9df' },
  ],
  journey: [
    { key: 'fillType0', label: 'Step 1', fallback: '#ffe7ed' },
    { key: 'fillType1', label: 'Step 2', fallback: '#dde5f7' },
    { key: 'fillType2', label: 'Step 3', fallback: '#dce9df' },
  ],
  code: [],
};

export const themes = [
  { value: 'base', label: 'Custom' },
  { value: 'default', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'forest', label: 'Forest' },
];

function frontmatter(source: string) {
  const prefix = source.startsWith('\uFEFF') ? '\uFEFF' : '';
  source = source.slice(prefix.length);
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match && source.startsWith('---'))
    throw new Error(
      'Close the YAML configuration with a “---” line before changing the theme.',
    );
  const document = match
    ? parseDocument(match[1], { uniqueKeys: true })
    : new Document({});
  if (document.errors.length || !isMap(document.contents))
    throw new Error('Fix the YAML configuration before changing the theme.');
  if (document.has('config') && !isMap(document.get('config')))
    throw new Error('The configuration must be a YAML object.');
  const variables = document.getIn(['config', 'themeVariables']);
  if (variables !== undefined && !isMap(variables))
    throw new Error('themeVariables must be a YAML object.');
  return {
    document,
    prefix,
    body: match ? source.slice(match[0].length) : source,
  };
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
  const { document, body, prefix } = frontmatter(source);
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
  return `${prefix}---\n${document.toString()}---\n${body}`;
}
