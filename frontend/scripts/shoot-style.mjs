import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://127.0.0.1:5174/', { waitUntil: 'networkidle' });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle' });
await page.getByRole('button', { name: '使用模板 桁架精工' }).click();
await page.waitForSelector('.builder');
await page.waitForTimeout(600);

await page.locator('.rail-section', { hasText: '产品系列' }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: 'E:/asd/gantry-studio/screenshots/builder-style.png' });

await page.getByLabel('区块布局').selectOption('split');
await page.getByLabel('区块列数').selectOption('2');
await page.getByLabel('区块表面').selectOption('accent');
await page.waitForTimeout(700);
await page.locator('.site-scroll').first().evaluate((el) => {
  const target = el.querySelector('[data-slot-id="products"]');
  if (target instanceof HTMLElement) el.scrollTop = target.offsetTop - 12;
});
await page.waitForTimeout(500);
await page.screenshot({ path: 'E:/asd/gantry-studio/screenshots/builder-style-applied.png' });

await browser.close();
console.log('style screenshots done');
