import { readFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const PAGE_SIZE = 24;
const TEMPLATE_NAMES = [
  '桁架精工',
  '熔光玻璃',
  '货运工业',
  '基底半导体',
  '并网能源',
  '动能协作',
  '轨道仪器',
  '立面建筑',
  '铸造之夜',
  '包装产线',
  'ATLAS MACHINE WORKS',
  'NORDWERK',
  'LUMEN GLASS',
  'KISO WORKS',
  'OSLO ENERGY',
  '恒锻五金',
  '固联紧固件',
  'NORTHBOLT',
  '港联物流',
  '冷链方舟',
  'FREIGHTLINE',
  '试剂科技',
  '高分子工场',
  'HELIX CHEMICAL',
  '精工医疗',
  '无菌系统',
  'MERIDIAN MEDICAL',
  '驱动汽车',
  '精铸汽车',
  'APEX MOBILITY',
];

async function openTemplate(page: Page, name = '桁架精工') {
  await page.getByLabel('搜索').fill(name);
  await page.getByRole('button', { name: new RegExp(`使用(此)?模板 ${name}`) }).click();
  await expect(page.locator('.builder')).toBeVisible();
  await expect(page.locator('.device-screen .site-root')).toBeVisible();
}

async function register(page: Page) {
  await page.getByRole('button', { name: '登录' }).click();
  await page.getByRole('tab', { name: '注册' }).click();
  await page.getByLabel('称呼').fill('导出测试');
  await page.getByLabel('邮箱').fill(`export-${Date.now()}@gantry.test`);
  await page.getByLabel('密码').fill('GantryDemo123!');
  await page.getByRole('button', { name: '创建账户' }).click();
  await expect(page.getByRole('button', { name: '导出测试' })).toBeVisible();
}

test.describe('template gallery', () => {
  test('shows the paginated catalogue and filters by market, industry, style and search', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('为工业');
    await expect(page.locator('.template-card')).toHaveCount(PAGE_SIZE);
    await expect(page.locator('.result-count')).toHaveText('715 / 715');

    await page.getByRole('button', { name: /^国际市场/ }).click();
    await expect(page.locator('.template-card')).toHaveCount(PAGE_SIZE);
    await expect(page.locator('.template-card').first()).toContainText('ATLAS');
    await page.getByRole('button', { name: /^中国市场/ }).click();
    await expect(page.locator('.template-card')).toHaveCount(PAGE_SIZE);

    const marketFilters = page.locator('.filter-row').filter({ hasText: '市场' });
    const industryFilters = page.locator('.filter-row').filter({ hasText: '行业' });
    await marketFilters.getByRole('button', { name: /^全部/ }).click();
    await page.getByRole('button', { name: /^玻璃与器皿/ }).click();
    await expect(page.locator('.template-card')).toHaveCount(PAGE_SIZE);
    await expect(page.locator('.result-count')).toHaveText('55 / 715');
    await expect(page.locator('.template-card').first()).toContainText('熔光玻璃');

    await industryFilters.getByRole('button', { name: /^全部/ }).click();
    await page.getByRole('button', { name: /^工业编辑/ }).click();
    await expect(page.locator('.template-card')).toHaveCount(PAGE_SIZE);

    await page.getByRole('button', { name: /^全部/ }).first().click();
    await page.getByLabel('搜索').fill('TRS-01');
    await expect(page.locator('.template-card')).toHaveCount(1);
    await expect(page.locator('.template-card')).toContainText('桁架精工');

    await page.getByLabel('搜索').fill('不存在的模板');
    await expect(page.locator('.library-empty')).toBeVisible();
    await page.getByRole('button', { name: '重置筛选' }).click();
    await expect(page.locator('.template-card')).toHaveCount(PAGE_SIZE);
  });

  test('previews film templates on hover', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('搜索').fill('工业编辑风');
    const card = page.locator('.template-card:has(.template-film)').first();
    await expect(card).toBeVisible();
    await card.hover();
    const video = card.locator('video');
    await expect(video).toHaveClass(/is-previewing/);
    await expect
      .poll(() => video.evaluate((node) => (node as HTMLVideoElement).paused))
      .toBe(false);
  });

  test('allows resizing long process step titles', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('搜索').fill('GLS-WC-04');
    await page.locator('.template-card').first().click();
    await expect(page.locator('.builder')).toBeVisible();

    await page.locator('.rail-section').filter({ hasText: '交付流程' }).click();
    await page.waitForTimeout(1000);
    const processGroup = page
      .locator('.inspector-group')
      .filter({ hasText: '流程 / PROCESS' });
    await expect(processGroup).toBeVisible();
    const firstStep = processGroup.locator('.item-card').first();
    const title = firstStep.getByLabel('标题');
    await expect(title).toHaveJSProperty('tagName', 'TEXTAREA');
    await expect(title).toHaveAttribute('rows', '2');

    const canvasTitle = page.locator('[data-slot-id="process"] .section-title').first();
    await expect(canvasTitle).toContainText('From drawing');
    const box = await canvasTitle.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThan(280);
  });

  test('opens a generated industry-by-style combination', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('搜索').fill('工业编辑风 · 第');
    await expect(page.locator('.template-card').first()).toBeVisible();
    await page.locator('.template-card').first().click();
    await expect(page.locator('.section-slot')).toHaveCount(8);
    await expect(page.locator('.device-screen h1').first()).not.toBeEmpty();
    const overflow = await page.locator('.device-screen .site-scroll').evaluate(
      (node) => node.scrollWidth - node.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(2);
  });

  test('switches to Arabic and mirrors the interface', async ({ page }) => {    await page.goto('/');
    await page.locator('.locale-trigger').click();
    await page.getByRole('option', { name: /العربية/ }).click();
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('مواقع');
    await expect(page.locator('.template-card')).toHaveCount(PAGE_SIZE);
  });

  test('gallery has no horizontal overflow on a phone viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.locator('.gallery-headline')).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
    await expect(page.locator('.template-card')).toHaveCount(PAGE_SIZE);
  });
});

