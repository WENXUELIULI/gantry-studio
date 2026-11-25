import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const out = 'E:/asd/gantry-studio/screenshots';
mkdirSync(out, { recursive: true });
const targets = [
  ['HDW-16', '恒锻五金', 'builder-hdw.png'],
  ['LGC-19', '港联物流', 'builder-lgc.png'],
  ['CHM-22', '试剂科技', 'builder-chm.png'],
  ['MED-25', '精工医疗', 'builder-med.png'],
  ['AUT-28', '驱动汽车', 'builder-aut.png'],
  ['APX-30', 'APEX MOBILITY', 'builder-apx.png'],
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://127.0.0.1:5174/', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);

for (const [code, name, file] of targets) {
  await page.getByLabel('搜索模板').fill(code);
  await page.waitForTimeout(200);
  await page.getByRole('button', { name: `使用模板 ${name}` }).click();
  await page.waitForSelector('.builder');
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${out}/${file}` });
  await page.getByRole('button', { name: '模板库' }).click();
  await page.waitForTimeout(300);
}

await browser.close();
console.log('30-template samples done');
