import { lazy, Suspense, useEffect } from 'react';
import { useBuilderStore } from './store/builder';

const Gallery = lazy(() =>
  import('./components/gallery/Gallery').then((module) => ({
    default: module.Gallery,
  })),
);
const Builder = lazy(() =>
  import('./components/builder/Builder').then((module) => ({
    default: module.Builder,
  })),
);

function Loading() {
  return (
    <div className="app-loading" role="status">
      <span className="mono">GANTRY / LOADING WORKSPACE</span>
    </div>
  );
}

export default function App() {
  const view = useBuilderStore((state) => state.view);
  const doc = useBuilderStore((state) => state.doc);
  const openTemplate = useBuilderStore((state) => state.openTemplate);

  useEffect(() => {
    document.title =
      view === 'builder' && doc
        ? `${doc.name} — GANTRY 编辑器`
        : 'GANTRY / 桁架 — 官网铸造厂';
  }, [view, doc]);

  return (
    <Suspense fallback={<Loading />}>
      {view === 'builder' && doc ? (
        <Builder />
      ) : (
        <Gallery onOpen={openTemplate} />
      )}
    </Suspense>
  );
}
