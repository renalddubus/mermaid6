import {
  snippetCompletion,
  type Completion,
  type CompletionContext,
  type CompletionResult,
} from '@codemirror/autocomplete';
import { catalogue } from '../catalogue';
import type { CopyKey } from '../i18n/copy';

type Translate = (key: CopyKey) => string;
type Block = readonly [label: string, template: string];

const starters: Record<string, string> = {
  flowchart: 'flowchart ${LR}\n  ${A}[${Start}] --> ${B}[${Finish}]',
  sequenceDiagram:
    'sequenceDiagram\n  participant ${Alice}\n  participant ${Bob}\n  ${Alice}->>${Bob}: ${Message}',
  'stateDiagram-v2':
    'stateDiagram-v2\n  [*] --> ${Idle}\n  ${Idle} --> ${Active}: ${Start}\n  ${Active} --> [*]',
  classDiagram: 'classDiagram\n  class ${Example} {\n    +String ${name}\n  }',
  erDiagram: 'erDiagram\n  ${CUSTOMER} ||--o{ ${ORDER} : ${places}',
  gantt:
    'gantt\n  title ${Project}\n  dateFormat YYYY-MM-DD\n  section ${Tasks}\n  ${Task} :${task1}, ${2026-01-01}, ${7d}',
  mindmap: 'mindmap\n  root((${Topic}))\n    ${Idea}\n    ${Another idea}',
  timeline: 'timeline\n  title ${Milestones}\n  ${1:2026} : ${Launch}',
  pie: 'pie title ${Distribution}\n  "${First}" : ${1:60}\n  "${Second}" : ${2:40}',
};

const blocks: Record<string, readonly Block[]> = {
  flowchart: [
    ['node', '${A}[${Label}]'],
    ['edge', '${A} --> ${B}'],
    ['subgraph', 'subgraph ${Group}\n  ${A}[${Label}]\nend'],
    ['classDef', 'classDef ${highlight} fill:${#f9e0e6},stroke:${#d93655}'],
    ['class', 'class ${A} ${highlight}'],
    ['style', 'style ${A} fill:${#f9e0e6}'],
    ['direction', 'direction ${LR}'],
  ],
  sequenceDiagram: [
    ['participant', 'participant ${Alice}'],
    ['actor', 'actor ${User}'],
    ['message', '${Alice}->>${Bob}: ${Message}'],
    ['Note', 'Note over ${Alice},${Bob}: ${Note}'],
    ['loop', 'loop ${Condition}\n  ${Alice}->>${Bob}: ${Message}\nend'],
    [
      'alt',
      'alt ${Condition}\n  ${Alice}->>${Bob}: ${Message}\nelse ${Otherwise}\n  ${Bob}-->>${Alice}: ${Reply}\nend',
    ],
    ['opt', 'opt ${Condition}\n  ${Alice}->>${Bob}: ${Message}\nend'],
    [
      'par',
      'par ${First}\n  ${Alice}->>${Bob}: ${Message}\nand ${Second}\n  ${Bob}->>${Alice}: ${Reply}\nend',
    ],
    ['activate', 'activate ${Alice}'],
    ['deactivate', 'deactivate ${Alice}'],
  ],
  'stateDiagram-v2': [
    ['state', 'state "${Label}" as ${State}'],
    ['transition', '${Idle} --> ${Active}: ${Event}'],
    ['note', 'note right of ${State}\n  ${Note}\nend note'],
    ['classDef', 'classDef ${highlight} fill:${#f9e0e6}'],
    ['class', 'class ${State} ${highlight}'],
  ],
  classDiagram: [
    ['class', 'class ${Example} {\n  +String ${name}\n}'],
    ['relation', '${Parent} <|-- ${Child}'],
    ['namespace', 'namespace ${Group} {\n  class ${Example}\n}'],
  ],
  erDiagram: [
    ['entity', '${ENTITY} {\n  string ${name}\n}'],
    ['relation', '${CUSTOMER} ||--o{ ${ORDER} : ${places}'],
  ],
  gantt: [
    ['title', 'title ${Project}'],
    ['dateFormat', 'dateFormat ${YYYY-MM-DD}'],
    ['section', 'section ${Tasks}'],
    ['task', '${Task} :${task1}, ${2026-01-01}, ${7d}'],
  ],
  timeline: [
    ['title', 'title ${Milestones}'],
    ['section', 'section ${Period}'],
  ],
  pie: [['title', 'title ${Distribution}']],
};

