import {
  addPage,
  createProject,
  readSession,
  updatePage,
  type PageDetail,
} from './api';
import { useBuilderStore } from '../store/builder';
import { useProjectStore, type ProjectPage } from '../store/project';

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'gantry-site'
  );
}

export async function saveProjectToCloud(): Promise<{ pages: number }> {
  if (!readSession()) throw new Error('请先登录');
  const doc = useBuilderStore.getState().doc;
  if (!doc) throw new Error('没有可保存的页面');
  const project = useProjectStore.getState();
  project.syncActive(doc);

  const pages = useProjectStore.getState().pages;
  const home = pages.find((page) => page.key === 'home') ?? pages[0];
  if (!home) throw new Error('项目至少需要一页');

  let projectId = project.projectId;
  const projectName = project.projectName ?? doc.name;
  let remoteHome: PageDetail | undefined;
  let nextPages: ProjectPage[] = pages;

  if (!projectId) {
    const created = await createProject({
      name: projectName,
      slug: slugify(doc.code || doc.name),
      document: home.document as unknown as Record<string, unknown>,
    });
    projectId = created.project.id;
    const homeSummary = created.pages.find((page) => page.key === 'home') ?? created.pages[0];
    remoteHome = {
      ...homeSummary,
      document: home.document as unknown as Record<string, unknown>,
    } as PageDetail;
    nextPages = pages.map((page) =>
      page.key === home.key
        ? { ...page, remoteId: homeSummary.id, version: homeSummary.version }
        : page,
    );
  }

  const saved: ProjectPage[] = [];
  for (const page of nextPages) {
    const remoteId =
      page.key === home.key ? remoteHome?.id ?? page.remoteId : page.remoteId;
    if (!remoteId) {
      const created = await addPage(projectId, {
        title: page.title,
        path: page.path,
        document: page.document as unknown as Record<string, unknown>,
      });
      saved.push({ ...page, remoteId: created.id, version: created.version });
      continue;
    }
    if (page.key === home.key && remoteHome && page.version === 0) {
      saved.push({ ...page, remoteId: remoteHome.id, version: remoteHome.version });
      continue;
    }
    const updated = await updatePage(projectId, remoteId, {
      title: page.title,
      path: page.path,
      expectedVersion: page.version,
      document: page.document as unknown as Record<string, unknown>,
    });
    saved.push({ ...page, remoteId: updated.id, version: updated.version });
  }

  useProjectStore.getState().markSaved(saved, projectId, projectName);
  return { pages: saved.length };
}
