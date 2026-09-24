import { useEffect, useRef } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { Compartment, EditorState } from '@codemirror/state';
import { StreamLanguage } from '@codemirror/language';
import {
  closeSearchPanel,
  getSearchQuery,
  openSearchPanel,
  searchPanelOpen,
  SearchQuery,
  setSearchQuery,
} from '@codemirror/search';
import { usePreferences } from '../preferences';
import { copy } from '../i18n/copy';

const mermaidLanguage = StreamLanguage.define({
  token(stream) {
    if (stream.eatSpace()) return null;
    if (stream.match('%%')) {
      stream.skipToEnd();
      return 'comment';
    }
    if (stream.match(/"[^"\n]*"|'[^'\n]*'/)) return 'string';
    if (
      stream.match(
        /\b(flowchart|graph|sequenceDiagram|stateDiagram-v2|classDiagram|erDiagram|gantt|pie|mindmap|timeline|participant|state|classDef|class|style|end|subgraph|config|theme|themeVariables)\b/,
      )
    )
      return 'keyword';
    if (stream.match(/--?>|==>|-\.->|->>|-->>/)) return 'operator';
    if (stream.match(/#[\da-fA-F]{6}\b|\b\d+\b/)) return 'number';
    stream.next();
    return null;
  },
});

export default function CodeEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { t, tx } = usePreferences();
  const localization = useRef(new Compartment());
  const container = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const initial = useRef(value);
  const syncing = useRef(false);
  const callback = useRef(onChange);
  useEffect(() => {
    callback.current = onChange;
  }, [onChange]);
  useEffect(() => {
    if (!container.current) return;
    const editor = new EditorView({
      parent: container.current,
      state: EditorState.create({
        doc: initial.current,
        extensions: [
          basicSetup,
          mermaidLanguage,
          EditorView.lineWrapping,
          localization.current.of([]),
          EditorView.updateListener.of((update) => {
            if (update.docChanged && !syncing.current)
              callback.current(update.state.doc.toString());
          }),
        ],
      }),
    });
    view.current = editor;
    return () => {
      editor.destroy();
      view.current = null;
    };
  }, []);

  useEffect(() => {
    const editor = view.current;
    if (!editor) return;
    const searchOpen = searchPanelOpen(editor.state);
    const currentQuery = getSearchQuery(editor.state);
    // Input can change before CodeMirror's keyup/change handler commits it.
    const searchQuery = new SearchQuery({
      ...currentQuery,
      search:
        editor.dom.querySelector<HTMLInputElement>('.cm-search [name="search"]')
          ?.value ?? currentQuery.search,
      replace:
        editor.dom.querySelector<HTMLInputElement>(
          '.cm-search [name="replace"]',
        )?.value ?? currentQuery.replace,
    });
    const focused = document.activeElement;
    const inputName =
      focused instanceof HTMLInputElement && editor.dom.contains(focused)
        ? focused.name
        : null;
    const inputSelection =
      focused instanceof HTMLInputElement
        ? ([focused.selectionStart, focused.selectionEnd] as const)
        : null;
    editor.dispatch({
      effects: localization.current.reconfigure([
        EditorState.phrases.of(
          Object.fromEntries(Object.keys(copy).map((key) => [key, tx(key)])),
        ),
        EditorView.contentAttributes.of({
          'aria-label': t('Mermaid code'),
          'aria-describedby': 'code-help',
          spellcheck: 'false',
        }),
      ]),
    });
    // The stock search panel caches translated DOM. Reopen it with the same
    // query after a locale change; the document and undo state stay intact.
    if (searchOpen) {
      closeSearchPanel(editor);
      openSearchPanel(editor);
      editor.dispatch({ effects: setSearchQuery.of(searchQuery) });
      if (inputName) {
        const field = editor.dom.querySelector<HTMLInputElement>(
          `input[name="${inputName}"]`,
        );
        field?.focus();
        if (field && inputSelection?.[0] != null && inputSelection[1] != null)
          field.setSelectionRange(...(inputSelection as [number, number]));
      } else if (focused instanceof HTMLElement) focused.focus();
    }
  }, [t, tx]);
  useEffect(() => {
    const editor = view.current;
    if (
      editor &&
      editor.state.doc.toString() !== value.replace(/\r\n?/g, '\n')
    ) {
      syncing.current = true;
      editor.dispatch({
        changes: { from: 0, to: editor.state.doc.length, insert: value },
      });
      syncing.current = false;
    }
  }, [value]);
  return <div className="code-editor" ref={container} />;
}
