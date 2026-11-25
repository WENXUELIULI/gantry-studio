import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const out = 'E:/asd/gantry-studio/frontend/screenshots';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://127.0.0.1:5174/', { waitUntil: 'networkidle' });
await page.waitForTimeout(600);

await page.getByRole('button', { name: '登录' }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${out}/auth-dialog.png` });

const email = `shot-${Date.now()}@gantry.test`;
await page.getByRole('tab', { name: '注册' }).click();
await page.getByLabel('称呼').fill('韩工');
await page.getByLabel('邮箱').fill(email);
await page.getByLabel('密码').fill('GantryDemo123!');
await page.getByRole('button', { name: '创建账户' }).click();
await page.waitForTimeout(700);

await page.getByRole('button', { name: '使用模板 桁架精工' }).click();
await page.waitForSelector('.builder');
await page.waitForTimeout(900);
await page.getByRole('button', { name: '添加页面' }).click();
await page.waitForTimeout(600);
await page.screenshot({ path: `${out}/builder-pages.png` });

await page.getByRole('button', { name: '云端' }).click();
await page.waitForTimeout(1800);
await page.getByRole('button', { name: '模板库' }).click();
await page.getByRole('button', { name: '韩工' }).click();
await page.waitForTimeout(700);
await page.screenshot({ path: `${out}/cloud-projects.png` });

await browser.close();
console.log('cloud screenshots done');
