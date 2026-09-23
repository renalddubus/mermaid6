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
  model: (typeof models)[number],
  ink: (typeof inks)[number],
) {
  return `---
config:
  theme: base
  themeVariables:
    primaryColor: '${ink.wash}'
    primaryTextColor: '#292923'
    primaryBorderColor: '${ink.color}'
    lineColor: '${ink.color}'
---
${model.source}
`;
}
