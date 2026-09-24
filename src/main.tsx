import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Root from './Root';
import { bootstrapPreferences, PreferencesProvider } from './preferences';
import './styles.css';

bootstrapPreferences();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PreferencesProvider>
      <Root />
    </PreferencesProvider>
  </StrictMode>,
);