function documentBody(source: string) {
  const frontmatter = source.match(/^\uFEFF?---\r?\n/);
  if (!frontmatter) return { body: source.replace(/^\uFEFF/, ' '), start: 0 };
  const closing = source.slice(frontmatter[0].length).match(/^---\s*$/m);
  if (!closing) return { body: '', start: source.length };
  const start = frontmatter[0].length + closing.index! + closing[0].length;
  // Keep offsets stable so the cursor can be compared to the declaration.
  return {
    body: source.slice(0, start).replace(/[^\n]/g, ' ') + source.slice(start),
    start,
  };
}

function insideText(prefix: string, shapes: boolean) {
  let quote = '';
  const closing: string[] = [];
  for (let i = 0; i < prefix.length; i++) {
    const char = prefix[i];
    if (char === '\\') {
      i++;
      continue;
    }
    if (quote) {
      if (char === quote) quote = '';
    } else if (char === '"' || char === "'") quote = char;
    else if (prefix.slice(i, i + 2) === '%%') return true;
    else if (shapes && char === '|') {
      if (closing.at(-1) === '|') closing.pop();
      else closing.push('|');
    } else if (shapes && '[({'.includes(char))
      closing.push({ '[': ']', '(': ')', '{': '}' }[char]!);
    else if (char === closing.at(-1)) closing.pop();
  }
  return !!quote || closing.length > 0;
}

