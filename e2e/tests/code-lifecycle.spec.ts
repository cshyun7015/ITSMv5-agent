import { test, expect } from '@playwright/test';

test.describe('Code Management Lifecycle E2E', () => {
  const BASE_URL = 'http://localhost:8082';
  const TEST_GROUP = `E2E_GRP_${Date.now()}`;
  const TEST_CODE = `E2E_CD_${Date.now()}`;
  const UPDATED_NAME = 'Updated E2E Code Name';

  test.beforeEach(async ({ page }) => {
    // 1. Login to Operator Portal
    await page.goto(BASE_URL);
    await page.fill('input[placeholder="Enter tenant ID (e.g. ocomp1)"]', 'OPER_MSP');
    await page.fill('input[placeholder="Enter administrator ID"]', 'msp');
    await page.fill('input[placeholder="••••••••"]', 'pwd');
    await page.click('button:has-text("Sign In")');
    
    // Wait for the URL to change to dashboard or home
    await page.waitForURL(BASE_URL + '/');
    
    // Wait for user state to be settled in localStorage
    await page.waitForFunction(() => localStorage.getItem('user') !== null);
    
    const userJson = await page.evaluate(() => localStorage.getItem('user'));
    console.log('Logged in user:', userJson);
    
    // 2. Navigate to Code Management
    console.log('Navigating to Code Management...');
    await page.click('text=Codes');
    
    // Wait for code management container to be visible
    await page.waitForSelector('.code-management', { state: 'visible' });
  });

  test('should perform full CRUD lifecycle for code groups and codes', async ({ page }) => {
    // --- CREATE ---
    // Monitor console logs
    page.on('console', msg => console.log(`BROWSER [${msg.type()}]: ${msg.text()}`));
    page.on('pageerror', err => console.log(`BROWSER ERROR: ${err.message}`));

    // Click Add New Group (via sidebar)
    const addGroupBtn = page.getByTestId('add-group-btn');
    await addGroupBtn.scrollIntoViewIfNeeded();
    await addGroupBtn.waitFor({ state: 'visible' });
    
    console.log('Clicking add group button via Playwright...');
    await addGroupBtn.click({ force: true });
    
    // Wait a bit and check
    await page.waitForTimeout(1000);
    
    // Fallback: JS Click if drawer still not visible
    if (!(await page.getByTestId('code-drawer-content').isVisible())) {
      console.log('Drawer still not visible, attempting direct JS click...');
      await page.evaluate(() => {
        const btn = document.querySelector('[data-testid="add-group-btn"]') as HTMLElement;
        if (btn) btn.click();
      });
    }
    
    // Wait for drawer to be visible
    await expect(page.getByTestId('code-drawer-content')).toBeVisible();
    
    const drawerTitle = await page.locator('.drawer-header__title').innerText();
    console.log('Drawer title found:', drawerTitle);
    
    await expect(page.locator('.drawer-header__title')).toHaveText(/Create New Group/i);

    console.log(`Filling form: Group=${TEST_GROUP}, Code=${TEST_CODE}`);
    // Fill Group ID and other fields
    await page.fill('#groupId', TEST_GROUP);
    await page.fill('#codeId', TEST_CODE);
    await page.fill('#codeName', 'Initial E2E Code');
    
    console.log('Clicking save button...');
    await page.getByTestId('save-code-btn').click();

    // Verify Success Toast and selection
    console.log('Waiting for success toast...');
    await page.locator('.toast-item').first().waitFor({ state: 'visible', timeout: 10000 });
    await expect(page.locator('.toast-item')).toContainText(/created/i);
    
    console.log('Verifying group appears in sidebar and selecting it...');
    const groupItem = page.getByTestId(`group-item-${TEST_GROUP}`);
    await groupItem.scrollIntoViewIfNeeded();
    await groupItem.click();
    
    console.log('Verifying header title...');
    await expect(page.locator('.header-title')).toContainText(`Group: ${TEST_GROUP}`);

    // --- READ ---
    // Verify the code is in the list
    const codeRow = page.getByTestId(`code-row-${TEST_CODE}`);
    await codeRow.waitFor({ state: 'visible' });
    await expect(codeRow).toBeVisible();
    await expect(codeRow).toContainText('Initial E2E Code');

    // --- UPDATE ---
    // Click Edit button in the row
    await page.getByTestId(`edit-btn-${TEST_CODE}`).click();
    await expect(page.getByTestId('code-drawer-content')).toBeVisible();
    await expect(page.locator('.drawer-header__title')).toHaveText('Edit Code');

    // Update the name
    await page.fill('#codeName', UPDATED_NAME);
    await page.getByTestId('save-code-btn').click();

    // Verify Success Toast and updated name
    console.log('Waiting for update toast (attached)...');
    const toastLocator = page.locator('.toast-item').first();
    await toastLocator.waitFor({ state: 'attached', timeout: 10000 });
    const toastText = await toastLocator.innerText();
    console.log('Toast found in DOM:', toastText);
    await expect(toastLocator).toContainText(/updated/i);
    await expect(codeRow).toContainText(UPDATED_NAME);

    // --- DELETE CODE ---
    // Click Delete button in the row
    await page.getByTestId(`delete-btn-${TEST_CODE}`).click();
    await expect(page.locator('.custom-confirm-modal')).toBeVisible();
    await page.click('.custom-confirm-modal button:has-text("Confirm")');

    // Verify Success Toast and disappearance
    await page.locator('.toast-item').first().waitFor({ state: 'visible', timeout: 10000 });
    await expect(page.locator('.toast-item')).toContainText(/deleted/i);
    await expect(codeRow).not.toBeVisible();

    // Verify the group implicitly disappears from the sidebar since it has no codes left
    await expect(page.getByTestId(`group-item-${TEST_GROUP}`)).not.toBeVisible();
  });
});

