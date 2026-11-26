import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript(() => localStorage.setItem('gantry:locale:v1', 'zh-CN'));
await page.goto('http://127.0.0.1:5174/', { waitUntil: 'networkidle' });
await page.getByLabel('搜索').fill('机械');
await page.waitForTimeout(500);
await page.locator('.template-card:has(.template-film)').filter({ hasNotText: 'TRS-01' }).first().click();
await page.waitForSelector('.builder');
const scroller = page.locator('.device-screen .site-scroll');
await scroller.evaluate((node) => {
  const hero = node.querySelector('[data-slot-id="hero"]');
  node.scrollTo({ top: (hero?.offsetHeight ?? node.clientHeight) * 0.55 });
});
await page.waitForTimeout(900);
const info = await page.locator('.device-screen video').first().evaluate((v) => ({
  src: v.currentSrc || v.src,
  duration: v.duration,
  currentTime: v.currentTime,
  paused: v.paused,
}));
console.log(JSON.stringify(info));
await page.screenshot({ path: 'E:/asd/gantry-studio/frontend/screenshots/builder-generated-video.png' });
await browser.close();
