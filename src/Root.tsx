import { lazy, Suspense } from 'react';
import App from './App';

const EditorPage = lazy(() => import('./editor/EditorPage'));

export default function Root() {
  return (
    <Suspense fallback={<p role="status">Chargement de l’éditeur…</p>}>
      {window.location.pathname.replace(/\/$/, '') === '/editor' ? (
        <EditorPage />
      ) : (
        <App />
      )}
    </Suspense>
  );
}
