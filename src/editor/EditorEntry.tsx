import { useEffect, useState } from 'react';
import { catalogue } from '../catalogue';
import { getSource, inks } from '../models';
import { readDraft, type Draft } from './drafts';
import EditorPage from './EditorPage';

function requestedDocument(): Draft {
  const params = new URLSearchParams(window.location.search);
  const model = catalogue.find((item) => item.id === params.get('example'));
  const ink = inks[Number(params.get('ink'))] ?? inks[0];
  return {
    source: getSource(model ?? catalogue[0], ink),
    name: 'mon-diagramme.mmd',
    origin: model ? `${model.id}:${ink.name}` : '',
    updatedAt: Date.now(),
  };
}

export default function EditorEntry() {
  const [requested] = useState(requestedDocument);
  const [initial, setInitial] = useState<Draft | null>(null);
  const [conflict, setConflict] = useState<Draft | null>(null);
  const [warning, setWarning] = useState('');
  const [restored, setRestored] = useState(false);
  useEffect(() => {
    let cancelled = false;
    void readDraft()
      .then((draft) => {
        if (cancelled) return;
        if (
          draft &&
          requested.origin &&
          draft.origin !== requested.origin &&
          draft.source !== requested.source
        )
          setConflict(draft);
        else {
          setInitial(
            draft ? { ...draft, origin: requested.origin } : requested,
          );
          setRestored(!!draft);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setInitial(requested);
          setWarning(
            'Stockage local indisponible ou brouillon illisible. Téléchargez votre source pour la conserver.',
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [requested]);
  if (initial)
    return (
      <EditorPage
        initial={initial}
        restored={restored}
        storageWarning={warning}
      />
    );
  return (
    <main className="draft-start">
      {conflict ? (
        <section>
          <h1>Un brouillon vous attend</h1>
          <p>
            « {conflict.name} » est déjà enregistré dans ce navigateur. Charger
            cet exemple le remplacera.
          </p>
          <div className="draft-start-actions">
            <button
              className="button primary"
              onClick={() => {
                setInitial({ ...conflict, origin: requested.origin });
                setRestored(true);
              }}
            >
              Reprendre mon brouillon
            </button>
            <button className="button" onClick={() => setInitial(requested)}>
              Remplacer par l’exemple
            </button>
          </div>
        </section>
      ) : (
        <p role="status">Recherche de votre brouillon…</p>
      )}
    </main>
  );
}
