import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import App from './App';
import StateHeader from './components/StateHeader';
import { usePreferences } from './preferences';

const CataloguePage = lazy(() => import('./CataloguePage'));
const EditorPage = lazy(() => import('./editor/EditorEntry'));

type RouteKind = 'home' | 'catalogue' | 'editor';

export default function Root() {
  const path = window.location.pathname.replace(/\/$/, '');
  const route: RouteKind =
    path === '/editor' ? 'editor' : path === '/examples' ? 'catalogue' : 'home';
  const content =
    route === 'editor' ? (
      <EditorPage />
    ) : route === 'catalogue' ? (
      <CataloguePage />
    ) : (
      <App />
    );
  return (
    <RouteErrorBoundary key={route} route={route}>
      <Suspense fallback={<RouteLoading route={route} />}>{content}</Suspense>
    </RouteErrorBoundary>
  );
}

function RouteLoading({ route }: { route: RouteKind }) {
  const { t } = usePreferences();
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setSlow(true), 8000);
    return () => window.clearTimeout(timer);
  }, []);
  const key =
    route === 'catalogue'
      ? 'loadingCatalogue'
      : route === 'editor'
        ? 'loadingEditor'
        : 'loadingHome';
  return (
    <main className="route-state" aria-labelledby="route-state-title">
      <StateHeader />
      <section className="route-state-card">
        <div className="loading-indicator" aria-hidden="true" />
        <h1 id="route-state-title" role="status">
          {t(key)}
        </h1>
        {slow && (
          <>
            <p>{t('loadingSlow')}</p>
            <button
              className="button primary"
              onClick={() => window.location.reload()}
            >
              {t('retry')}
            </button>
          </>
        )}
      </section>
    </main>
  );
}

class RouteErrorBoundary extends Component<
  { route: RouteKind; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? <RouteFailure /> : this.props.children;
  }
}

function RouteFailure() {
  const { t } = usePreferences();
  return (
    <main className="route-state">
      <StateHeader />
      <section className="route-state-card" role="alert">
        <h1>{t('loadingFailed')}</h1>
        <div className="route-state-actions">
          <button
            className="button primary"
            onClick={() => window.location.reload()}
          >
            {t('retry')}
          </button>
          <a className="button" href="/">
            {t('backHome')}
          </a>
        </div>
      </section>
    </main>
  );
}
