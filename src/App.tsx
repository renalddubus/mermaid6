import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import DiagramPreview from './components/DiagramPreview';
import Icon from './components/Icon';
import { getSource, inks, models } from './models';
import { SettingsButton, usePreferences } from './preferences';

const examples: {
  title: string;
  category: string;
  description: string;
}[] = [
  {
    title: 'From idea to sharing',
    category: 'Flow',
    description: 'An idea takes shape, step by step.',
  },
  {
    title: 'A conversation',
    category: 'Sequence',
    description: 'Exchanges that move ideas forward.',
  },
  {
    title: 'Life cycle',
    category: 'States',
    description: 'Every stage opens up new possibilities.',
  },
];

export default function App() {
  const { t, tx } = usePreferences();
  useEffect(() => {
    document.title = `Mermaid6 — ${t('Workshop')}`;
  }, [t]);
  const [selected, setSelected] = useState(0);
  const [inkIndex, setInkIndex] = useState(0);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [colorsOpen, setColorsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [zoom, setZoom] = useState(100);
  const [notice, setNotice] = useState('');
  const sourceButton = useRef<HTMLButtonElement>(null);
  const model = models[selected];
  const example = examples[selected];
  const ink = inks[inkIndex];
  const source = getSource(model, ink);
  const variables = {
    '--ink': ink.color,
    '--ink-wash': ink.wash,
  } as CSSProperties;
  const normalize = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  const visibleExamples = examples
    .map((item, index) => ({ ...item, index }))
    .filter((item) =>
      normalize(
        `${tx(item.title)} ${tx(item.category)} ${tx(item.description)} ${models[item.index].syntax}`,
      ).includes(normalize(query)),
    );

  function selectModel(index: number) {
    setSelected(index);
    setZoom(100);
    setNotice('');
  }
  function showAll() {
    setQuery('');
    document.getElementById('examples')?.scrollIntoView({ block: 'start' });
  }
  async function copySource() {
    try {
      await navigator.clipboard.writeText(source);
      setNotice('Source copied.');
    } catch {
      setNotice('Copy unavailable. Download the .mmd file.');
    }
  }
  function downloadSource() {
    const url = URL.createObjectURL(
      new Blob([source], { type: 'text/plain;charset=utf-8' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = `mermaid6-${model.id}.mmd`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice('.mmd file downloaded.');
  }
  function closeSource() {
    setSourceOpen(false);
    sourceButton.current?.focus();
  }

  return (
    <div className="app" style={variables}>
      <a className="skip-link" href="#workspace">
        {t('skipContent')}
      </a>
      <header className="site-header">
        <a className="brand" href="/" aria-label={t('homeLabel')}>
          <img src="/favicon.svg" alt="" width="32" height="32" />
          <span>
            Mermaid<span className="brand-six">6</span>
          </span>
        </a>
        <nav aria-label={t('mainNavigation')}>
          <a href="/examples">{t('examples')}</a>
          <a href="#about">{t('project')}</a>
        </nav>
        <div className="header-actions">
          <a className="button primary header-cta" href="/editor">
            {t('openEditor')} <Icon name="arrow" />
          </a>
          <SettingsButton />
        </div>
      </header>
      <main>
        <section className="hero" aria-labelledby="hero-title">
          <span className="hero-eyebrow">{t('heroEyebrow')}</span>
          <h1 id="hero-title">
            {t('heroTitleA')}
            <br />
            <span>{t('heroTitleB')}</span>
          </h1>
          <p>{t('heroIntro')}</p>
          <div className="hero-actions">
            <a className="button primary" href="#examples">
              {t('exploreExamples')} <Icon name="arrow" />
            </a>
            <a className="hero-link" href="#about">
              {t('openProject')}
            </a>
          </div>
          <div className="hero-details">
            <span>{t('noAccount')}</span>
            <span>{t('Open source · MIT')}</span>
            <span>{t('inBrowser')}</span>
          </div>
        </section>
        <section
          className="discovery"
          id="examples"
          aria-labelledby="discovery-title"
        >
          <div className="discovery-heading">
            <div>
              <span className="section-eyebrow">
                {t('A GLIMPSE OF THE POSSIBLE')}
              </span>
              <h2 id="discovery-title">{t('Every idea has its diagram.')}</h2>
              <p>
                {t('Explore an example. Discover what your ideas can become.')}
              </p>
            </div>
            <label className="search">
              <Icon name="search" />
              <input
                type="search"
                placeholder={t('Search examples…')}
                aria-label={t('Search examples')}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
          </div>
          <div className="example-gallery">
            {visibleExamples.map((item) => (
              <button
                key={item.index}
                className={`example-card ${selected === item.index ? 'selected' : ''}`}
                aria-pressed={selected === item.index}
                onClick={() => selectModel(item.index)}
              >
                <div
                  className={`thumbnail thumbnail-${item.index}`}
                  aria-hidden="true"
                >
                  <DiagramPreview kind={models[item.index].id} />
                </div>
                <span className="example-title">{tx(item.title)}</span>
                <span className="example-description">
                  {tx(item.description)}
                </span>
                <span className="example-category">{tx(item.category)}</span>
              </button>
            ))}
          </div>
          {visibleExamples.length === 0 && (
            <div className="empty-state" role="status">
              {t('No examples for “{query}”.', { query })}
              <button className="text-button" onClick={() => setQuery('')}>
                {t('Clear search')}
              </button>
            </div>
          )}
          <a className="catalogue-home-link" href="/examples">
            {t('fullCatalogue')} <Icon name="arrow" />
          </a>
        </section>
        <section
          className="workspace"
          id="workspace"
          aria-labelledby="workspace-title"
        >
          <header className="workspace-header">
            <div>
              <h2 id="workspace-title">{tx(example.title)}</h2>
              <p>{tx(model.description)}</p>
            </div>
            <div className="workspace-actions">
              <a
                className="button primary"
                href={`/editor?example=${model.id}&ink=${inkIndex}`}
              >
                {t('Edit this example')}
                <Icon name="arrow" />
              </a>
              <button
                ref={sourceButton}
                className={`button ${sourceOpen ? 'active' : ''}`}
                onClick={() => setSourceOpen(!sourceOpen)}
                aria-expanded={sourceOpen}
                aria-controls="source-panel"
              >
                <Icon name="code" />
                {t('Source')}
              </button>
              <div className="color-control">
                <button
                  className={`button ${colorsOpen ? 'active' : ''}`}
                  onClick={() => setColorsOpen(!colorsOpen)}
                  aria-expanded={colorsOpen}
                  aria-controls="color-panel"
                >
                  <Icon name="palette" />
                  {t('Colors')}
                </button>
                {colorsOpen && (
                  <div
                    id="color-panel"
                    className="color-panel"
                    role="group"
                    aria-label={t('Diagram color')}
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') setColorsOpen(false);
                    }}
                  >
                    <span>{t('Diagram color')}</span>
                    <div>
                      {inks.map((color, index) => (
                        <button
                          key={color.name}
                          className="swatch"
                          style={{ '--swatch': color.color } as CSSProperties}
                          aria-label={tx(color.name)}
                          aria-pressed={inkIndex === index}
                          onClick={() => {
                            setInkIndex(index);
                            setNotice('');
                          }}
                        >
                          <span />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button
                className="button primary"
                onClick={downloadSource}
                aria-label={t('Export the .mmd file')}
              >
                <Icon name="export" />
                {t('Export')}
                <span className="file-extension">.mmd</span>
              </button>
            </div>
          </header>
          <div className={`editor-layout ${sourceOpen ? 'with-source' : ''}`}>
            {sourceOpen && (
              <aside
                id="source-panel"
                className="source-panel"
                aria-label={t('Mermaid source')}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') closeSource();
                }}
              >
                <div className="source-heading">
                  <span>{t('Mermaid source')}</span>
                  <div>
                    <button
                      className="icon-button"
                      aria-label={t('Copy source')}
                      onClick={() => void copySource()}
                    >
                      <Icon name="copy" />
                    </button>
                    <button
                      className="icon-button"
                      aria-label={t('Close source')}
                      onClick={closeSource}
                    >
                      <Icon name="close" />
                    </button>
                  </div>
                </div>
                <pre tabIndex={0} aria-label={t('Example source code')}>
                  <code>
                    {source.split('\n').map((line, index) => (
                      <span
                        className={`code-line ${line.startsWith('  ') ? '' : 'code-keyword'}`}
                        key={index}
                      >
                        <span className="line-number" aria-hidden="true">
                          {index + 1}
                        </span>
                        {line || ' '}
                      </span>
                    ))}
                  </code>
                </pre>
                <div className="source-caption">
                  {model.id}.mmd<span>{t('Read only')}</span>
                </div>
              </aside>
            )}
            <div className="preview">
              <div className="preview-heading">
                <span>{t('Preview')}</span>
                <span className="preview-kind">{tx(example.category)}</span>
              </div>
              <div
                className="art-window"
                tabIndex={0}
                role="region"
                aria-label={t('Diagram, scroll after zooming')}
              >
                <div
                  className="art-transform"
                  style={{ '--zoom': zoom / 100 } as CSSProperties}
                >
                  <DiagramPreview kind={model.id} />
                </div>
              </div>
              <div className="preview-footer">
                <span>{t('Illustrated preview')}</span>
                <div
                  className="zoom-tools"
                  role="group"
                  aria-label={t('Diagram zoom')}
                >
                  <button
                    aria-label={t('Zoom out')}
                    disabled={zoom <= 60}
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
              </div>
            </div>
          </div>
        </section>
        <div className="tip">
          <Icon name="info" />
          <p>
            <strong>{t('Try it out')}</strong>{' '}
            {t(
              'Switch examples, change their colors, and take their Mermaid source with you.',
            )}
            <span> {t('Open the editor to modify this example live.')}</span>
          </p>
        </div>
        <section className="about" id="about" aria-labelledby="about-title">
          <div>
            <span className="section-eyebrow">{t('FREE TO CREATE')}</span>
            <h2 id="about-title">
              {t('Your ideas.')}
              <br />
              {t('Your space.')}
            </h2>
          </div>
          <div className="about-copy">
            <p>
              {t(
                'Mermaid6 is an open-source project that makes diagrams more accessible. Explore an example, see how it works, and take its source to adapt it.',
              )}
            </p>
            <p>
              {t(
                'The project uses the MIT license and can be self-hosted with Docker, so you stay in control of your tool.',
              )}
            </p>
            <button className="text-button" onClick={showAll}>
              {t('Find my starting point')}
              <Icon name="arrow" />
            </button>
          </div>
        </section>
      </main>
      <footer className="page-footer">
        <span className="footer-brand">
          Mermaid<span>6</span>
        </span>
        <span>{t('Ideas into diagrams. An open project.')}</span>
        <a href="#examples">
          {t('Explore')}
          <Icon name="arrow" />
        </a>
      </footer>
      <div className="announcement" role="status">
        {notice && (
          <>
            <span>{tx(notice)}</span>
            <button
              aria-label={t('Close notification')}
              onClick={() => setNotice('')}
            >
              <Icon name="close" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
