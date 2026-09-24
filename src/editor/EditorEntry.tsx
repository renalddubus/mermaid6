import { useEffect, useState } from 'react';
import { catalogue } from '../catalogue';
import { getSource, inks } from '../models';
import { readDraft, type Draft } from './drafts';
import EditorPage from './EditorPage';
import { usePreferences } from '../preferences';
import { translateText } from '../i18n/copy';

function requestedDocument(): Draft {
  const params = new URLSearchParams(window.location.search);
  const model = catalogue.find((item) => item.id === params.get('example'));
  const ink = inks[Number(params.get('ink'))] ?? inks[0];
  return {
    source: getSource(model ?? catalogue[0], ink),
    name: 'diagram.mmd',
    // Draft origins predate i18n. Retain their legacy ink names in storage.
    origin: model ? `${model.id}:${translateText('fr', ink.name)}` : '',
    updatedAt: Date.now(),
  };
}

export default function EditorEntry() {
  const { t } = usePreferences();
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
            'Local storage is unavailable or the draft is unreadable. Download your source to keep it.',
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
          <h1>{t('A draft is waiting for you')}</h1>
          <p>
            {t(
              '“{name}” is already saved in this browser. Loading this example will replace it.',
              { name: conflict.name },
            )}
          </p>
          <div className="draft-start-actions">
            <button
              className="button primary"
              onClick={() => {
                setInitial({ ...conflict, origin: requested.origin });
                setRestored(true);
              }}
            >
              {t('Resume my draft')}
            </button>
            <button className="button" onClick={() => setInitial(requested)}>
              {t('Replace with example')}
            </button>
          </div>
        </section>
      ) : (
        <p role="status">{t('Looking for your draft…')}</p>
      )}
    </main>
  );
}
