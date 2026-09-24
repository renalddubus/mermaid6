/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type Locale = 'en' | 'fr' | 'es' | 'de';
export type LanguagePreference = Locale | 'system';
export type AppTheme = 'light' | 'dark';

type Preferences = {
  version: 1;
  language: LanguagePreference;
  theme: AppTheme;
};

const STORAGE_KEY = 'mermaid6.preferences';
const defaults: Preferences = {
  version: 1,
  language: 'system',
  theme: 'light',
};
const supportedLocales: Locale[] = ['en', 'fr', 'es', 'de'];

const english = {
  settings: 'Settings',
  settingsTitle: 'Settings',
  closeSettings: 'Close settings',
  language: 'Language',
  systemLanguage: 'System language',
  systemLanguageDetail: 'Currently {language}',
  theme: 'Appearance',
  light: 'Light',
  dark: 'Dark',
  localNotice: 'These preferences are stored in this browser.',
  storageWarning:
    'Your choice is active for this session, but this browser could not save it.',
  loadingHome: 'Loading Mermaid6…',
  loadingCatalogue: 'Loading the catalogue…',
  loadingEditor: 'Loading the editor…',
  loadingSlow: 'This is taking longer than expected.',
  loadingFailed: 'This page could not be loaded.',
  retry: 'Retry',
  backHome: 'Back to home',
  skipContent: 'Skip to the diagram',
  examples: 'Examples',
  project: 'Project',
  openEditor: 'Open editor',
  homeLabel: 'Mermaid6, home',
  mainNavigation: 'Main navigation',
  catalogueEyebrow: 'FIND THE RIGHT SHAPE',
  catalogueTitleA: 'Every idea has',
  catalogueTitleB: 'its diagram.',
  catalogueIntro: 'Explore the possibilities. One example is enough to begin.',
  heroEyebrow: 'YOUR IDEAS DESERVE TO BE UNDERSTOOD',
  heroTitleA: 'A little text.',
  heroTitleB: 'Everything becomes clearer.',
  heroIntro:
    'A process, a conversation, a system. Give shape to your ideas with Mermaid diagrams.',
  exploreExamples: 'Explore examples',
  openProject: 'An open project, for everyone',
  noAccount: 'No account',
  inBrowser: 'In your browser',
  fullCatalogue: 'Explore the full catalogue',
} as const;

type MessageKey = keyof typeof english;
type Messages = { [Key in MessageKey]: string };

