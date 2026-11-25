import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://127.0.0.1:5174/', { waitUntil: 'networkidle' });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle' });
await page.getByRole('button', { name: '使用模板 桁架精工' }).click();
await page.waitForSelector('.builder');
await page.waitForTimeout(500);
await page.locator('.rail-section', { hasText: '产品系列' }).click();
await page.waitForTimeout(300);

const open = page.getByRole('button', { name: '打开裁剪' }).first();
await open.scrollIntoViewIfNeeded();
await open.click();
await page.waitForSelector('[role="dialog"][aria-label="裁剪图片"]');
await page.waitForTimeout(400);
await page.screenshot({ path: 'E:/asd/gantry-studio/screenshots/builder-cropper.png' });

await page
  .getByRole('dialog', { name: '裁剪图片' })
  .getByLabel('缩放')
  .fill('1.45');
await page.waitForTimeout(250);
await page.getByRole('button', { name: /应用焦点/ }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: 'E:/asd/gantry-studio/screenshots/builder-cropper-applied.png' });

await browser.close();
console.log('cropper screenshots done');
