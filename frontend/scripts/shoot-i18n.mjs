import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const out = 'E:/asd/gantry-studio/frontend/screenshots';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, locale: 'zh-CN' });
await page.goto('http://127.0.0.1:5174/', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);

await page.locator('.locale-trigger').first().click();
await page.waitForTimeout(250);
await page.screenshot({ path: `${out}/locale-menu.png` });
await page.getByRole('option', { name: /العربية/ }).click();
await page.waitForTimeout(500);
await page.screenshot({ path: `${out}/gallery-ar.png` });

await page.locator('.locale-trigger').click();
await page.waitForTimeout(250);
await page.screenshot({ path: `${out}/locale-menu-ar.png` });
await page.keyboard.press('Escape');

await page.locator('.template-card').first().click();
await page.waitForSelector('.builder');
await page.waitForTimeout(700);
await page.screenshot({ path: `${out}/builder-ar.png` });

await page.locator('.inspector-tabs button').nth(1).click();
await page.waitForTimeout(300);
const localeSelect = page.getByLabel('站点语言');
if (await localeSelect.count()) {
  await localeSelect.selectOption('ar');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${out}/builder-ar-site.png` });
}

await browser.close();
console.log('i18n screenshots done');
