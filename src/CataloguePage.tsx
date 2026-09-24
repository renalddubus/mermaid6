import { useEffect } from 'react';
import CatalogueBrowser from './components/CatalogueBrowser';
import Icon from './components/Icon';
import { SettingsButton, usePreferences } from './preferences';

export default function CataloguePage() {
  const { t } = usePreferences();
  useEffect(() => {
    document.title = `Mermaid6 — ${t('examples')}`;
  }, [t]);
  return (
    <div className="catalogue-page">
      <header className="site-header">
        <a className="brand" href="/" aria-label={t('homeLabel')}>
          <img src="/favicon.svg" width="32" height="32" alt="" />
          <span>
            Mermaid<span className="brand-six">6</span>
          </span>
        </a>
        <div className="header-actions">
          <a className="button primary" href="/editor">
            {t('openEditor')} <Icon name="arrow" />
          </a>
          <SettingsButton />
        </div>
      </header>
      <main className="catalogue-main">
        <div className="catalogue-intro">
          <span className="section-eyebrow">{t('catalogueEyebrow')}</span>
          <h1>
            {t('catalogueTitleA')}
            <br />
            <span>{t('catalogueTitleB')}</span>
          </h1>
          <p>{t('catalogueIntro')}</p>
        </div>
        <CatalogueBrowser />
      </main>
    </div>
  );
}
