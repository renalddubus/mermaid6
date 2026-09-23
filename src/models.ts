export const inks = [
  { name: 'Corail', color: '#d93655', wash: '#ffe7ed' },
  { name: 'Outremer', color: '#3158bc', wash: '#dde5f7' },
  { name: 'Pin', color: '#28715b', wash: '#dce9df' },
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
    label: 'Faire son chemin',
    title: 'Rien n’est tout à fait linéaire.',
    description:
      'Une idée, quelques détours, et quelque chose qui prend forme.',
    syntax: 'flowchart',
    source: `flowchart LR
  A([Une idée]) --> B[La mettre à plat]
  B --> C{Ça tient debout ?}
  C -->|Oui| D[Donner forme]
  D --> E([Partager])
  C -->|Pas encore| F[Prendre du recul]
  F -.-> B`,
  },
  {
    id: 'sequence',
    label: 'Se répondre',
    title: 'Les bonnes idées circulent.',
    description:
      'Qui parle à qui ? Une conversation rend les choses plus claires.',
    syntax: 'sequenceDiagram',
    source: `sequenceDiagram
  participant A as Vous
  participant B as Une idée
  participant C as Le monde
  A->>B: Et si on essayait ?
  B-->>A: Pourquoi pas.
  A->>B: Une première version
  B->>C: À vous de jouer
  C-->>A: Et si on allait plus loin ?`,
  },
  {
    id: 'state',
    label: 'Changer d’état',
    title: 'Tout est en devenir.',
    description: 'Du premier jet au dernier détail, chaque étape compte.',
    syntax: 'stateDiagram-v2',
    source: `stateDiagram-v2
  state "Brouillon" as Draft
  state "En cours" as Active
  state "En pause" as Paused
  state "C’est prêt" as Done
  [*] --> Draft
  Draft --> Active: Se lancer
  Active --> Paused: Souffler
  Paused --> Active: Reprendre
  Active --> Done: Peaufiner
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
