import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript(() => localStorage.setItem('gantry:locale:v1', 'zh-CN'));
await page.goto('http://127.0.0.1:5174/', { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /使用(此)?模板 桁架精工/ }).click();
await page.waitForSelector('.builder');
await page.getByText('关键帧 / KEYFRAMES').scrollIntoViewIfNeeded();
await page.screenshot({ path: 'E:/asd/gantry-studio/frontend/screenshots/builder-keyframes.png' });

const scroller = page.locator('.device-screen .site-scroll');
await scroller.evaluate((node) => {
  const hero = node.querySelector('[data-slot-id="hero"]');
  node.scrollTo({ top: (hero?.offsetHeight ?? node.clientHeight) * 0.45 });
});
await page.waitForTimeout(500);
await page.screenshot({ path: 'E:/asd/gantry-studio/frontend/screenshots/builder-keyframe-active.png' });
await browser.close();
console.log('keyframe screenshots done');
