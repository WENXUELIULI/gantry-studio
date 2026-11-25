import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const out = 'E:/asd/gantry-studio/frontend/screenshots';
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
await page.goto('http://127.0.0.1:5174/', { waitUntil: 'networkidle' });
await page.waitForTimeout(600);

await page.locator('#templates').scrollIntoViewIfNeeded();
await page.getByRole('button', { name: /^国际市场/ }).click();
await page.waitForTimeout(500);
await page.screenshot({ path: `${out}/gallery-global.png` });
await page.locator('.template-card').first().scrollIntoViewIfNeeded();
await page.waitForTimeout(400);
await page.screenshot({ path: `${out}/gallery-global-cards.png` });

await page.getByRole('button', { name: '使用模板 LUMEN GLASS' }).click();
await page.waitForSelector('.builder');
await page.waitForTimeout(1200);
await page.screenshot({ path: `${out}/builder-global-desktop.png` });

await page.getByRole('button', { name: '手机视图' }).click();
await page.waitForTimeout(700);
await page.screenshot({ path: `${out}/builder-global-mobile.png` });

await page.getByRole('button', { name: '预览' }).click();
await page.waitForSelector('.preview-modal');
await page.waitForTimeout(800);
await page.screenshot({ path: `${out}/preview-global-mobile.png` });

await browser.close();
console.log('global screenshots done');
