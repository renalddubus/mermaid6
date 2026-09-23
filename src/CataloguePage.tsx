import { useEffect } from 'react';
import CatalogueBrowser from './components/CatalogueBrowser';
import Icon from './components/Icon';

export default function CataloguePage() {
  useEffect(() => {
    document.title = 'Mermaid6 — Les exemples';
  }, []);
  return (
    <div className="catalogue-page">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Mermaid6, accueil">
          <img src="/favicon.svg" width="32" height="32" alt="" />
          <span>
            Mermaid<span className="brand-six">6</span>
          </span>
        </a>
        <a className="button primary" href="/editor">
          Ouvrir l’éditeur <Icon name="arrow" />
        </a>
      </header>
      <main className="catalogue-main">
        <div className="catalogue-intro">
          <span className="section-eyebrow">TROUVER LA BONNE FORME</span>
          <h1>
            À chaque idée,
            <br />
            <span>son diagramme.</span>
          </h1>
          <p>Explorez les possibilités. Un exemple suffit pour commencer.</p>
        </div>
        <CatalogueBrowser />
      </main>
    </div>
  );
}
