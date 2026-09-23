import { useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import DiagramPreview from './components/DiagramPreview';
import Icon from './components/Icon';
import { getSource, inks, models } from './models';

const examples: {
  title: string;
  category: string;
  description: string;
}[] = [
  {
    title: 'De l’idée au partage',
    category: 'Flux',
    description: 'Une idée prend forme, pas à pas.',
  },
  {
    title: 'Une conversation',
    category: 'Séquence',
    description: 'Des échanges qui font avancer les idées.',
  },
  {
    title: 'Cycle de vie',
    category: 'États',
    description: 'Chaque étape ouvre de nouvelles possibilités.',
  },
];

export default function App() {
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
      normalize(`${item.title} ${item.category} ${item.description}`).includes(
        normalize(query),
      ),
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
      setNotice('Source copiée.');
    } catch {
      setNotice('Copie indisponible. Téléchargez le fichier .mmd.');
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
    setNotice('Fichier .mmd téléchargé.');
  }
  function closeSource() {
    setSourceOpen(false);
    sourceButton.current?.focus();
  }

  return (
    <div className="app" style={variables}>
      <a className="skip-link" href="#workspace">
        Aller au diagramme
      </a>
      <header className="site-header">
        <a className="brand" href="/" aria-label="Mermaid6, accueil">
          <img src="/favicon.svg" alt="" width="32" height="32" />
          <span>
            Mermaid<span className="brand-six">6</span>
          </span>
        </a>
        <nav aria-label="Navigation principale">
          <a href="/examples">Les exemples</a>
          <a href="#about">Le projet</a>
        </nav>
        <a className="button primary header-cta" href="/editor">
          Ouvrir l’éditeur <Icon name="arrow" />
        </a>
      </header>
      <main>
        <section className="hero" aria-labelledby="hero-title">
          <span className="hero-eyebrow">
            VOS IDÉES MÉRITENT D’ÊTRE COMPRISES
          </span>
          <h1 id="hero-title">
            Un peu de texte.
            <br />
            <span>Tout devient plus clair.</span>
          </h1>
          <p>
            Un processus, une conversation, un système.
            <br />
            Donnez forme à vos idées avec les diagrammes Mermaid.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#examples">
              Explorer les exemples <Icon name="arrow" />
            </a>
            <a className="hero-link" href="#about">
              Un projet ouvert, pour tous
            </a>
          </div>
          <div className="hero-details">
            <span>Sans compte</span>
            <span>Open source · MIT</span>
            <span>Dans votre navigateur</span>
          </div>
        </section>
        <section
          className="discovery"
          id="examples"
          aria-labelledby="discovery-title"
        >
          <div className="discovery-heading">
            <div>
              <span className="section-eyebrow">UNE IDÉE DU POSSIBLE</span>
              <h2 id="discovery-title">À chaque idée, son diagramme.</h2>
              <p>
                Explorez un exemple. Découvrez ce que vos idées peuvent devenir.
              </p>
            </div>
            <label className="search">
              <Icon name="search" />
              <input
                type="search"
                placeholder="Rechercher un exemple…"
                aria-label="Rechercher un exemple"
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
                <span className="example-title">{item.title}</span>
                <span className="example-description">{item.description}</span>
                <span className="example-category">{item.category}</span>
              </button>
            ))}
          </div>
          {visibleExamples.length === 0 && (
            <div className="empty-state" role="status">
              Aucun exemple pour « {query} ».
              <button className="text-button" onClick={() => setQuery('')}>
                Effacer la recherche
              </button>
            </div>
          )}
          <a className="catalogue-home-link" href="/examples">
            Explorer le catalogue complet <Icon name="arrow" />
          </a>
        </section>
        <section
          className="workspace"
          id="workspace"
          aria-labelledby="workspace-title"
        >
          <header className="workspace-header">
            <div>
              <h2 id="workspace-title">{example.title}</h2>
              <p>{model.description}</p>
            </div>
            <div className="workspace-actions">
              <a
                className="button primary"
                href={`/editor?example=${model.id}&ink=${inkIndex}`}
              >
                Modifier cet exemple <Icon name="arrow" />
              </a>
              <button
                ref={sourceButton}
                className={`button ${sourceOpen ? 'active' : ''}`}
                onClick={() => setSourceOpen(!sourceOpen)}
                aria-expanded={sourceOpen}
                aria-controls="source-panel"
              >
                <Icon name="code" />
                Source
              </button>
              <div className="color-control">
                <button
                  className={`button ${colorsOpen ? 'active' : ''}`}
                  onClick={() => setColorsOpen(!colorsOpen)}
                  aria-expanded={colorsOpen}
                  aria-controls="color-panel"
                >
                  <Icon name="palette" />
                  Couleurs
                </button>
                {colorsOpen && (
                  <div
                    id="color-panel"
                    className="color-panel"
                    role="group"
                    aria-label="Couleur du diagramme"
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') setColorsOpen(false);
                    }}
                  >
                    <span>Couleur du diagramme</span>
                    <div>
                      {inks.map((color, index) => (
                        <button
                          key={color.name}
                          className="swatch"
                          style={{ '--swatch': color.color } as CSSProperties}
                          aria-label={color.name}
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
                aria-label="Exporter le fichier .mmd"
              >
                <Icon name="export" />
                Exporter <span className="file-extension">.mmd</span>
              </button>
            </div>
          </header>
          <div className={`editor-layout ${sourceOpen ? 'with-source' : ''}`}>
            {sourceOpen && (
              <aside
                id="source-panel"
                className="source-panel"
                aria-label="Source Mermaid"
                onKeyDown={(event) => {
                  if (event.key === 'Escape') closeSource();
                }}
              >
                <div className="source-heading">
                  <span>Source Mermaid</span>
                  <div>
                    <button
                      className="icon-button"
                      aria-label="Copier la source"
                      onClick={() => void copySource()}
                    >
                      <Icon name="copy" />
                    </button>
                    <button
                      className="icon-button"
                      aria-label="Fermer la source"
                      onClick={closeSource}
                    >
                      <Icon name="close" />
                    </button>
                  </div>
                </div>
                <pre tabIndex={0} aria-label="Code source du modèle">
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
                  {model.id}.mmd<span>Lecture seule</span>
                </div>
              </aside>
            )}
            <div className="preview">
              <div className="preview-heading">
                <span>Aperçu</span>
                <span className="preview-kind">{example.category}</span>
              </div>
              <div
                className="art-window"
                tabIndex={0}
                role="region"
                aria-label="Diagramme, zone défilante après agrandissement"
              >
                <div
                  className="art-transform"
                  style={{ '--zoom': zoom / 100 } as CSSProperties}
                >
                  <DiagramPreview kind={model.id} />
                </div>
              </div>
              <div className="preview-footer">
                <span>Aperçu illustré</span>
                <div
                  className="zoom-tools"
                  role="group"
                  aria-label="Zoom du diagramme"
                >
                  <button
                    aria-label="Réduire"
                    disabled={zoom <= 60}
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
              </div>
            </div>
          </div>
        </section>
        <div className="tip">
          <Icon name="info" />
          <p>
            <strong>À explorer</strong> Passez d’un exemple à l’autre, changez
            ses couleurs et emportez sa source Mermaid.
            <span> Ouvrez l’éditeur pour modifier cet exemple en direct.</span>
          </p>
        </div>
        <section className="about" id="about" aria-labelledby="about-title">
          <div>
            <span className="section-eyebrow">LIBRE DE CRÉER</span>
            <h2 id="about-title">
              Vos idées.
              <br />
              Votre espace.
            </h2>
          </div>
          <div className="about-copy">
            <p>
              Mermaid6 est un projet open source conçu pour rendre les
              diagrammes plus accessibles. Explorez un exemple, observez sa
              construction et emportez sa source pour l’adapter.
            </p>
            <p>
              Le projet est distribué sous licence MIT et peut être hébergé chez
              vous avec Docker. Une façon simple de garder la main sur votre
              outil.
            </p>
            <button className="text-button" onClick={showAll}>
              Trouver mon point de départ <Icon name="arrow" />
            </button>
          </div>
        </section>
      </main>
      <footer className="page-footer">
        <span className="footer-brand">
          Mermaid<span>6</span>
        </span>
        <span>Des idées en diagrammes. Un projet ouvert.</span>
        <a href="#examples">
          Explorer <Icon name="arrow" />
        </a>
      </footer>
      <div className="announcement" role="status">
        {notice && (
          <>
            <span>{notice}</span>
            <button
              aria-label="Fermer la notification"
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
