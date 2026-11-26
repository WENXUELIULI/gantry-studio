import { lazy, Suspense, useEffect, useState } from 'react';
import { useBuilderStore } from './store/builder';
import { useProjectStore } from './store/project';
import { readSession, type AuthSession } from './lib/api';
import { AuthDialog } from './components/auth/AuthDialog';
import { CloudProjects } from './components/cloud/CloudProjects';
import { BlankStartDialog } from './components/gallery/BlankStartDialog';
import { createBlankDocument, type BlankDocumentOptions } from './lib/site';

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
  const openBlankDocument = useBuilderStore((state) => state.openBlankDocument);
  const resumeDraft = useBuilderStore((state) => state.resumeDraft);
  const [session, setSession] = useState<AuthSession | null>(() => readSession());
  const [authOpen, setAuthOpen] = useState(false);
  const [blankOpen, setBlankOpen] = useState(false);
  const [cloudOpen, setCloudOpen] = useState(false);

  useEffect(() => {
    document.title =
      view === 'builder' && doc
        ? `${doc.name} — GANTRY 编辑器`
        : 'GANTRY / 桁架 — 官网铸造厂';
  }, [view, doc]);

  useEffect(() => {
    const openAuth = () => setAuthOpen(true);
    window.addEventListener('gantry:auth', openAuth);
    return () => window.removeEventListener('gantry:auth', openAuth);
  }, []);

  const handleOpen = (templateId: string) => {
    openTemplate(templateId);
    const next = useBuilderStore.getState().doc;
    if (next) useProjectStore.getState().startFromDocument(next);
  };

  const handleBlank = (options: BlankDocumentOptions) => {
    const doc = createBlankDocument(options);
    setBlankOpen(false);
    openBlankDocument(doc);
    useProjectStore.getState().startFromDocument(doc);
  };

  const handleResume = () => {
    resumeDraft();
    if (doc) useProjectStore.getState().startFromDocument(doc);
  };

  return (
    <Suspense fallback={<Loading />}>
      {view === 'builder' && doc ? (
        <Builder />
      ) : (
        <Gallery
          onOpen={handleOpen}
          onBlank={() => setBlankOpen(true)}
          hasDraft={Boolean(doc)}
          draftName={doc?.name}
          onResume={handleResume}
          user={session?.user ?? null}
          onCloud={() => (session ? setCloudOpen(true) : setAuthOpen(true))}
          onAuth={() => setAuthOpen(true)}
        />
      )}
      <BlankStartDialog
        open={blankOpen}
        onClose={() => setBlankOpen(false)}
        onCreate={handleBlank}
      />
      <AuthDialog
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthenticated={(next) => {
          setSession(next);
          window.dispatchEvent(new CustomEvent('gantry:session', { detail: next }));
          setAuthOpen(false);
        }}
      />
      <CloudProjects
        open={cloudOpen}
        onClose={() => setCloudOpen(false)}
        onNeedAuth={() => {
          setCloudOpen(false);
          setAuthOpen(true);
        }}
      />
    </Suspense>
  );
}
