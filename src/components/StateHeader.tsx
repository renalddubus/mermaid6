import { SettingsButton, usePreferences } from '../preferences';

export default function StateHeader() {
  const { t } = usePreferences();
  return (
    <header className="site-header state-header">
      <a className="brand" href="/" aria-label={t('homeLabel')}>
        <img src="/favicon.svg" width="32" height="32" alt="" />
        <span>
          Mermaid<span className="brand-six">6</span>
        </span>
      </a>
      <SettingsButton />
    </header>
  );
}
