import { readFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';

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
  await page.getByRole('button', { name: `使用模板 ${name}` }).click();
  await expect(page.locator('.builder')).toBeVisible();
  await expect(page.locator('.device-screen .site-root')).toBeVisible();
}

test.describe('template gallery', () => {
  test('shows thirty templates and filters by market, industry, style and search', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('为工业');
    await expect(page.locator('.template-card')).toHaveCount(30);

    await page.getByRole('button', { name: /^国际市场/ }).click();
    await expect(page.locator('.template-card')).toHaveCount(10);
    await expect(page.locator('.template-card').first()).toContainText('ATLAS');
    await page.getByRole('button', { name: /^中国市场/ }).click();
    await expect(page.locator('.template-card')).toHaveCount(20);

    const marketFilters = page.locator('.filter-row').filter({ hasText: '市场' });
    const industryFilters = page.locator('.filter-row').filter({ hasText: '行业' });
    await marketFilters.getByRole('button', { name: /^全部/ }).click();
    await page.getByRole('button', { name: /^玻璃与器皿/ }).click();
    await expect(page.locator('.template-card')).toHaveCount(2);
    await expect(page.locator('.result-count')).toHaveText('02 / 30');
    await expect(page.locator('.template-card').first()).toContainText('熔光玻璃');

    await industryFilters.getByRole('button', { name: /^全部/ }).click();
    await page.getByRole('button', { name: /^工业编辑/ }).click();
    await expect(page.locator('.template-card')).toHaveCount(5);

    await page.getByRole('button', { name: /^全部/ }).first().click();
    await page.getByLabel('搜索模板').fill('TRS-01');
    await expect(page.locator('.template-card')).toHaveCount(1);
    await expect(page.locator('.template-card')).toContainText('桁架精工');

    await page.getByLabel('搜索模板').fill('不存在的模板');
    await expect(page.locator('.library-empty')).toBeVisible();
    await page.getByRole('button', { name: '重置筛选' }).click();
    await expect(page.locator('.template-card')).toHaveCount(30);
  });

  test('gallery has no horizontal overflow on a phone viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.locator('.gallery-headline')).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
    await expect(page.locator('.template-card')).toHaveCount(30);
  });
});

test.describe('builder', () => {
  test('edits content, switches theme and device, previews and exports HTML', async ({
    page,
  }, testInfo) => {
    await page.goto('/');
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

  test('all thirty templates open with eight complete sections', async ({ page }) => {
    test.setTimeout(240_000);
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
