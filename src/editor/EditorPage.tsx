import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import Icon from '../components/Icon';
import { getSource, inks } from '../models';
import {
  catalogue,
  categories,
  exampleForSource,
  type DiagramExample,
} from '../catalogue';
import CatalogueDialog from '../components/CatalogueDialog';
import CodeEditor from './CodeEditor';
import {
  changeAppearance,
  readAppearance,
  themes,
  colorFields,
} from './appearance';
import { describeError, MAX_SOURCE_LENGTH, renderDiagram } from './render';
import { writeDraft, type Draft } from './drafts';
import { importSource } from './importSource';
import './editor.css';

type Failure = ReturnType<typeof describeError>;

export default function EditorPage({
  initial,
  restored,
  storageWarning,
}: {
  initial: Draft;
  restored: boolean;
  storageWarning: string;
}) {
  const [source, setSource] = useState(initial.source);
  const [name, setName] = useState(initial.name);
  const [persisted, setPersisted] = useState<{
    source: string;
    name: string;
  } | null>(null);
  const [storageError, setStorageError] = useState(storageWarning);
  const fileInput = useRef<HTMLInputElement>(null);
  const importSequence = useRef(0);
  const [saved, setSaved] = useState(source);
  const [lastValid, setLastValid] = useState({ source: '', svg: '' });
  const [attempt, setAttempt] = useState<{
    source: string;
    error: Failure | null;
  } | null>(null);
  const [zoom, setZoom] = useState(100);
  const [mobilePanel, setMobilePanel] = useState('code');
  const [notice, setNotice] = useState(
    restored ? 'Brouillon restauré depuis ce navigateur.' : '',
  );
  const [replacement, setReplacement] = useState<{
    label: string;
    source: string;
    name: string;
  } | null>(null);
  const [catalogueOpen, setCatalogueOpen] = useState(false);
  const sourceExample = exampleForSource(source);
  const fields = colorFields[sourceExample?.colors ?? 'code'];
  const appearance = readAppearance(source, fields);
  const dirty = source !== saved || restored;
  const locallySaved = persisted?.source === source && persisted?.name === name;
  const needsBackup = !locallySaved && source !== saved;
  const latestSource = useRef(source);
  useEffect(() => {
    latestSource.current = source;
  }, [source]);
  const current = lastValid.source === source;
  const error = attempt?.source === source ? attempt.error : null;
  const status = current
    ? 'Aperçu à jour'
    : error
      ? 'Erreur à corriger'
      : 'Mise à jour de l’aperçu…';

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      void renderDiagram(source, () => !cancelled)
        .then((svg) => {
          if (cancelled || svg === null) return;
          setLastValid({ source, svg });
          setAttempt({ source, error: null });
        })
        .catch((cause) => {
          if (!cancelled) setAttempt({ source, error: describeError(cause) });
        });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [source]);
  useEffect(() => {
    document.title = 'Mermaid6 — Éditeur';
  }, []);
  useEffect(() => {
    if (!needsBackup) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [needsBackup]);

  useEffect(() => {
    if (storageWarning) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      void writeDraft({
        source,
        name,
        origin: initial.origin,
        updatedAt: Date.now(),
      })
        .then(() => {
          if (!cancelled) {
            setPersisted({ source, name });
            setStorageError('');
          }
        })
        .catch(() => {
          if (!cancelled)
            setStorageError(
              'Enregistrement local impossible. Téléchargez votre source pour la conserver.',
            );
        });
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [source, name, initial.origin, storageWarning]);

  async function openFile(file: File) {
    const sequence = ++importSequence.current;
    try {
      const imported = await importSource(file);
      if (sequence !== importSequence.current) return;
      const candidate = { ...imported, label: file.name };
      if (dirty || latestSource.current !== initial.source)
        setReplacement(candidate);
      else replaceDocument(candidate);
    } catch (cause) {
      if (sequence === importSequence.current)
        setNotice(
          cause instanceof Error
            ? cause.message
            : 'Lecture du fichier impossible.',
        );
    }
  }
  function replaceDocument(document: { source: string; name: string }) {
    importSequence.current++;
    setSource(document.source);
    setName(document.name);
    setReplacement(null);
    setZoom(100);
    setNotice('');
  }
  function chooseExample(example: DiagramExample) {
    importSequence.current++;
    const document = {
      source: getSource(example, inks[0]),
      name: 'mon-diagramme.mmd',
      label: example.label,
    };
    if (dirty || source !== initial.source) setReplacement(document);
    else replaceDocument(document);
  }

  function configure(key: string, value: string) {
    try {
      setSource(changeAppearance(source, key, value, fields));
      setNotice('');
    } catch (cause) {
      setNotice(
        cause instanceof Error ? cause.message : 'Configuration invalide.',
      );
    }
  }
  function download() {
    const url = URL.createObjectURL(
      new Blob([source], { type: 'text/plain;charset=utf-8' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setSaved(source);
    setNotice('Source téléchargée.');
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(source);
      setNotice('Source copiée.');
    } catch {
      setNotice('Copie indisponible : téléchargez votre source.');
    }
  }

  return (
    <div className="editor-page">
      <header className="editor-header">
        <a className="brand" href="/" aria-label="Mermaid6, accueil">
          <img src="/favicon.svg" width="30" height="30" alt="" />
          <span>
            Mermaid<span className="brand-six">6</span>
          </span>
        </a>
        <span className="editor-breadcrumb">
          / <h1>Éditeur</h1>
        </span>
        <div className="editor-header-actions">
          <input
            ref={fileInput}
            type="file"
            accept=".mmd"
            aria-label="Importer un fichier Mermaid"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = '';
              if (file) void openFile(file);
            }}
          />
          <button className="button" onClick={() => fileInput.current?.click()}>
            Importer .mmd
          </button>
          <a href="/examples" className="editor-home">
            Les exemples
          </a>
          <button className="button primary" onClick={download}>
            <Icon name="export" />
            Télécharger .mmd
          </button>
        </div>
      </header>
      <main className="editor-main">
        <div className="editor-toolbar">
          <label className="editor-field">
            Point de départ
            <select
              aria-label="Charger un exemple"
              value=""
              onChange={(event) => {
                const example = catalogue[Number(event.target.value)];
                chooseExample(example);
              }}
            >
              <option value="" disabled>
                Choisir un exemple…
              </option>
              {categories.map((category) => (
                <optgroup label={category} key={category}>
                  {catalogue.map(
                    (model, index) =>
                      model.category === category && (
                        <option key={model.id} value={index}>
                          {model.label}
                          {model.experimental ? ' · Expérimental' : ''}
                        </option>
                      ),
                  )}
                </optgroup>
              ))}
            </select>
          </label>
          <button
            className="button catalogue-toolbar-button"
            onClick={() => setCatalogueOpen(true)}
          >
            Parcourir les exemples
          </button>
          <span className="toolbar-divider" />
          <label className="editor-field">
            Thème
            <select
              aria-label="Thème du diagramme"
              value={appearance.theme}
              onChange={(event) => configure('theme', event.target.value)}
            >
              {themes.map((theme) => (
                <option key={theme.value} value={theme.value}>
                  {theme.label}
                </option>
              ))}
            </select>
          </label>
          <div
            className="editor-colors"
            aria-label="Couleurs du diagramme"
            role="group"
          >
            {fields.map((item) => (
              <label key={item.key} title={item.label}>
                <input
                  type="color"
                  aria-label={item.label}
                  value={appearance.colors[item.key]}
                  onChange={(event) => configure(item.key, event.target.value)}
                  disabled={appearance.theme !== 'base'}
                />
                <span>
                  {item.label
                    .replace(' des éléments', '')
                    .replace(' des participants', '')}
                </span>
              </label>
            ))}
          </div>
          <span className="theme-note">
            {fields.length === 0
              ? 'Couleurs spécifiques : voir les indications ci-dessous.'
              : appearance.theme === 'base'
                ? 'Couleurs enregistrées dans le code.'
                : 'Choisissez « Personnalisé » pour régler les couleurs.'}
          </span>
        </div>
        {sourceExample && (
          <p className="example-guidance">
            <strong>
              {sourceExample.label}
              {sourceExample.experimental ? ' · Expérimental' : ''}
            </strong>
            <span>{sourceExample.note}</span>
          </p>
        )}
        {replacement !== null && (
          <div className="replacement-notice" role="alert">
            <p>Charger « {replacement.label} » remplacera votre code actuel.</p>
            <button className="button" onClick={() => setReplacement(null)}>
              Annuler
            </button>
            <button
              className="button primary"
              onClick={() => replaceDocument(replacement)}
            >
              Remplacer le code
            </button>
          </div>
        )}
        <div
          className="editor-mobile-tabs"
          role="group"
          aria-label="Panneau affiché"
        >
          <button
            aria-pressed={mobilePanel === 'code'}
            onClick={() => setMobilePanel('code')}
          >
            Code
          </button>
          <button
            aria-pressed={mobilePanel === 'preview'}
            onClick={() => setMobilePanel('preview')}
          >
            Aperçu {error && <span aria-label="erreur">!</span>}
          </button>
        </div>
        <div className={`live-editor-grid show-${mobilePanel}`}>
          <section className="live-code-panel" aria-labelledby="code-title">
            <header className="live-panel-heading">
              <h2 id="code-title">
                <Icon name="code" />
                Source Mermaid
              </h2>
              <button
                className="icon-button"
                onClick={() => void copy()}
                aria-label="Copier la source"
              >
                <Icon name="copy" />
              </button>
            </header>
            <CodeEditor value={source} onChange={setSource} />
            <footer className="code-footer">
              <span id="code-help">
                Tab pour quitter · ⌘/Ctrl Z pour annuler
              </span>
              <span
                className={
                  source.length > MAX_SOURCE_LENGTH ? 'over-limit' : ''
                }
              >
                {source.length.toLocaleString('fr-FR')} caractères
              </span>
            </footer>
          </section>
          <section
            className={`live-preview-panel theme-${appearance.theme}`}
            aria-labelledby="preview-title"
          >
            <header className="live-panel-heading">
              <h2 id="preview-title">Aperçu en direct</h2>
              <span
                className={`render-status ${current ? 'ready' : error ? 'failed' : 'pending'}`}
                role="status"
              >
                {status}
              </span>
            </header>
            {error && (
              <div className="render-error" role="alert">
                <strong>{error.title}</strong>
                <p>
                  Votre texte est conservé.
                  {lastValid.svg &&
                    ' Le dernier aperçu valide est affiché ci-dessous.'}
                </p>
                <details>
                  <summary>Détails de l’erreur</summary>
                  <pre>{error.detail}</pre>
                </details>
              </div>
            )}
            <div
              className="live-preview-scroll"
              tabIndex={0}
              role="region"
              aria-label="Diagramme, utilisez le zoom puis faites défiler"
              aria-busy={!current && !error}
            >
              <div
                className="live-svg"
                style={{ '--zoom': zoom / 100 } as CSSProperties}
              >
                {lastValid.svg ? (
                  <div
                    className="svg-content"
                    dangerouslySetInnerHTML={{ __html: lastValid.svg }}
                  />
                ) : (
                  <div className="preview-placeholder">
                    <Icon name="flow" />
                    <p>
                      {error
                        ? 'Corrigez le code pour afficher votre diagramme.'
                        : 'Préparation du diagramme…'}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <footer className="live-preview-footer">
              <span>Rendu local · Mermaid 12</span>
              <div
                className="zoom-tools"
                role="group"
                aria-label="Zoom du diagramme"
              >
                <button
                  aria-label="Réduire"
                  disabled={zoom <= 40}
                  onClick={() => setZoom(zoom - 20)}
                >
                  −
                </button>
                <button
                  className="zoom-reset"
                  aria-label="Réinitialiser le zoom"
                  onClick={() => setZoom(100)}
                >
                  {zoom}%
                </button>
                <button
                  aria-label="Agrandir"
                  disabled={zoom >= 300}
                  onClick={() => setZoom(zoom + 20)}
                >
                  +
                </button>
              </div>
            </footer>
          </section>
        </div>
        <footer className="editor-bottom">
          <span role="status" className={storageError ? 'over-limit' : ''}>
            {storageError ||
              (locallySaved
                ? 'Brouillon enregistré dans ce navigateur.'
                : 'Enregistrement du brouillon…')}
          </span>
          <span className="draft-filename">
            {name} · Un seul brouillon local. Téléchargez-le pour le partager.
          </span>
          <span>
            Styles par élément : utilisez la syntaxe Mermaid dans le code.
          </span>
        </footer>
      </main>
      {catalogueOpen && (
        <CatalogueDialog
          onClose={() => setCatalogueOpen(false)}
          onChoose={(example) => {
            setCatalogueOpen(false);
            chooseExample(example);
          }}
        />
      )}
      {notice && (
        <div className="announcement" role="status">
          <span>{notice}</span>
          <button
            aria-label="Fermer la notification"
            onClick={() => setNotice('')}
          >
            <Icon name="close" />
          </button>
        </div>
      )}
    </div>
  );
}
