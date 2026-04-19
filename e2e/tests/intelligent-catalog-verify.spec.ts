import { test, expect } from '@playwright/test';

test('Verify Intelligent Conditional Catalog Logic', async ({ page, context }) => {
  // 1. Create Template in Operator Portal
  await page.goto('http://localhost:3000');
  await page.fill('input[placeholder*="Enter tenant ID"]', 'OPER_MSP');
  await page.fill('input[placeholder*="Enter administrator ID"]', 'msp');
  await page.fill('input[placeholder="••••••••"]', 'pwd');
  await page.click('button:has-text("Sign In")');

  // Navigate to Catalog
  await page.click('nav >> text=Service Catalog');
  await page.click('[data-testid="add-template-card"]');

  const timestamp = Date.now();
  const templateName = `Intelligent Laptop ${timestamp}`;

  // Fill Header
  await page.fill('input[placeholder*="e.g. AWS S3"]', templateName);
  
  // Design Form
  await page.click('button:has-text("Add Input Field")');
  const field1 = page.locator('.field-editor-card').first();
  await field1.locator('input[type="text"]').fill('Brand');
  await field1.locator('select').first().selectOption('select');
  await field1.locator('input[placeholder*="AWS, Azure"]').fill('Apple, Dell');

  await page.click('button:has-text("Add Input Field")');
  const field2 = page.locator('.field-editor-card').nth(1);
  await field2.locator('input[type="text"]').first().fill('Mac Model');
  await field2.locator('select').first().selectOption('select');
  await field2.locator('input[placeholder*="AWS, Azure"]').fill('Pro, Air');
  
  // Select first available field as dependency
  await field2.locator('.logic-select').selectOption({ index: 1 }); 
  await field2.locator('.logic-val-input').fill('Apple');

  // Save Template
  await page.click('button:has-text("Generate & Save Schema")');
  
  // Wait for the success toast to disappear so it doesn't block clicks
  await page.waitForSelector('text=New service template has been registered', { state: 'hidden', timeout: 10000 });
  await page.waitForTimeout(2000);

  // 1.5 Deploy to Tenant
  const templateCard = page.locator('.template-card', { hasText: templateName }).last();
  await templateCard.scrollIntoViewIfNeeded();
  await templateCard.locator('button:has-text("Deploy to Tenant")').click({ force: true });
  
  await page.waitForSelector('.deploy-overlay', { state: 'visible' });
  await page.click('button:has-text("Select All")');
  await page.click('button:has-text("Save & Sync Deployments")');
  
  // Wait for deployment success toast or just enough time for DB sync
  await page.waitForTimeout(5000);

  // 2. Test in User Portal
  const p2 = await context.newPage();
  await p2.goto('http://localhost:3002');
  await p2.waitForLoadState('networkidle');
  await p2.reload(); // Ensure fresh catalog
  await p2.waitForLoadState('networkidle');

  await p2.fill('input[placeholder*="Tenant ID"]', 'OCOMP1');
  await p2.fill('input[placeholder*="User ID"]', 'user1');
  await p2.fill('input[placeholder="••••••••"]', 'pwd');
  await p2.click('button:has-text("Sign In")');

  // Wait for the specific template to appear in the grid
  const catalogItem = p2.locator('.catalog-card', { hasText: templateName });
  await catalogItem.waitFor({ state: 'visible', timeout: 15000 });
  await catalogItem.click();
  
  // Verify field is hidden initially
  await expect(p2.locator('label:has-text("Mac Model")')).not.toBeVisible();
  await p2.screenshot({ path: '/Users/cshyun/Workspace/ITSMv5-agent/artifacts/catalog_user_hidden.png' });

  // Select Apple
  await p2.selectOption('select.dynamic-select', 'Apple');
  
  // Verify field appears
  await expect(p2.locator('label:has-text("Mac Model")')).toBeVisible();
  await p2.screenshot({ path: '/Users/cshyun/Workspace/ITSMv5-agent/artifacts/catalog_user_visible.png' });

  // Select Dell
  await p2.selectOption('select.dynamic-select', 'Dell');
  
  // Verify field disappears
  await expect(p2.locator('label:has-text("Mac Model")')).not.toBeVisible();
});
