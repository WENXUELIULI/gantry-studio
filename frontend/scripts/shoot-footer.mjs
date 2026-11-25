import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript(() => localStorage.setItem('gantry:locale:v1', 'zh-CN'));
await page.goto('http://127.0.0.1:5174/', { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /使用(此)?模板 桁架精工/ }).click();
await page.waitForSelector('.builder');
await page.waitForTimeout(800);
await page.locator('.device-screen .site-scroll').evaluate((node) => {
  node.style.scrollBehavior = 'auto';
  node.scrollTop = node.scrollHeight;
  node.dispatchEvent(new Event('scroll'));
});
await page.waitForTimeout(600);
await page.screenshot({ path: 'E:/asd/gantry-studio/frontend/screenshots/footer-check.png' });
await browser.close();
console.log('footer screenshot done');
