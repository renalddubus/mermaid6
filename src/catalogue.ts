import { models } from './models';

export const categories = [
  'Process',
  'Software',
  'Organization',
  'Data',
  'Analysis',
  'Grammars',
] as const;
export type Category = (typeof categories)[number];
export type ColorProfile =
  'nodes' | 'actors' | 'pie' | 'sections' | 'branches' | 'journey' | 'code';
export type DiagramExample = {
  id: string;
  label: string;
  category: Category;
  description: string;
  syntax: string;
  source: string;
  colors: ColorProfile;
  note: string;
  experimental: boolean;
  docs: string;
};

function example(
  id: string,
  label: string,
  category: Category,
  description: string,
  syntax: string,
  source: string,
  colors: ColorProfile = 'code',
  note = 'Set diagram-specific colors in the Mermaid configuration.',
  docs = id,
  experimental = syntax.includes('beta'),
): DiagramExample {
  return {
    id,
    label,
    category,
    description,
    syntax,
    source,
    colors,
    note,
    experimental,
    docs: `https://mermaid.js.org/syntax/${docs}.html`,
  };
}

export const catalogue: DiagramExample[] = [
  example(
    'flow',
    'Flow',
    'Process',
    'Describe a path, a decision, and its alternatives.',
    'flowchart',
    models[0].source,
    'nodes',
    'Use classDef and style to distinguish steps.',
    'flowchart',
    false,
  ),
  example(
    'sequence',
    'Sequence',
    'Software',
    'Show who communicates with whom, and in what order.',
    'sequenceDiagram',
    models[1].source,
    'actors',
    'These colors apply to participants. Messages and notes have their own variables.',
    'sequenceDiagram',
    false,
  ),
  example(
    'state',
    'States',
    'Process',
    'Follow the life cycle of an object or task.',
    'stateDiagram-v2',
    models[2].source,
    'nodes',
    'Use classDef to color states; start and end states remain specific.',
    'stateDiagram',
    false,
  ),
  example(
    'class',
    'Classes',
    'Software',
    'Describe objects, their properties, and relationships.',
    'classDiagram',
    `classDiagram
  class Diagram {
    +String title
    +String source
    +export()
  }
  class Folder {
    +String name
  }
  Folder "1" o-- "*" Diagram`,
    'nodes',
    'Class styles complement the global theme.',
    'classDiagram',
  ),
  example(
    'er',
    'Entities and relationships',
    'Software',
    'Organize data and its cardinalities.',
    'erDiagram',
    `erDiagram
  FOLDER ||--o{ DIAGRAM : contains
  FOLDER {
    int id PK
    string name
  }
  DIAGRAM {
    int id PK
    string title
    int folder_id FK
  }`,
    'nodes',
    'Alternating attribute rows use their own colors.',
    'entityRelationshipDiagram',
  ),
  example(
    'gantt',
    'Gantt',
    'Organization',
    'Plan tasks and their dependencies over time.',
    'gantt',
    `gantt
  title Prepare a release
  dateFormat YYYY-MM-DD
  axisFormat %d/%m
  section Design
    Scope :done, a, 2026-10-01, 3d
    Prototype :active, b, after a, 4d
  section Delivery
    Tests :c, after b, 3d
    Release :milestone, after c, 0d`,
    'code',
    'The done, active, and crit statuses use taskBkgColor, activeTaskBkgColor, and critBkgColor.',
  ),
  example(
    'journey',
    'User journey',
    'Organization',
    'Compare the stages of an experience and how they feel.',
    'journey',
    `journey
  title Create a first diagram
  section Discovery
    Choose an example: 5: Visitor
    Understand the code: 3: Visitor
  section Creation
    Customize: 4: Author
    Share: 5: Author
  section Return
    Improve: 4: Author`,
    'journey',
    'Tasks use fillType0, fillType1…; actors and headings have a separate palette.',
    'userJourney',
  ),
  example(
    'git',
    'Git branches',
    'Software',
    'Explain a branching and merging strategy.',
    'gitGraph',
    `gitGraph
  commit id: "Initial"
  branch feature
  checkout feature
  commit id: "Editor"
  checkout main
  merge feature
  commit id: "Version"`,
    'code',
    'Branches use git0, git1… in themeVariables.',
    'gitgraph',
  ),
  example(
    'mindmap',
    'Mind map',
    'Organization',
    'Expand an idea into topics and subtopics.',
    'mindmap',
    `mindmap
  root((My project))
    Design
      Needs
      Mockups
    Build
      Editor
      Exports
    Share
      Documentation
      Community`,
    'branches',
    'Branches follow the cScale palette; external icons are not loaded.',
  ),
  example(
    'timeline',
    'Timeline',
    'Organization',
    'Tell a story through a few milestones.',
    'timeline',
    `timeline
  title An idea becomes a product
  section Imagine
    January : Needs : First sketches
    February : Prototype
  section Build
    March : Editor
    April : First release
  section Improve
    May : User feedback`,
    'sections',
    'Each section uses a cScale palette color.',
  ),
  example(
    'pie',
    'Pie chart',
    'Data',
    'Show how a whole is divided.',
    'pie',
    `pie showData
  title Time allocation
  "Design" : 25
  "Development" : 50
  "Tests" : 25`,
    'pie',
    'The colors below correspond to the first three slices.',
  ),
  example(
    'quadrant',
    'Quadrants',
    'Analysis',
    'Position ideas using two criteria.',
    'quadrantChart',
    `quadrantChart
  title Choose the next features
  x-axis Low effort --> High effort
  y-axis Low impact --> High impact
  quadrant-1 Plan
  quadrant-2 Prioritize
  quadrant-3 Later
  quadrant-4 Rethink
  Exports: [0.3, 0.85]
  Collaboration: [0.85, 0.9]
  Shortcuts: [0.2, 0.4]`,
    'code',
    'Set quadrant1Fill through quadrant4Fill and point styles in the code.',
    'quadrantChart',
  ),
  example(
    'xy',
    'Lines and bars',
    'Data',
    'Compare values or follow a trend.',
    'xychart-beta',
    `xychart-beta
  title "Diagrams created"
  x-axis [Mon, Tue, Wed, Thu, Fri]
  y-axis "Count" 0 --> 50
  bar [12, 25, 18, 40, 32]
  line [10, 20, 25, 30, 35]`,
    'code',
    'Set the palette with themeVariables.xychart.plotColorPalette.',
    'xyChart',
  ),
  example(
    'sankey',
    'Sankey',
    'Data',
    'Visualize quantities flowing between different areas.',
    'sankey-beta',
    `sankey-beta
Budget,Product,60
Budget,Support,40
Product,Workshop,35
Product,Exports,25
Support,Documentation,40`,
    'code',
    'Use ASCII labels: this parser rejects some accents. The sankey configuration controls link colors.',
    'sankey',
  ),
  example(
    'block',
    'Blocks',
    'Software',
    'Explicitly arrange system components.',
    'block-beta',
    `block-beta
  columns 3
  a["Interface"] b["Rendering"] c["File"]
  a --> b
  b --> c`,
    'nodes',
    'Use style and classDef to color individual blocks.',
    'block',
  ),
  example(
    'requirement',
    'Requirements',
    'Software',
    'Connect a requirement to the element that satisfies it.',
    'requirementDiagram',
    `requirementDiagram
  requirement local {
    id: R1
    text: Render in the browser
    risk: low
    verifymethod: test
  }
  element editor {
    type: application
  }
  editor - satisfies -> local`,
    'nodes',
    'Requirements and elements can have their own styles.',
    'requirementDiagram',
  ),
  example(
    'kanban',
    'Kanban',
    'Organization',
    'Distribute work across the stages of a board.',
    'kanban',
    `kanban
  todo[To do]
    import[Import a file]
    export[Export an image]
  doing[In progress]
    catalogue[Catalogue]
  done[Done]
    editor[Editor]`,
    'code',
    'The theme colors the columns. Links to issue trackers are disabled.',
    'kanban',
    true,
  ),
  example(
    'packet',
    'Network packets',
    'Software',
    'Describe the position and size of binary fields.',
    'packet-beta',
    `packet-beta
  0-7: "Version"
  8-15: "Type"
  16-31: "Length"
  32-63: "Data"`,
    'code',
    'Configure fields with packetBlockFill, packetBlockStroke, and packetLabelColor.',
    'packet',
  ),
  example(
    'architecture',
    'Architecture',
    'Software',
    'Connect services, databases, and groups.',
    'architecture-beta',
    `architecture-beta
  group app(cloud)[Application]
  service api(server)[API] in app
  service db(database)[Database] in app
  service disk(disk)[Files] in app
  api:R -- L:db
  api:B -- T:disk`,
    'code',
    'Only built-in icons are available; no external packs are loaded.',
    'architecture',
  ),
  example(
    'c4',
    'C4 — context',
    'Software',
    'Place a system in the context of its users.',
    'C4Context',
    `C4Context
  title Mermaid6 context
  Person(author, "Author", "Creates diagrams")
  System(editor, "Mermaid6", "Editing in the browser")
  Rel(author, editor, "Uses")`,
    'code',
    'C4 is experimental. Use UpdateElementStyle; Container, Component, Dynamic, and Deployment variants are not yet validated.',
    'c4',
    true,
  ),
  example(
    'radar',
    'Radar',
    'Data',
    'Compare profiles along the same axes.',
    'radar-beta',
    `radar-beta
  axis speed["Speed"], clarity["Clarity"], comfort["Comfort"]
  curve current["Current"]{7, 8, 6}
  curve target["Target"]{9, 9, 9}
  min 0
  max 10`,
    'code',
    'Curves use radarCurveColors in themeVariables.',
    'radar',
  ),
  example(
    'treemap',
    'Treemap',
    'Data',
    'Compare the sizes of nested categories.',
    'treemap-beta',
    `treemap-beta
"Application"
  "Editor": 50
  "Catalogue": 30
"Documentation"
  "Guides": 15
  "Examples": 5`,
    'code',
    'Set section and leaf styles in the code.',
    'treemap',
  ),
  example(
    'venn',
    'Venn',
    'Analysis',
    'Show what sets have in common.',
    'venn-beta',
    `venn-beta
  title Find the right idea
  set Useful
  set Feasible
  union Useful,Feasible["To build"]`,
    'code',
    'Sets and intersections have their own style instructions.',
    'venn',
  ),
  example(
    'ishikawa',
    'Cause and effect',
    'Analysis',
    'Explore possible causes of a problem.',
    'ishikawa-beta',
    `ishikawa-beta
  Late delivery
  Organization
    Unclear goal
    Too many priorities
  Technical
    Late tests
    Blocked dependencies`,
    'code',
    'The branch palette is specific to the Ishikawa diagram.',
    'ishikawa',
  ),
  example(
    'wardley',
    'Wardley map',
    'Analysis',
    'Position a value chain along its evolution.',
    'wardley-beta',
    `wardley-beta
  title Share an idea
  anchor Author [0.95, 0.4]
  component Diagram [0.75, 0.5]
  component Editor [0.5, 0.65]
  component Browser [0.2, 0.9]
  Author -> Diagram
  Diagram -> Editor
  Editor -> Browser`,
    'code',
    'Coordinates represent visibility and evolution; the theme sets general colors.',
    'wardley',
  ),
  example(
    'cynefin',
    'Cynefin',
    'Analysis',
    'Adapt decisions to the nature of a situation.',
    'cynefin-beta',
    `cynefin-beta
  title Decide how to act
  clear
    "Follow a procedure"
  complicated
    "Seek expertise"
  complex
    "Test a hypothesis"
  chaotic
    "Stabilize the service"`,
    'code',
    'Each domain has dedicated theme colors.',
    'cynefin',
  ),
  example(
    'tree',
    'Directory tree',
    'Software',
    'Present the structure of a project or folder.',
    'treeView-beta',
    `treeView-beta
├── src/
│   ├── editor/
│   └── catalogue.ts
├── tests/
└── README.md`,
    'code',
    'Indentation and branch characters define the tree.',
    'treeView',
  ),
  example(
    'swimlane',
    'Swimlanes',
    'Process',
    'Assign process steps to their owners.',
    'swimlane-beta',
    `swimlane-beta LR
  subgraph Author
    A[Create]
    B[Review]
  end
  subgraph Reader
    C[Discover]
  end
  A --> B --> C`,
    'nodes',
    'Each subgraph becomes a lane; Mermaid styles distinguish the steps.',
    'swimlanes',
  ),
  example(
    'usecase',
    'Use cases',
    'Software',
    'Describe the actions available to users.',
    'usecase-beta',
    `usecase-beta
  direction LR
  actor Author("Author")
  systemBoundary Application[Mermaid6]
    Create("Create a diagram")
    Export("Download the source")
  end
  Author --> Create
  Author --> Export`,
    'nodes',
    'Boundaries cannot be nested; actors use built-in shapes.',
    'usecase',
  ),
  example(
    'event',
    'Events',
    'Process',
    'Describe the steps of an interaction with a system.',
    'eventmodeling',
    `eventmodeling
  tf 01 ui Editor
  tf 02 cmd CreateDiagram
  tf 03 evt DiagramCreated`,
    'code',
    'Screens, commands, and events use distinct semantic colors.',
    'eventmodeling',
    true,
  ),
  example(
    'agent',
    'Agents',
    'Process',
    'Describe the steps and tools of an agent.',
    'agentflow-beta',
    `agentflow-beta TB
  flow assistant["Assistant"]
    request["Request"]@{ shape: input }
    process["Analyze"]@{ shape: task }
    tool["Check"]@{ shape: tool }
    request --> process --> tool
  end`,
    'nodes',
    'Shapes indicate inputs, tasks, and tools; styles stay in the code.',
    'agentflow',
  ),
  example(
    'railroad',
    'Visual grammar',
    'Grammars',
    'Describe a rule with choices and repetitions.',
    'railroad-beta',
    `railroad-beta
  title An answer
  answer = choice(terminal("yes"), terminal("no")) ;`,
    'code',
    'Colors depend on the symbol type: terminal, reference, or connection.',
    'railroad',
  ),
  example(
    'ebnf',
    'EBNF grammar',
    'Grammars',
    'Visualize a grammar written in EBNF.',
    'railroad-ebnf-beta',
    `railroad-ebnf-beta
  title An answer
  answer = "yes" | "no" ;`,
    'code',
    'Diagrams represent the grammar; they do not validate user text.',
    'railroad',
  ),
  example(
    'abnf',
    'ABNF grammar',
    'Grammars',
    'Visualize protocol rules in ABNF format.',
    'railroad-abnf-beta',
    `railroad-abnf-beta
  title An answer
  answer = "yes" / "no" ;`,
    'code',
    'ABNF uses / for alternatives. Symbols have specific colors.',
    'railroad',
  ),
  example(
    'peg',
    'PEG grammar',
    'Grammars',
    'Visualize ordered choices in PEG format.',
    'railroad-peg-beta',
    `railroad-peg-beta
  title An answer
  answer <- "yes" / "no" ;`,
    'code',
    'PEG choices are ordered; the palette depends on the symbol type.',
    'railroad',
  ),
];

export function normalizeSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function exampleForSource(source: string) {
  const body = source
    .replace(/^\uFEFF/, '')
    .replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, '')
    .replace(/%%[^\n]*/g, '')
    .trimStart();
  return (
    catalogue.find(
      (item) =>
        body.startsWith(item.syntax) &&
        /[\s;]|^$/.test(body.slice(item.syntax.length, item.syntax.length + 1)),
    ) ?? (/^graph\s/.test(body) ? catalogue[0] : undefined)
  );
}
