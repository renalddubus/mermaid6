import { models } from './models';

export const categories = [
  'Processus',
  'Logiciel',
  'Organisation',
  'Données',
  'Analyse',
  'Grammaires',
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
  note = 'Les couleurs spécifiques se règlent dans la configuration Mermaid.',
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
    'Flux',
    'Processus',
    'Décrire un parcours, une décision et ses alternatives.',
    'flowchart',
    models[0].source,
    'nodes',
    'Utilisez classDef et style pour distinguer les étapes.',
    'flowchart',
    false,
  ),
  example(
    'sequence',
    'Séquence',
    'Logiciel',
    'Montrer qui échange avec qui, et dans quel ordre.',
    'sequenceDiagram',
    models[1].source,
    'actors',
    'Les couleurs concernent les participants. Les messages et notes ont leurs propres variables.',
    'sequenceDiagram',
    false,
  ),
  example(
    'state',
    'États',
    'Processus',
    'Suivre le cycle de vie d’un objet ou d’une tâche.',
    'stateDiagram-v2',
    models[2].source,
    'nodes',
    'classDef permet de colorer les états ; les états de début et fin restent spécifiques.',
    'stateDiagram',
    false,
  ),
  example(
    'class',
    'Classes',
    'Logiciel',
    'Décrire les objets, leurs propriétés et leurs relations.',
    'classDiagram',
    `classDiagram
  class Diagramme {
    +String titre
    +String source
    +exporter()
  }
  class Dossier {
    +String nom
  }
  Dossier "1" o-- "*" Diagramme`,
    'nodes',
    'Les styles par classe complètent le thème global.',
    'classDiagram',
  ),
  example(
    'er',
    'Entités et relations',
    'Logiciel',
    'Organiser les données et leurs cardinalités.',
    'erDiagram',
    `erDiagram
  DOSSIER ||--o{ DIAGRAMME : contient
  DOSSIER {
    int id PK
    string nom
  }
  DIAGRAMME {
    int id PK
    string titre
    int dossier_id FK
  }`,
    'nodes',
    'Les lignes alternées des attributs utilisent leurs propres couleurs.',
    'entityRelationshipDiagram',
  ),
  example(
    'gantt',
    'Gantt',
    'Organisation',
    'Planifier des tâches et leurs dépendances dans le temps.',
    'gantt',
    `gantt
  title Préparer une version
  dateFormat YYYY-MM-DD
  axisFormat %d/%m
  section Conception
    Cadrage :done, a, 2026-10-01, 3d
    Prototype :active, b, after a, 4d
  section Livraison
    Tests :c, after b, 3d
    Publication :milestone, after c, 0d`,
    'code',
    'Les statuts done, active et crit ont leurs propres couleurs : taskBkgColor, activeTaskBkgColor, critBkgColor.',
  ),
  example(
    'journey',
    'Parcours utilisateur',
    'Organisation',
    'Comparer les étapes d’une expérience et leur ressenti.',
    'journey',
    `journey
  title Créer un premier diagramme
  section Découverte
    Choisir un exemple: 5: Visiteur
    Comprendre le code: 3: Visiteur
  section Création
    Personnaliser: 4: Auteur
    Partager: 5: Auteur
  section Retour
    Améliorer: 4: Auteur`,
    'journey',
    'Les tâches utilisent fillType0, fillType1… ; les acteurs et en-têtes ont une palette distincte.',
    'userJourney',
  ),
  example(
    'git',
    'Branches Git',
    'Logiciel',
    'Expliquer une stratégie de branches et de fusion.',
    'gitGraph',
    `gitGraph
  commit id: "Initial"
  branch feature
  checkout feature
  commit id: "Éditeur"
  checkout main
  merge feature
  commit id: "Version"`,
    'code',
    'Les branches utilisent git0, git1… dans themeVariables.',
    'gitgraph',
  ),
  example(
    'mindmap',
    'Carte mentale',
    'Organisation',
    'Déployer une idée en thèmes et sous-thèmes.',
    'mindmap',
    `mindmap
  root((Mon projet))
    Concevoir
      Besoins
      Maquettes
    Construire
      Éditeur
      Exports
    Partager
      Documentation
      Communauté`,
    'branches',
    'Les branches suivent la palette cScale ; les icônes externes ne sont pas chargées.',
  ),
  example(
    'timeline',
    'Chronologie',
    'Organisation',
    'Raconter une évolution en quelques jalons.',
    'timeline',
    `timeline
  title Une idée devient un produit
  section Imaginer
    Janvier : Besoins : Premiers croquis
    Février : Prototype
  section Construire
    Mars : Éditeur
    Avril : Première version
  section Améliorer
    Mai : Retours utilisateurs`,
    'sections',
    'Chaque section utilise une couleur cScale de la palette.',
  ),
  example(
    'pie',
    'Camembert',
    'Données',
    'Montrer comment un ensemble se répartit.',
    'pie',
    `pie showData
  title Répartition du temps
  "Conception" : 25
  "Développement" : 50
  "Tests" : 25`,
    'pie',
    'Les couleurs ci-dessous correspondent aux trois premières parts.',
  ),
  example(
    'quadrant',
    'Quadrants',
    'Analyse',
    'Positionner des idées selon deux critères.',
    'quadrantChart',
    `quadrantChart
  title Choisir les prochaines fonctionnalités
  x-axis Effort faible --> Effort fort
  y-axis Impact faible --> Impact fort
  quadrant-1 Planifier
  quadrant-2 Prioriser
  quadrant-3 Plus tard
  quadrant-4 Repenser
  Exports: [0.3, 0.85]
  Collaboration: [0.85, 0.9]
  Raccourcis: [0.2, 0.4]`,
    'code',
    'Réglez quadrant1Fill à quadrant4Fill et les styles des points dans le code.',
    'quadrantChart',
  ),
  example(
    'xy',
    'Courbes et barres',
    'Données',
    'Comparer des valeurs ou suivre une tendance.',
    'xychart-beta',
    `xychart-beta
  title "Diagrammes créés"
  x-axis [Lun, Mar, Mer, Jeu, Ven]
  y-axis "Nombre" 0 --> 50
  bar [12, 25, 18, 40, 32]
  line [10, 20, 25, 30, 35]`,
    'code',
    'La palette se règle avec themeVariables.xychart.plotColorPalette.',
    'xyChart',
  ),
  example(
    'sankey',
    'Sankey',
    'Données',
    'Visualiser des quantités qui circulent entre plusieurs postes.',
    'sankey-beta',
    `sankey-beta
Budget,Produit,60
Budget,Support,40
Produit,Atelier,35
Produit,Exports,25
Support,Documentation,40`,
    'code',
    'Utilisez des libellés ASCII : ce parseur refuse certains accents. La configuration sankey contrôle la coloration des liens.',
    'sankey',
  ),
  example(
    'block',
    'Blocs',
    'Logiciel',
    'Disposer explicitement les composants d’un système.',
    'block-beta',
    `block-beta
  columns 3
  a["Interface"] b["Rendu"] c["Fichier"]
  a --> b
  b --> c`,
    'nodes',
    'Les instructions style et classDef permettent de colorer chaque bloc.',
    'block',
  ),
  example(
    'requirement',
    'Exigences',
    'Logiciel',
    'Relier une exigence à l’élément qui la satisfait.',
    'requirementDiagram',
    `requirementDiagram
  requirement local {
    id: R1
    text: Rendu dans le navigateur
    risk: low
    verifymethod: test
  }
  element editeur {
    type: application
  }
  editeur - satisfies -> local`,
    'nodes',
    'Les exigences et les éléments peuvent recevoir leurs propres styles.',
    'requirementDiagram',
  ),
  example(
    'kanban',
    'Kanban',
    'Organisation',
    'Répartir le travail entre les étapes d’un tableau.',
    'kanban',
    `kanban
  todo[À faire]
    import[Importer un fichier]
    export[Exporter une image]
  doing[En cours]
    catalogue[Catalogue]
  done[Terminé]
    editor[Éditeur]`,
    'code',
    'Le thème colore les colonnes. Les liens vers un outil de suivi restent désactivés.',
    'kanban',
    true,
  ),
  example(
    'packet',
    'Paquets réseau',
    'Logiciel',
    'Décrire la position et la taille de champs binaires.',
    'packet-beta',
    `packet-beta
  0-7: "Version"
  8-15: "Type"
  16-31: "Longueur"
  32-63: "Données"`,
    'code',
    'Les champs se configurent avec packetBlockFill, packetBlockStroke et packetLabelColor.',
    'packet',
  ),
  example(
    'architecture',
    'Architecture',
    'Logiciel',
    'Relier des services, des bases de données et des groupes.',
    'architecture-beta',
    `architecture-beta
  group app(cloud)[Application]
  service api(server)[API] in app
  service db(database)[Base] in app
  service disk(disk)[Fichiers] in app
  api:R -- L:db
  api:B -- T:disk`,
    'code',
    'Seules les icônes intégrées sont disponibles ; aucun pack externe n’est chargé.',
    'architecture',
  ),
  example(
    'c4',
    'C4 — contexte',
    'Logiciel',
    'Situer un système au milieu de ses utilisateurs.',
    'C4Context',
    `C4Context
  title Contexte de Mermaid6
  Person(author, "Auteur", "Crée des diagrammes")
  System(editor, "Mermaid6", "Édition dans le navigateur")
  Rel(author, editor, "Utilise")`,
    'code',
    'C4 est expérimental. Utilisez UpdateElementStyle ; les variantes Container, Component, Dynamic et Deployment restent à valider.',
    'c4',
    true,
  ),
  example(
    'radar',
    'Radar',
    'Données',
    'Comparer plusieurs profils sur les mêmes axes.',
    'radar-beta',
    `radar-beta
  axis vitesse["Vitesse"], clarte["Clarté"], confort["Confort"]
  curve actuel["Actuel"]{7, 8, 6}
  curve cible["Cible"]{9, 9, 9}
  min 0
  max 10`,
    'code',
    'Les courbes utilisent radarCurveColors dans themeVariables.',
    'radar',
  ),
  example(
    'treemap',
    'Carte proportionnelle',
    'Données',
    'Comparer les tailles de catégories imbriquées.',
    'treemap-beta',
    `treemap-beta
"Application"
  "Éditeur": 50
  "Catalogue": 30
"Documentation"
  "Guides": 15
  "Exemples": 5`,
    'code',
    'Les styles des sections et des feuilles se règlent dans le code.',
    'treemap',
  ),
  example(
    'venn',
    'Venn',
    'Analyse',
    'Montrer ce que plusieurs ensembles ont en commun.',
    'venn-beta',
    `venn-beta
  title Trouver la bonne idée
  set Utile
  set Faisable
  union Utile,Faisable["À construire"]`,
    'code',
    'Les ensembles et intersections ont leurs propres instructions de style.',
    'venn',
  ),
  example(
    'ishikawa',
    'Causes et effets',
    'Analyse',
    'Explorer les causes possibles d’un problème.',
    'ishikawa-beta',
    `ishikawa-beta
  Livraison en retard
  Organisation
    Objectif imprécis
    Trop de priorités
  Technique
    Tests tardifs
    Dépendances bloquées`,
    'code',
    'La palette des branches est spécifique au diagramme Ishikawa.',
    'ishikawa',
  ),
  example(
    'wardley',
    'Carte de Wardley',
    'Analyse',
    'Positionner une chaîne de valeur selon son évolution.',
    'wardley-beta',
    `wardley-beta
  title Partager une idée
  anchor Auteur [0.95, 0.4]
  component Diagramme [0.75, 0.5]
  component Editeur [0.5, 0.65]
  component Navigateur [0.2, 0.9]
  Auteur -> Diagramme
  Diagramme -> Editeur
  Editeur -> Navigateur`,
    'code',
    'Les coordonnées représentent visibilité et évolution ; le thème règle les couleurs générales.',
    'wardley',
  ),
  example(
    'cynefin',
    'Cynefin',
    'Analyse',
    'Adapter la décision à la nature d’une situation.',
    'cynefin-beta',
    `cynefin-beta
  title Décider comment agir
  clear
    "Appliquer une procédure"
  complicated
    "Demander une expertise"
  complex
    "Tester une hypothèse"
  chaotic
    "Stabiliser le service"`,
    'code',
    'Chaque domaine possède ses couleurs dédiées dans le thème.',
    'cynefin',
  ),
  example(
    'tree',
    'Arborescence',
    'Logiciel',
    'Présenter la structure d’un projet ou d’un dossier.',
    'treeView-beta',
    `treeView-beta
├── src/
│   ├── editor/
│   └── catalogue.ts
├── tests/
└── README.md`,
    'code',
    'L’indentation et les caractères de branche définissent l’arbre.',
    'treeView',
  ),
  example(
    'swimlane',
    'Couloirs',
    'Processus',
    'Répartir les étapes d’un processus entre les responsables.',
    'swimlane-beta',
    `swimlane-beta LR
  subgraph Auteur
    A[Créer]
    B[Relire]
  end
  subgraph Lecteur
    C[Découvrir]
  end
  A --> B --> C`,
    'nodes',
    'Chaque subgraph devient un couloir ; les styles Mermaid distinguent les étapes.',
    'swimlanes',
  ),
  example(
    'usecase',
    'Cas d’utilisation',
    'Logiciel',
    'Décrire les actions offertes aux utilisateurs.',
    'usecase-beta',
    `usecase-beta
  direction LR
  actor Auteur("Auteur")
  systemBoundary Application[Mermaid6]
    Creer("Créer un diagramme")
    Exporter("Télécharger la source")
  end
  Auteur --> Creer
  Auteur --> Exporter`,
    'nodes',
    'Les frontières ne peuvent pas être imbriquées ; les acteurs utilisent des formes intégrées.',
    'usecase',
  ),
  example(
    'event',
    'Événements',
    'Processus',
    'Raconter les étapes d’une interaction avec un système.',
    'eventmodeling',
    `eventmodeling
  tf 01 ui Editeur
  tf 02 cmd CreerDiagramme
  tf 03 evt DiagrammeCree`,
    'code',
    'Les écrans, commandes et événements ont des couleurs sémantiques distinctes.',
    'eventmodeling',
    true,
  ),
  example(
    'agent',
    'Agents',
    'Processus',
    'Décrire les étapes et outils d’un agent.',
    'agentflow-beta',
    `agentflow-beta TB
  flow assistant["Assistant"]
    demande["Demande"]@{ shape: input }
    traiter["Analyser"]@{ shape: task }
    outil["Vérifier"]@{ shape: tool }
    demande --> traiter --> outil
  end`,
    'nodes',
    'Les formes indiquent entrées, tâches et outils ; les styles restent dans le code.',
    'agentflow',
  ),
  example(
    'railroad',
    'Grammaire visuelle',
    'Grammaires',
    'Décrire une règle avec des choix et des répétitions.',
    'railroad-beta',
    `railroad-beta
  title Une réponse
  reponse = choice(terminal("oui"), terminal("non")) ;`,
    'code',
    'La couleur dépend du type de symbole : terminal, référence et liaison.',
    'railroad',
  ),
  example(
    'ebnf',
    'Grammaire EBNF',
    'Grammaires',
    'Visualiser une grammaire écrite en EBNF.',
    'railroad-ebnf-beta',
    `railroad-ebnf-beta
  title Une réponse
  reponse = "oui" | "non" ;`,
    'code',
    'Les diagrammes représentent la grammaire ; ils ne valident pas un texte utilisateur.',
    'railroad',
  ),
  example(
    'abnf',
    'Grammaire ABNF',
    'Grammaires',
    'Visualiser des règles de protocole au format ABNF.',
    'railroad-abnf-beta',
    `railroad-abnf-beta
  title Une réponse
  reponse = "oui" / "non" ;`,
    'code',
    'ABNF utilise / pour les alternatives. Les couleurs des symboles sont spécifiques.',
    'railroad',
  ),
  example(
    'peg',
    'Grammaire PEG',
    'Grammaires',
    'Visualiser des choix ordonnés au format PEG.',
    'railroad-peg-beta',
    `railroad-peg-beta
  title Une réponse
  reponse <- "oui" / "non" ;`,
    'code',
    'Les choix PEG sont ordonnés ; la palette dépend du type de symbole.',
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