const translations: Record<Locale, Messages> = {
  en: english,
  fr: {
    settings: 'Réglages',
    settingsTitle: 'Réglages',
    closeSettings: 'Fermer les réglages',
    language: 'Langue',
    systemLanguage: 'Langue du système',
    systemLanguageDetail: 'Actuellement : {language}',
    theme: 'Apparence',
    light: 'Clair',
    dark: 'Sombre',
    localNotice: 'Ces préférences sont enregistrées dans ce navigateur.',
    storageWarning:
      'Votre choix est actif pour cette session, mais ce navigateur ne peut pas l’enregistrer.',
    loadingHome: 'Chargement de Mermaid6…',
    loadingCatalogue: 'Chargement du catalogue…',
    loadingEditor: 'Chargement de l’éditeur…',
    loadingSlow: 'Le chargement prend plus de temps que prévu.',
    loadingFailed: 'Cette page n’a pas pu être chargée.',
    retry: 'Réessayer',
    backHome: 'Retour à l’accueil',
    skipContent: 'Aller au diagramme',
    examples: 'Les exemples',
    project: 'Le projet',
    openEditor: 'Ouvrir l’éditeur',
    homeLabel: 'Mermaid6, accueil',
    mainNavigation: 'Navigation principale',
    catalogueEyebrow: 'TROUVER LA BONNE FORME',
    catalogueTitleA: 'À chaque idée,',
    catalogueTitleB: 'son diagramme.',
    catalogueIntro:
      'Explorez les possibilités. Un exemple suffit pour commencer.',
    heroEyebrow: 'VOS IDÉES MÉRITENT D’ÊTRE COMPRISES',
    heroTitleA: 'Un peu de texte.',
    heroTitleB: 'Tout devient plus clair.',
    heroIntro:
      'Un processus, une conversation, un système. Donnez forme à vos idées avec les diagrammes Mermaid.',
    exploreExamples: 'Explorer les exemples',
    openProject: 'Un projet ouvert, pour tous',
    noAccount: 'Sans compte',
    inBrowser: 'Dans votre navigateur',
    fullCatalogue: 'Explorer le catalogue complet',
  },
  es: {
    settings: 'Ajustes',
    settingsTitle: 'Ajustes',
    closeSettings: 'Cerrar ajustes',
    language: 'Idioma',
    systemLanguage: 'Idioma del sistema',
    systemLanguageDetail: 'Actualmente: {language}',
    theme: 'Apariencia',
    light: 'Claro',
    dark: 'Oscuro',
    localNotice: 'Estas preferencias se guardan en este navegador.',
    storageWarning:
      'Tu selección está activa durante esta sesión, pero el navegador no pudo guardarla.',
    loadingHome: 'Cargando Mermaid6…',
    loadingCatalogue: 'Cargando el catálogo…',
    loadingEditor: 'Cargando el editor…',
    loadingSlow: 'Esto está tardando más de lo esperado.',
    loadingFailed: 'No se pudo cargar esta página.',
    retry: 'Reintentar',
    backHome: 'Volver al inicio',
    skipContent: 'Ir al diagrama',
    examples: 'Ejemplos',
    project: 'Proyecto',
    openEditor: 'Abrir editor',
    homeLabel: 'Mermaid6, inicio',
    mainNavigation: 'Navegación principal',
    catalogueEyebrow: 'ENCUENTRA LA FORMA ADECUADA',
    catalogueTitleA: 'Cada idea tiene',
    catalogueTitleB: 'su diagrama.',
    catalogueIntro: 'Explora las posibilidades. Un ejemplo basta para empezar.',
    heroEyebrow: 'TUS IDEAS MERECEN SER COMPRENDIDAS',
    heroTitleA: 'Un poco de texto.',
    heroTitleB: 'Todo se vuelve más claro.',
    heroIntro:
      'Un proceso, una conversación, un sistema. Da forma a tus ideas con diagramas Mermaid.',
    exploreExamples: 'Explorar ejemplos',
    openProject: 'Un proyecto abierto para todos',
    noAccount: 'Sin cuenta',
    inBrowser: 'En tu navegador',
    fullCatalogue: 'Explorar el catálogo completo',
  },
  de: {
    settings: 'Einstellungen',
    settingsTitle: 'Einstellungen',
    closeSettings: 'Einstellungen schließen',
    language: 'Sprache',
    systemLanguage: 'Systemsprache',
    systemLanguageDetail: 'Derzeit: {language}',
    theme: 'Darstellung',
    light: 'Hell',
    dark: 'Dunkel',
    localNotice: 'Diese Einstellungen werden in diesem Browser gespeichert.',
    storageWarning:
      'Die Auswahl gilt für diese Sitzung, konnte aber nicht gespeichert werden.',
    loadingHome: 'Mermaid6 wird geladen…',
    loadingCatalogue: 'Katalog wird geladen…',
    loadingEditor: 'Editor wird geladen…',
    loadingSlow: 'Das Laden dauert länger als erwartet.',
    loadingFailed: 'Diese Seite konnte nicht geladen werden.',
    retry: 'Erneut versuchen',
    backHome: 'Zur Startseite',
    skipContent: 'Zum Diagramm springen',
    examples: 'Beispiele',
    project: 'Projekt',
    openEditor: 'Editor öffnen',
    homeLabel: 'Mermaid6, Startseite',
    mainNavigation: 'Hauptnavigation',
    catalogueEyebrow: 'DIE PASSENDE FORM FINDEN',
    catalogueTitleA: 'Jede Idee hat',
    catalogueTitleB: 'ihr Diagramm.',
    catalogueIntro:
      'Entdecke die Möglichkeiten. Ein Beispiel genügt für den Anfang.',
    heroEyebrow: 'DEINE IDEEN SOLLEN VERSTANDEN WERDEN',
    heroTitleA: 'Ein wenig Text.',
    heroTitleB: 'Alles wird klarer.',
    heroIntro:
      'Ein Prozess, ein Gespräch, ein System. Gib deinen Ideen mit Mermaid-Diagrammen Gestalt.',
    exploreExamples: 'Beispiele entdecken',
    openProject: 'Ein offenes Projekt für alle',
    noAccount: 'Ohne Konto',
    inBrowser: 'In deinem Browser',
    fullCatalogue: 'Vollständigen Katalog öffnen',
  },
};

function isLocale(value: unknown): value is Locale {
  return (
    typeof value === 'string' && supportedLocales.includes(value as Locale)
  );
}

function parsePreferences(value: string | null): Preferences {
  if (!value) return defaults;
  try {
    const parsed = JSON.parse(value) as Partial<Preferences>;
    if (parsed.version !== 1) return defaults;
    return {
      version: 1,
      language:
        parsed.language === 'system' || isLocale(parsed.language)
          ? parsed.language
          : defaults.language,
      theme:
        parsed.theme === 'light' || parsed.theme === 'dark'
          ? parsed.theme
          : defaults.theme,
    };
  } catch {
    return defaults;
  }
}

