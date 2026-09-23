import { lazy, Suspense } from 'react';
import App from './App';

const CataloguePage = lazy(() => import('./CataloguePage'));
const EditorPage = lazy(() => import('./editor/EditorEntry'));

export default function Root() {
  const path = window.location.pathname.replace(/\/$/, '');
  return (
    <Suspense fallback={<p role="status">Chargement de l’éditeur…</p>}>
      {path === '/editor' ? (
        <EditorPage />
      ) : path === '/examples' ? (
        <CataloguePage />
      ) : (
        <App />
      )}
    </Suspense>
  );
}
