import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const out = 'E:/asd/gantry-studio/frontend/screenshots';
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await page.goto('http://127.0.0.1:5174/', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);

await page.screenshot({ path: `${out}/gallery-top.png` });

const sections = ['#templates', '#how', '#system'];
for (const selector of sections) {
  const section = page.locator(selector);
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${out}/gallery-${selector.slice(1)}.png` });
}

await page.locator('.gallery').evaluate((el) => el.scrollTo({ top: 0 }));
await page.waitForTimeout(300);

await page.getByRole('button', { name: '使用模板 桁架精工' }).click();
await page.waitForSelector('.builder');
await page.waitForTimeout(1200);
await page.screenshot({ path: `${out}/builder-desktop.png` });

await page.getByRole('button', { name: '手机视图' }).click();
await page.waitForTimeout(700);
await page.screenshot({ path: `${out}/builder-mobile.png` });

await page.getByRole('button', { name: '预览' }).click();
await page.waitForSelector('.preview-modal');
await page.waitForTimeout(900);
await page.screenshot({ path: `${out}/preview-mobile.png` });

await page.getByRole('button', { name: '桌面', exact: true }).click();
await page.waitForTimeout(500);
await page.getByRole('button', { name: '关闭预览' }).click();
await page.locator('.canvas').scrollIntoViewIfNeeded();

await page.getByRole('button', { name: '主题', exact: true }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${out}/builder-theme.png` });

await page.getByRole('button', { name: '导出', exact: true }).first().click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${out}/builder-export.png` });

await browser.close();
console.log('screenshots done');