export function diagramIdentifiers(source: string, type: string): string[] {
  const ids = new Set<string>();
  const add = (id?: string) => {
    if (id && /^[A-Za-z_][\w-]*$/.test(id)) ids.add(id);
  };
  for (const raw of documentBody(source).body.split('\n')) {
    const line = raw.replace(/%%.*$/, '').trim();
    if (type === 'sequenceDiagram') {
      add(line.match(/^(?:participant|actor)\s+(\w+)/)?.[1]);
      const message = line.match(/^(\w+)\s*[-.<>()]+[+-]?\s*(\w+)\s*:/);
      add(message?.[1]);
      add(message?.[2]);
    } else if (type === 'stateDiagram-v2') {
      add(line.match(/^state\s+(?:"[^"]*"\s+as\s+)?(\w+)/)?.[1]);
      const transition = line.match(/^(\w+|\[\*\])\s*-->\s*(\w+|\[\*\])/);
      add(transition?.[1]);
      add(transition?.[2]);
    } else if (type === 'classDiagram') {
      add(line.match(/^class\s+(\w+)/)?.[1]);
      const relation = line.match(
        /^(\w+)\s*(?:"[^"]*"\s*)?[<|o*+.-]+\s*(?:"[^"]*"\s*)?(\w+)/,
      );
      add(relation?.[1]);
      add(relation?.[2]);
    } else if (type === 'erDiagram') {
      add(line.match(/^(\w+)\s*\{/)?.[1]);
      const relation = line.match(/^(\w+)\s+[|o{}+.-]+\s+(\w+)\s*:/);
      add(relation?.[1]);
      add(relation?.[2]);
    } else if (type === 'flowchart') {
      if (
        /^(?:flowchart|graph|direction|classDef|class|style|click|linkStyle|end|accTitle|accDescr)\b/.test(
          line,
        )
      )
        continue;
      if (/^subgraph\b/.test(line)) {
        add(line.match(/^subgraph\s+(\w+)\s*\[/)?.[1]);
        continue;
      }
      let clean = '';
      let quote = '';
      const closing: string[] = [];
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '\\' && (quote || closing.length)) {
          i++;
          continue;
        }
        if (quote) {
          if (char === quote) quote = '';
        } else if (char === '"' || char === "'") quote = char;
        else if (char === closing.at(-1)) closing.pop();
        else if (closing.at(-1) === '|') continue;
        else if ('[({|'.includes(char))
          closing.push({ '[': ']', '(': ')', '{': '}', '|': '|' }[char]!);
        else if (!closing.length && !(char === '@' && line[i + 1] === '{'))
          clean += char;
      }
      for (const statement of clean.split(';')) {
        for (const part of statement.split(/(?:<)?[-=.]{2,}(?:[>ox])?|&/))
          add(part.trim().match(/^([A-Za-z_][\w-]*)$/)?.[1]);
      }
    }
  }
  return [...ids];
}

export function mermaidCompletions(t: Translate) {
  return (context: CompletionContext): CompletionResult | null => {
    const source = context.state.doc.toString();
    const { body, start } = documentBody(source);
    const declaration = /^(?!\s*%%)[ \t]*(\S+)[^\n]*/m.exec(body);
    const line = context.state.doc.lineAt(context.pos);
    const prefix = line.text.slice(0, context.pos - line.from);
    if (context.pos < start || (!body && start > 0)) return null;
    const syntax =
      declaration?.[1] === 'graph' ? 'flowchart' : declaration?.[1];
    if (insideText(prefix, syntax === 'flowchart')) return null;
    const word = context.matchBefore(/[A-Za-z_][\w-]*$/);
    if (!word && !context.explicit) return null;
    const from = word?.from ?? context.pos;
    const before = prefix.slice(0, from - line.from).trim();
    let options: Completion[] = [];
    const atDeclaration =
      !declaration || context.pos <= declaration.index + declaration[0].length;
    if (atDeclaration && !before) {
      const onlyDeclaration =
        !body
          .slice((declaration?.index ?? 0) + (declaration?.[0].length ?? 0))
          .trim() && !line.text.slice(context.pos - line.from).trim();
      options = [
        ...new Map(catalogue.map((item) => [item.syntax, item])).values(),
      ].map((item) => {
        const completion = {
          label: item.syntax,
          detail: t('Diagram type'),
          info: t(item.description as CopyKey),
          type: 'keyword',
        };
        return onlyDeclaration && starters[item.syntax]
          ? snippetCompletion(starters[item.syntax], completion)
          : completion;
      });
    } else if (
      syntax === 'flowchart' &&
      /^(?:flowchart|graph|direction)$/.test(before)
    ) {
      options = ['LR', 'RL', 'TB', 'TD', 'BT'].map((label) => ({
        label,
        detail: t('Direction'),
        type: 'enum',
      }));
    } else if (syntax && !atDeclaration) {
      if (
        /^(?:sequenceDiagram|stateDiagram-v2|erDiagram)$/.test(syntax) &&
        prefix.includes(':')
      )
        return null;
      if (!before) {
        options = (blocks[syntax] ?? []).map(([label, template]) =>
          snippetCompletion(template, {
            label,
            detail: t('Insert a Mermaid block'),
            type: 'keyword',
          }),
        );
        if (
          ['flowchart', 'sequenceDiagram', 'stateDiagram-v2'].includes(syntax)
        )
          options.push({ label: 'end', detail: t('Keyword'), type: 'keyword' });
      }
      const ids = diagramIdentifiers(source, syntax);
      options.push(
        ...ids
          .filter((label) => label !== word?.text)
          .map((label) => ({
            label,
            detail: t('Existing identifier'),
            type: 'variable',
          })),
      );
    }
    return options.length ? { from, options, validFor: /^[\w-]*$/ } : null;
  };
}