function readPreferences() {
  try {
    return parsePreferences(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return defaults;
  }
}

export function bootstrapPreferences() {
  const preferences = readPreferences();
  document.documentElement.lang = resolveLocale(preferences.language);
  document.documentElement.dataset.appTheme = preferences.theme;
  document.documentElement.style.colorScheme = preferences.theme;
}

export function resolveLocale(language: LanguagePreference): Locale {
  if (language !== 'system') return language;
  const candidates =
    navigator.languages?.length > 0
      ? navigator.languages
      : [navigator.language];
  for (const candidate of candidates) {
    const base = candidate?.trim().toLowerCase().split(/[-_]/)[0];
    if (isLocale(base)) return base;
  }
  return 'en';
}

type PreferencesContextValue = {
  preferences: Preferences;
  locale: Locale;
  storageError: boolean;
  setLanguage: (language: LanguagePreference) => void;
  setTheme: (theme: AppTheme) => void;
  t: (key: MessageKey, values?: Record<string, string>) => string;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState(readPreferences);
  const [storageError, setStorageError] = useState(false);
  const [, setSystemRevision] = useState(0);
  const locale = resolveLocale(preferences.language);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dataset.appTheme = preferences.theme;
    document.documentElement.style.colorScheme = preferences.theme;
  }, [locale, preferences.theme]);

  useEffect(() => {
    const onLanguageChange = () => {
      if (preferences.language === 'system')
        setSystemRevision((value) => value + 1);
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY)
        setPreferences(parsePreferences(event.newValue));
    };
    window.addEventListener('languagechange', onLanguageChange);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('languagechange', onLanguageChange);
      window.removeEventListener('storage', onStorage);
    };
  }, [preferences.language]);

  function update(next: Preferences) {
    setPreferences(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }

  const t = (key: MessageKey, values: Record<string, string> = {}) =>
    Object.entries(values).reduce(
      (message, [name, value]) => message.replaceAll(`{${name}}`, value),
      translations[locale][key] ?? english[key],
    );

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        locale,
        storageError,
        setLanguage: (language) => update({ ...preferences, language }),
        setTheme: (theme) => update({ ...preferences, theme }),
        t,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const value = useContext(PreferencesContext);
  if (!value)
    throw new Error('usePreferences must be used inside PreferencesProvider');
  return value;
}

export function SettingsButton() {
  const { t } = usePreferences();
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button
        ref={opener}
        className="settings-button button"
        onClick={() => setOpen(true)}
      >
        {t('settings')}
      </button>
      {open && (
        <SettingsDialog
          onClose={() => {
            setOpen(false);
            requestAnimationFrame(() => opener.current?.focus());
          }}
        />
      )}
    </>
  );
}

function SettingsDialog({ onClose }: { onClose: () => void }) {
  const { preferences, locale, storageError, setLanguage, setTheme, t } =
    usePreferences();
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current!;
    element.showModal();
    return () => element.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="settings-dialog"
      aria-labelledby="settings-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <header>
        <h2 id="settings-title">{t('settingsTitle')}</h2>
        <button
          className="icon-button"
          aria-label={t('closeSettings')}
          onClick={onClose}
        >
          ×
        </button>
      </header>
      <label className="settings-field">
        <span>{t('language')}</span>
        <select
          value={preferences.language}
          onChange={(event) =>
            setLanguage(event.target.value as LanguagePreference)
          }
        >
          <option value="system">{t('systemLanguage')}</option>
          <option value="en">English</option>
          <option value="fr">Français</option>
          <option value="es">Español</option>
          <option value="de">Deutsch</option>
        </select>
        {preferences.language === 'system' && (
          <small>
            {t('systemLanguageDetail', { language: localeName(locale) })}
          </small>
        )}
      </label>
      <fieldset className="settings-theme">
        <legend>{t('theme')}</legend>
        {(['light', 'dark'] as AppTheme[]).map((theme) => (
          <label key={theme}>
            <input
              type="radio"
              name="app-theme"
              checked={preferences.theme === theme}
              onChange={() => setTheme(theme)}
            />
            {t(theme)}
          </label>
        ))}
      </fieldset>
      <p className={storageError ? 'settings-warning' : 'settings-help'}>
        {storageError ? t('storageWarning') : t('localNotice')}
      </p>
    </dialog>
  );
}

function localeName(locale: Locale) {
  return (
    new Intl.DisplayNames([locale], { type: 'language' }).of(locale) ?? locale
  );
}