test.describe('blank site', () => {
  test('starts from an empty canvas and builds a hero, section and footer', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '从空白开始' }).first().click();
    await page.getByLabel('项目名称 / NAME').fill('空白测试工厂');
    await page.getByRole('button', { name: '进入空白画布' }).click();

    await expect(page.locator('.blank-stage')).toBeVisible();
    await expect(page.locator('.blank-hero-grid button')).toHaveCount(7);
    await expect(page.locator('.rail-section')).toHaveCount(0);

    await page.getByRole('button', { name: '视频长镜头' }).click();
    await expect(page.locator('.rail-section')).toHaveCount(1);

    await page.getByRole('button', { name: '添加区块' }).click();
    await page.getByRole('button', { name: '能力矩阵 · 卡片' }).click();
    await expect(page.locator('.rail-section')).toHaveCount(2);
    await expect
      .poll(() =>
        page
          .locator('.device-screen .site-scroll')
          .evaluate((node) => node.scrollTop),
      )
      .toBeGreaterThan(100);

    await page.getByRole('button', { name: '添加区块' }).click();
    await page.getByRole('button', { name: '页脚' }).click();
    await expect(page.locator('.rail-section')).toHaveCount(3);
  });
});

test.describe('builder', () => {
  test('requires login before generating or exporting', async ({ page }) => {
    await page.goto('/');
    await openTemplate(page);
    await page.getByRole('button', { name: '导出' }).first().click();
    await expect(page.getByText('生成与导出需要登录')).toBeVisible();
    await page.getByRole('button', { name: '下载单文件 HTML' }).click();
    await expect(page.getByRole('dialog', { name: '登录 GANTRY' })).toBeVisible();
  });

  test('edits content, switches theme and device, previews and exports HTML', async ({
    page,
  }, testInfo) => {
    await page.goto('/');
    await register(page);
    await openTemplate(page);

    const title = page.locator('.device-screen .hero-title[data-editable="true"]');
    await expect(title).toContainText(/0\.01 mm/i);

    await title.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.type('0.01 毫米的执念');
    await page.keyboard.press('Tab');
    await expect(title).toHaveText('0.01 毫米的执念');

    await page.getByRole('button', { name: '撤销' }).click();
    await expect(title).toContainText(/0\.01 mm/i);

    await page.getByRole('button', { name: /主题/ }).click();
    await page.getByRole('button', { name: /^熔融玻璃/ }).click();
    await expect(page.getByText('熔融玻璃 / molten-glass')).toBeVisible();

    await page.getByRole('button', { name: '手机视图' }).click();
    const shell = page.locator('.device-shell[data-device="mobile"]');
    await expect(shell).toBeVisible();
    const box = await shell.boundingBox();
    expect(box?.width).toBeLessThanOrEqual(392);

    await page.getByRole('button', { name: '预览' }).click();
    await expect(page.getByRole('dialog', { name: '站点预览' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: '站点预览' })).toBeHidden();

    await page.getByRole('button', { name: '导出' }).first().click();
    await expect(page.getByText('HTML / JSON / SINGLE FILE')).toBeVisible();

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /下载单文件 HTML/ }).click();
    const download = await downloadPromise;
    const source = await download.path();
    expect(source).toBeTruthy();
    const html = readFileSync(source!, 'utf8');
    expect(html).toContain('0.01');
    expect(html).toContain('data:image/jpeg;base64');
    expect(html).not.toContain('undefined');
    expect(html).toContain('data-site-scroll');

    const output = path.join(testInfo.outputDir, 'exported-site.html');
    await download.saveAs(output);
    const exported = await page.context().newPage();
    await exported.goto(`file:///${output.replace(/\\/g, '/')}`);
    await expect(exported.locator('h1').first()).toContainText('0.01');
    await expect(exported.locator('.section-slot')).toHaveCount(8);
    await exported.close();
  });

  test('adds a page to navigation and opens it from the site canvas', async ({
    page,
  }) => {
    await page.goto('/');
    await openTemplate(page);

    await page.getByRole('button', { name: '添加页面' }).click();
    await expect(page.locator('.rail-pages button.is-active')).toContainText(
      '新页面 2',
    );

    await page.locator('.rail-pages button').first().click();
    const pageLink = page
      .locator('.device-screen .site-links a')
      .filter({ hasText: '新页面 2' });
    await expect(pageLink).toBeVisible();
    await pageLink.click();
    await expect(page.locator('.rail-pages button.is-active')).toContainText(
      '新页面 2',
    );
  });

  test('reflects canvas edits in the inspector and keeps one undo step', async ({ page }) => {
    await page.goto('/');
    await openTemplate(page);

    const title = page.locator('.device-screen .hero-title[data-editable="true"]');
    const titleField = page.getByLabel('主标题 / TITLE');
    await expect(titleField).toHaveValue(/0\.01 mm/i);

    await title.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.type('画布改的标题');
    await expect(titleField).toHaveValue(/画布改的标题/);

    await title.evaluate((el) => (el as HTMLElement).blur());
    await page.getByRole('button', { name: '撤销' }).click();
    await expect(title).toContainText(/0\.01 mm/i);
  });

  test('reverts the canvas when undo is clicked while editing', async ({ page }) => {
    await page.goto('/');
    await openTemplate(page);

    const title = page.locator('.device-screen .hero-title[data-editable="true"]');
    await title.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.type('撤销前的新标题');
    await expect(title).toContainText('撤销前的新标题');

    await page.getByRole('button', { name: '撤销', exact: true }).click();
    await expect(title).toContainText(/0\.01 mm/i);
  });

  test('updates the canvas while typing in the inspector', async ({ page }) => {
    await page.goto('/');
    await openTemplate(page);
    await page.locator('.rail-section').nth(2).click();

    const title = page
      .locator('.inspector .field')
      .filter({ hasText: '标题' })
      .locator('input')
      .first();
    await title.fill('实时同步的标题');

    await expect(
      page.locator('.device-screen .capability-title').first(),
    ).toHaveText('实时同步的标题');
  });

  test('routes the inquiry CTA to a configured page instead of a section', async ({
    page,
  }) => {
    await page.goto('/');
    await openTemplate(page);
    await page.getByRole('button', { name: '添加页面' }).click();
    await page.locator('.rail-pages button').first().click();

    await page.getByRole('button', { name: '站点' }).click();
    const target = page.getByLabel('询价按钮目标');
    const option = target
      .locator('option')
      .filter({ hasText: '新页面 2' })
      .first();
    await target.selectOption((await option.getAttribute('value')) ?? '');

    await page.locator('.device-screen .site-nav-cta').click();
    await expect(page.locator('.rail-pages button.is-active')).toContainText(
      '新页面 2',
    );
  });

  test('keeps the language menu above the canvas navigation', async ({ page }) => {
    await page.goto('/');
    await openTemplate(page);

    await page.locator('.builder-topbar .locale-trigger').click();
    const menu = page.locator('.builder-topbar .locale-menu');
    await expect(menu).toBeVisible();
    const box = await menu.boundingBox();
    expect(box).toBeTruthy();

    const hitMenu = await page.evaluate(
      ({ x, y }) => Boolean(document.elementFromPoint(x, y)?.closest('.locale-menu')),
      { x: box!.x + box!.width / 2, y: box!.y + 24 },
    );
    expect(hitMenu).toBe(true);
    await page.keyboard.press('Escape');
  });

  test('edits section item copy directly on the canvas', async ({ page }) => {
    await page.goto('/');
    await openTemplate(page);

    const item = page.locator('.device-screen .capability-title').first();
    await item.scrollIntoViewIfNeeded();
    await item.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.type('画布直改的能力项');
    await page.keyboard.press('Tab');

    await expect(item).toHaveText('画布直改的能力项');
  });

  test('keeps the selected section visible while editing inspector fields', async ({
    page,
  }) => {
    await page.goto('/');
    await openTemplate(page);

    const mediaType = page.getByRole('combobox', { name: '媒体类型' });
    await mediaType.scrollIntoViewIfNeeded();
    await mediaType.focus();

    const header = page.locator('.inspector-title').first();
    await expect(header).toContainText('首屏');
    await expect
      .poll(() => header.evaluate((node) => getComputedStyle(node).position))
      .toBe('sticky');
    const box = await header.boundingBox();
    expect(box?.y ?? 999).toBeLessThan(190);
  });

  test('returns to the gallery first and resumes the local draft', async ({
    page,
  }) => {
    await page.goto('/');
    await openTemplate(page);
    await expect(page.locator('.builder')).toBeVisible();

    await page.reload();
    await expect(page.locator('.gallery')).toBeVisible();
    await expect(page.locator('.builder')).toHaveCount(0);

    await page.getByRole('button', { name: /继续上次编辑/ }).click();
    await expect(page.locator('.builder')).toBeVisible();
    await expect(page.locator('.rail-section')).toHaveCount(8);
  });

  test('scrolls the canvas to the section when an inspector field is focused', async ({
    page,
  }) => {
    await page.goto('/');
    await openTemplate(page);

    const scroller = page.locator('.device-screen .site-scroll');
    await scroller.evaluate((node) => node.scrollTo({ top: 1200 }));
    await expect
      .poll(() => scroller.evaluate((node) => node.scrollTop))
      .toBeGreaterThan(1000);

    await page.getByRole('combobox', { name: '媒体类型' }).focus();
    await expect
      .poll(() => scroller.evaluate((node) => node.scrollTop))
      .toBeLessThan(200);
    await expect(page.locator('.rail-section.is-selected')).toContainText(
      '首屏',
    );
  });

  test('scrolls the canvas to the section selected in the rail', async ({ page }) => {
    await page.goto('/');
    await openTemplate(page);

    const scroller = page.locator('.device-screen .site-scroll');
    await page.locator('.rail-section').nth(3).click();

    await expect
      .poll(() => scroller.evaluate((node) => node.scrollTop))
      .toBeGreaterThan(100);

    const offset = await scroller.evaluate((node) => {
      const target = node.querySelector('[data-slot-id="products"]');
      return target instanceof HTMLElement ? target.offsetTop : -1;
    });
    expect(offset).toBeGreaterThan(0);
    await expect
      .poll(() => scroller.evaluate((node) => node.scrollTop))
      .toBeGreaterThan(offset - 80);
  });

  test('navigates sections from the mobile menu', async ({ page }) => {
    await page.goto('/');
    await openTemplate(page);
    await page.getByRole('button', { name: '手机视图' }).click();

    await page.locator('.device-screen .site-menu-button').click();
    await page.locator('.device-screen .site-mobile-menu a[href="#products"]').click();

    const scroller = page.locator('.device-screen .site-scroll');
    await expect
      .poll(() => scroller.evaluate((node) => node.scrollTop))
      .toBeGreaterThan(100);
    await expect(page.locator('.rail-section').nth(3)).toHaveClass(/is-selected/);
  });

  test('opens a second page from the mobile menu', async ({ page }) => {
    await page.goto('/');
    await openTemplate(page);
    await page.locator('.rail-page-add').click();
    await page.locator('.rail-pages button').first().click();
    await page.getByRole('button', { name: '手机视图' }).click();

    await page.locator('.device-screen .site-menu-button').click();
    await page.locator('.device-screen .site-mobile-menu a[href="/page-2"]').click();

    await expect(page.locator('.rail-pages button.is-active')).toContainText('新页面 2');
  });

  test('syncs the left rail when the canvas scrolls', async ({ page }) => {
    await page.goto('/');
    await openTemplate(page);

    const scroller = page.locator('.device-screen .site-scroll');
    const offset = await scroller.evaluate((node) => {
      const target = node.querySelector('[data-slot-id="products"]');
      return target instanceof HTMLElement ? target.offsetTop : 0;
    });
    await scroller.evaluate((node, top) => node.scrollTo({ top }), offset + 24);

    await expect(page.locator('.rail-section').nth(3)).toHaveClass(/is-selected/);
  });

  test('shows field explanations in a viewport-safe tooltip', async ({ page }) => {
    await page.goto('/');
    await openTemplate(page);

    await page.locator('.inspector .field-help').first().hover();
    const tooltip = page.locator('.field-tooltip');
    await expect(tooltip).toBeVisible();
    const box = await tooltip.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(1440);
  });

  test('scrolls the canvas from a top navigation link', async ({ page }) => {
    await page.goto('/');
    await openTemplate(page);

    const scroller = page.locator('.device-screen .site-scroll');
    await page.locator('.device-screen .site-links a[href="#products"]').click();

    await expect
      .poll(() => scroller.evaluate((node) => node.scrollTop))
      .toBeGreaterThan(300);
    await expect(page.locator('.device-screen [data-slot-id="products"]')).toHaveClass(
      /is-selected/,
    );
  });

  test('keeps the video-story hero copy inside the section gutter', async ({ page }) => {
    await page.goto('/');
    await openTemplate(page, '铸造之夜');

    const frame = page.locator('.device-screen').first();
    const copy = page.locator('.device-screen .hero--story .hero-title');
    await expect(copy).toBeVisible();
    const frameBox = await frame.boundingBox();
    const copyBox = await copy.boundingBox();
    expect(frameBox).not.toBeNull();
    expect(copyBox).not.toBeNull();
    expect(copyBox!.x - frameBox!.x).toBeGreaterThan(18);
  });

  test('keeps one film behind hero, numbers, capability and products', async ({ page }) => {    await page.goto('/');
    await openTemplate(page, '铸造之夜');

    await expect(page.locator('.device-screen .video-scene')).toBeVisible();
    const scroller = page.locator('.device-screen .site-scroll');
    await page.waitForFunction(() => {
      const video = document.querySelector('.device-screen .video-scene video');
      return video instanceof HTMLVideoElement && video.readyState >= 2;
    });

    await scroller.evaluate((node) => {
      const scene = node.querySelector('.video-scene');
      if (!(scene instanceof HTMLElement)) return;
      node.scrollTo({ top: (scene.offsetHeight - node.clientHeight) * 0.55 });
    });

    await expect
      .poll(() =>
        page
          .locator('.device-screen .video-scene video')
          .evaluate((node) => (node as HTMLVideoElement).currentTime),
      )
      .toBeGreaterThan(1);
    await expect(
      page.locator('.device-screen .site-links a[aria-current="true"]'),
    ).toHaveText('数字');
  });

  test('keeps footer copy aligned with the section gutter', async ({ page }) => {
    await page.goto('/');
    await openTemplate(page);

    const spacing = await page
      .locator('.device-screen .site-section--footer .section-inner')
      .evaluate((node) => {
        const section = node.closest('.site-section');
        if (!(section instanceof HTMLElement)) return null;
        const brand = node.querySelector('.footer-brand');
        if (!(brand instanceof HTMLElement)) return null;
        return {
          paddingLeft: Number.parseFloat(getComputedStyle(node).paddingLeft),
          offset: brand.getBoundingClientRect().left - section.getBoundingClientRect().left,
        };
      });

    expect(spacing).not.toBeNull();
    expect(spacing!.paddingLeft).toBeGreaterThan(10);
    expect(spacing!.offset).toBeGreaterThan(10);
  });

  test('routes keyframes to video time and highlights the target section', async ({ page }) => {
    await page.goto('/');
    await openTemplate(page);

    const target = page.getByLabel('关键帧 1 栏目');
    await target.selectOption('products');

    await expect(page.locator('.device-screen .hero-chapter').first()).toContainText('四个系列');
    await expect(
      page.locator('.device-screen .site-links a[aria-current="true"]'),
    ).toHaveText('产品');
  });

  test('scroll position drives the hero video timeline', async ({ page }) => {
    await page.goto('/');
    await openTemplate(page);

    const video = page.locator('.device-screen video').first();
    await expect(video).toBeVisible();
    await page.waitForFunction(
      () => {
        const node = document.querySelector('.device-screen video');
        return node instanceof HTMLVideoElement && node.readyState >= 2;
      },
      undefined,
      { timeout: 15_000 },
    );

    await page.locator('.device-screen .site-scroll').evaluate((node) => {
      node.scrollTop = node.clientHeight * 0.9;
      node.dispatchEvent(new Event('scroll'));
    });
    await page.waitForTimeout(450);
    const time = await video.evaluate((node) => (node as HTMLVideoElement).currentTime);
    expect(time).toBeGreaterThan(0.15);
  });

  test('cropper adjusts a product focal point and zoom', async ({ page }) => {
    await page.goto('/');
    await openTemplate(page);
    await page.getByText('产品系列', { exact: true }).first().click();
    await page.getByRole('button', { name: '打开裁剪' }).first().click();

    const dialog = page.getByRole('dialog', { name: '裁剪图片' });
    await expect(dialog).toBeVisible();
    await dialog.getByLabel('缩放').fill('1.6');
    await dialog.getByLabel('横向焦点').fill('30');
    await dialog.getByRole('button', { name: '应用焦点' }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByLabel('缩放').first()).toHaveValue('1.6');
  });

  test('all curated templates open with eight complete sections', async ({ page }) => {
    test.setTimeout(300_000);
    await page.goto('/');

    for (const name of TEMPLATE_NAMES) {
      await openTemplate(page, name);
      await expect(page.locator('.section-slot')).toHaveCount(8);
      await expect(page.locator('.device-screen h1').first()).not.toBeEmpty();
      const overflow = await page.locator('.device-screen .site-scroll').evaluate(
        (node) => node.scrollWidth - node.clientWidth,
      );
      expect(overflow, `${name} should not overflow horizontally`).toBeLessThanOrEqual(2);
      await page.getByRole('button', { name: '模板库' }).click();
      await expect(page.locator('.gallery')).toBeVisible();
    }
  });
});
