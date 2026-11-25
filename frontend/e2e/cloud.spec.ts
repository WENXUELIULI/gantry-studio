import { expect, test } from '@playwright/test';

test('registers, saves a multi-page project and reopens it from cloud', async ({
  page,
}) => {
  const email = `e2e-${Date.now()}@gantry.test`;

  await page.goto('/');
  await page.getByRole('button', { name: '登录' }).click();
  await expect(page.getByRole('dialog', { name: '登录 GANTRY' })).toBeVisible();
  await page.getByRole('tab', { name: '注册' }).click();
  await page.getByLabel('称呼').fill('云端测试');
  await page.getByLabel('邮箱').fill(email);
  await page.getByLabel('密码').fill('GantryDemo123!');
  await page.getByRole('button', { name: '创建账户' }).click();
  await expect(page.getByRole('button', { name: '云端测试' })).toBeVisible();

  await page.getByRole('button', { name: /使用(此)?模板 桁架精工/ }).click();
  await expect(page.locator('.builder')).toBeVisible();

  await page.getByRole('button', { name: '添加页面' }).click();
  await expect(page.locator('.rail-pages')).toContainText('新页面 2');
  await page.getByRole('button', { name: '新页面 2' }).click();
  await page.getByText('页面设置').click();
  await page.getByLabel('页面标题').fill('产品系列');
  await page.getByLabel('页面标题').press('Enter');
  await page.getByLabel('页面路径').fill('/products');
  await page.getByLabel('页面路径').press('Enter');

  await page.getByRole('button', { name: '云端' }).click();
  await expect(page.getByText(/云端已保存/)).toBeVisible({ timeout: 15_000 });

  await page.getByRole('button', { name: '导出' }).first().click();
  const zipDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: /下载整站 ZIP/ }).click();
  expect((await zipDownload).suggestedFilename()).toMatch(/site\.zip$/);

  await page.getByRole('button', { name: '模板库' }).click();
  await page.getByRole('button', { name: '云端测试' }).click();
  await expect(page.getByRole('dialog', { name: '云端工作区' })).toBeVisible();
  await page.locator('.cloud-project').first().click();
  await expect(page.locator('.builder')).toBeVisible();
  await expect(page.locator('.rail-pages')).toContainText('产品系列');
});
