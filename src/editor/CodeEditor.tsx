import { useEffect, useRef } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { StreamLanguage } from '@codemirror/language';

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
          EditorView.contentAttributes.of({
            'aria-label': 'Code Mermaid',
            'aria-describedby': 'code-help',
            spellcheck: 'false',
          }),
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
