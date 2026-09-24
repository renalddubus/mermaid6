export const inks = [
  { name: 'Coral', color: '#d93655', wash: '#ffe7ed' },
  { name: 'Ultramarine', color: '#3158bc', wash: '#dde5f7' },
  { name: 'Pine', color: '#28715b', wash: '#dce9df' },
  { name: 'Graphite', color: '#393936', wash: '#e1e0da' },
] as const;

export type DiagramKind = 'flow' | 'sequence' | 'state';

export const models: {
  id: DiagramKind;
  label: string;
  title: string;
  description: string;
  syntax: string;
  source: string;
}[] = [
  {
    id: 'flow',
    label: 'Find your way',
    title: 'Nothing is quite linear.',
    description: 'An idea, a few detours, and something taking shape.',
    syntax: 'flowchart',
    source: `flowchart LR
  A([An idea]) --> B[Lay it out]
  B --> C{Does it make sense?}
  C -->|Yes| D[Give it shape]
  D --> E([Share])
  C -->|Not yet| F[Step back]
  F -.-> B`,
  },
  {
    id: 'sequence',
    label: 'Talk to each other',
    title: 'Good ideas circulate.',
    description: 'Who talks to whom? A conversation makes things clearer.',
    syntax: 'sequenceDiagram',
    source: `sequenceDiagram
  participant A as You
  participant B as An idea
  participant C as The world
  A->>B: What if we tried?
  B-->>A: Why not.
  A->>B: A first version
  B->>C: Your turn
  C-->>A: What if we went further?`,
  },
  {
    id: 'state',
    label: 'Change state',
    title: 'Everything is becoming.',
    description: 'From the first draft to the last detail, every step counts.',
    syntax: 'stateDiagram-v2',
    source: `stateDiagram-v2
  state "Draft" as Draft
  state "In progress" as Active
  state "Paused" as Paused
  state "Ready" as Done
  [*] --> Draft
  Draft --> Active: Get started
  Active --> Paused: Take a breath
  Paused --> Active: Resume
  Active --> Done: Refine
  Done --> [*]`,
  },
];

export function getSource(
  model: { source: string; colors?: string },
  ink: (typeof inks)[number],
) {
  const palette =
    model.colors === 'actors'
      ? `
    actorBkg: '${ink.wash}'
    actorBorder: '${ink.color}'
    actorTextColor: '#292923'`
      : model.colors === 'pie'
        ? "\n    pie1: '#d93655'\n    pie2: '#3158bc'\n    pie3: '#28715b'"
        : model.colors === 'branches'
          ? "\n    cScale1: '#ffe7ed'\n    cScale2: '#dde5f7'\n    cScale3: '#dce9df'"
          : model.colors === 'journey'
            ? "\n    fillType0: '#ffe7ed'\n    fillType1: '#dde5f7'\n    fillType2: '#dce9df'"
            : model.colors === 'sections'
              ? "\n    cScale0: '#ffe7ed'\n    cScale1: '#dde5f7'\n    cScale2: '#dce9df'"
              : '';
  return `---
config:
  theme: base
  themeVariables:
    primaryColor: '${ink.wash}'
    primaryTextColor: '#292923'
    primaryBorderColor: '${ink.color}'
    lineColor: '${ink.color}'${palette}
---
${model.source}
`;
}
