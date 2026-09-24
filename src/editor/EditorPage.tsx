import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import Icon from '../components/Icon';
import { getSource, inks } from '../models';
import { exampleForSource, type DiagramExample } from '../catalogue';
import CatalogueDialog from '../components/CatalogueDialog';
import CodeEditor from './CodeEditor';
import { readAppearance, colorFields } from './appearance';
import { describeError, MAX_SOURCE_LENGTH, renderDiagram } from './render';
import { writeDraft, type Draft } from './drafts';
import { importSource } from './importSource';
import ExportDialog from './ExportDialog';
import { exportImage, downloadImage, type ImageOptions } from './exportImage';
import './editor.css';
import { usePreferences } from '../preferences';
import type { Values } from '../i18n/copy';
import DiagramSvg from '../components/DiagramSvg';

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
  const { t, tx, locale } = usePreferences();
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
  const [notice, setNoticeValue] = useState<{ text: string; values?: Values }>({
    text: restored ? 'Draft restored from this browser.' : '',
  });
  function setNotice(text: string, values?: Values) {
    setNoticeValue({ text, values });
  }
  useEffect(() => {
    if (!notice.text) return;
    const timer = setTimeout(() => setNoticeValue({ text: '' }), 4000);
    return () => clearTimeout(timer);
  }, [notice]);
  const [replacement, setReplacement] = useState<{
    label: string;
    translateLabel?: boolean;
    source: string;
    name: string;
  } | null>(null);
  const [catalogueOpen, setCatalogueOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportBusy, setExportBusy] = useState(false);
  const [exportError, setExportError] = useState('');
  const exportAttempt = useRef(0);
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
    ? 'Preview up to date'
    : error
      ? 'Fix the error'
      : 'Updating the preview…';

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
    document.title = `Mermaid6 — ${t('Editor')}`;
  }, [t]);
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
              'Local save unavailable. Download your source to keep it.',
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
            : 'The file could not be read.',
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
      name: 'diagram.mmd',
      label: example.label,
      translateLabel: true,
    };
    if (dirty || source !== initial.source) setReplacement(document);
    else replaceDocument(document);
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
    setNotice('Source downloaded.');
  }
  async function saveImage(options: ImageOptions) {
    if (!current || exportBusy) return;
    const version = ++exportAttempt.current;
    const snapshot = source;
    setExportBusy(true);
    setExportError('');
    try {
      const blob = await exportImage(lastValid.svg, options);
      if (version !== exportAttempt.current) return;
      if (latestSource.current !== snapshot)
        throw new Error(
          'The code changed. Wait for the new preview and export again.',
        );
      downloadImage(blob, name, options.format);
      setNotice('{format} image downloaded.', {
        format: options.format.toUpperCase(),
      });
    } catch (cause) {
      if (version === exportAttempt.current)
        setExportError(
          cause instanceof Error ? cause.message : 'Export failed.',
        );
    } finally {
      if (version === exportAttempt.current) setExportBusy(false);
    }
  }
  function closeExport() {
    exportAttempt.current++;
    setExportBusy(false);
    setExportOpen(false);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(source);
      setNotice('Source copied.');
    } catch {
      setNotice('Copy unavailable: download your source.');
    }
  }

  return (
    <div className="editor-page">
      <header className="editor-header">
        <a className="brand" href="/" aria-label={t('homeLabel')}>
          <img src="/favicon.svg" width="30" height="30" alt="" />
          <span>
            Mermaid<span className="brand-six">6</span>
          </span>
        </a>
        <span className="editor-breadcrumb">
          / <h1>{t('Editor')}</h1>
        </span>
        <div className="editor-header-actions">
          <input
            ref={fileInput}
            type="file"
            accept=".mmd"
            aria-label={t('Import a Mermaid file')}
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = '';
              if (file) void openFile(file);
            }}
          />
          <button className="button" onClick={() => fileInput.current?.click()}>
            {t('Import .mmd')}
          </button>
          <button className="button" onClick={() => setCatalogueOpen(true)}>
            {t('Browse examples')}
          </button>
          <button className="button primary" onClick={download}>
            <Icon name="export" />
            {t('Download .mmd')}
          </button>
        </div>
      </header>
      <main className="editor-main">
        {sourceExample && (
          <p className="example-guidance">
            <strong>
              {tx(sourceExample.label)}
              {sourceExample.experimental ? ` · ${t('Experimental')}` : ''}
            </strong>
            <span>{tx(sourceExample.note)}</span>
          </p>
        )}
        {replacement !== null && (
          <div className="replacement-notice" role="alert">
            <p>
              {t('Load “{name}”? This will replace your current code.', {
                name: replacement.translateLabel
                  ? tx(replacement.label)
                  : replacement.label,
              })}
            </p>
            <button className="button" onClick={() => setReplacement(null)}>
              {t('Cancel')}
            </button>
            <button
              className="button primary"
              onClick={() => replaceDocument(replacement)}
            >
              {t('Replace code')}
            </button>
          </div>
        )}
        <div
          className="editor-mobile-tabs"
          role="group"
          aria-label={t('Displayed panel')}
        >
          <button
            aria-pressed={mobilePanel === 'code'}
            onClick={() => setMobilePanel('code')}
          >
            {t('Code')}
          </button>
          <button
            aria-pressed={mobilePanel === 'preview'}
            onClick={() => setMobilePanel('preview')}
          >
            {t('Preview')}
            {error && <span aria-label={t('error')}>!</span>}
          </button>
        </div>
        <div className={`live-editor-grid show-${mobilePanel}`}>
          <section className="live-code-panel" aria-labelledby="code-title">
            <header className="live-panel-heading">
              <h2 id="code-title">
                <Icon name="code" />
                {t('Mermaid source')}
              </h2>
              <button
                className="icon-button"
                onClick={() => void copy()}
                aria-label={t('Copy source')}
              >
                <Icon name="copy" />
              </button>
            </header>
            <CodeEditor value={source} onChange={setSource} />
            <footer className="code-footer">
              <span id="code-help">{t('Tab to leave · ⌘/Ctrl Z to undo')}</span>
              <span
                className={
                  source.length > MAX_SOURCE_LENGTH ? 'over-limit' : ''
                }
              >
                {t('{count} characters', {
                  count: source.length.toLocaleString(locale),
                })}
              </span>
            </footer>
          </section>
          <section
            className={`live-preview-panel theme-${appearance.theme}`}
            aria-labelledby="preview-title"
          >
            <header className="live-panel-heading">
              <h2 id="preview-title">{t('Preview in real time')}</h2>
              <span
                className={`render-status ${current ? 'ready' : error ? 'failed' : 'pending'}`}
                role="status"
              >
                {tx(status)}
              </span>
            </header>
            {error && (
              <div className="render-error" role="alert">
                <strong>{tx(error.title, { line: error.line ?? '' })}</strong>
                <p>
                  {t('Your text is preserved.')}
                  {lastValid.svg && t('The last valid preview is shown below.')}
                </p>
                <details>
                  <summary>{t('Error details')}</summary>
                  <pre>{tx(error.detail)}</pre>
                </details>
              </div>
            )}
            <div
              className="live-preview-scroll"
              tabIndex={0}
              role="region"
              aria-label={t('Diagram, use zoom then scroll')}
              aria-busy={!current && !error}
            >
              <div
                className="live-svg"
                style={{ '--zoom': zoom / 100 } as CSSProperties}
              >
                {lastValid.svg ? (
                  <DiagramSvg svg={lastValid.svg} />
                ) : (
                  <div className="preview-placeholder">
                    <Icon name="flow" />
                    <p>
                      {error
                        ? t('Fix the code to display your diagram.')
                        : t('Preparing the diagram…')}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <footer className="live-preview-footer">
              <button
                className="button primary"
                disabled={!current || !lastValid.svg}
                onClick={() => {
                  setExportError('');
                  setExportOpen(true);
                }}
              >
                {t('Export image')}
                <Icon name="export" />
              </button>
              <div
                className="zoom-tools"
                role="group"
                aria-label={t('Diagram zoom')}
              >
                <button
                  aria-label={t('Zoom out')}
                  disabled={zoom <= 40}
                  onClick={() => setZoom(zoom - 20)}
                >
                  −
                </button>
                <button
                  className="zoom-reset"
                  aria-label={t('Reset zoom')}
                  onClick={() => setZoom(100)}
                >
                  {zoom}%
                </button>
                <button
                  aria-label={t('Zoom in')}
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
            {tx(storageError) ||
              (locallySaved
                ? t('Draft saved in this browser.')
                : t('Saving the draft…'))}
          </span>
          <span className="draft-filename">
            {name} · {t('One local draft. Download it to share.')}
          </span>
          <span>{t('Element styles: use Mermaid syntax in the code.')}</span>
        </footer>
      </main>
      {exportOpen && (
        <ExportDialog
          svg={lastValid.svg}
          current={current}
          dark={appearance.theme === 'dark'}
          busy={exportBusy}
          error={exportError}
          onClose={closeExport}
          onExport={(options) => void saveImage(options)}
        />
      )}
      {catalogueOpen && (
        <CatalogueDialog
          onClose={() => setCatalogueOpen(false)}
          onChoose={(example) => {
            setCatalogueOpen(false);
            chooseExample(example);
          }}
        />
      )}
      {notice.text && (
        <div className="announcement" role="status">
          <span>{tx(notice.text, notice.values)}</span>
          <button
            aria-label={t('Close notification')}
            onClick={() => setNotice('')}
          >
            <Icon name="close" />
          </button>
        </div>
      )}
    </div>
  );
}
