import { test, expect } from '@playwright/test';

test.describe('CI Lifecycle E2E Test', () => {
  const testCIName = `CI-LIFECYCLE-${Date.now()}`;
  const testSN = `SN-LIFE-${Math.floor(Math.random() * 10000)}`;

  test.beforeEach(async ({ page }) => {
    // 1. Login with oper1 (ocomp1 tenant)
    await page.goto('http://localhost:3000'); 
    await page.fill('input[placeholder="Enter tenant ID (e.g. ocomp1)"]', 'ocomp1');
    await page.fill('input[placeholder="Enter administrator ID"]', 'oper1');
    await page.fill('input[placeholder="••••••••"]', 'pwd');
    await page.click('button:has-text("Sign In")');

    // 2. Wait for Login Success
    await expect(page.locator('button:has-text("Sign Out")')).toBeVisible({ timeout: 15000 });
    
    // 3. Navigate to CIs
    const cisBtn = page.locator('button:has-text("CIs")');
    await cisBtn.click();
    await expect(page.locator('h2:has-text("Configuration Items (CIs)")')).toBeVisible({ timeout: 15000 });

    // 4. Ensure we are looking at Customer Company 1 (ucomp1)
    const filterSelect = page.locator('.tenant-filter select.filter-select');
    await filterSelect.selectOption('ucomp1');
    await expect(page.locator('.loading')).not.toBeVisible();
  });

  test('should go through the full lifecycle of a CI', async ({ page }) => {
    // Stage 1: Registration with ALL attributes
    console.log('Stage 1: Registering CI with all attributes...');
    await page.click('button.btn-register');
    await expect(page.locator('.modal-header h2')).toContainText('Register New Asset');

    // --- Tab: General ---
    await page.selectOption('select.tenant-select', 'ucomp1');
    await page.fill('input[placeholder="e.g. Production Web Server 01"]', testCIName);
    
    // Use target labeling for Asset Type
    await page.locator('label:has-text("Asset Type") + select').selectOption('SERVER');
    await page.selectOption('select.status-select', 'PROVISIONING');
    await page.fill('input[placeholder="S/N or Asset ID"]', testSN);
    
    // Select an owner if available (safely)
    const ownerSelect = page.locator('label:has-text("Owner / Manager") + select');
    await expect(ownerSelect).toBeVisible();
    const count = await ownerSelect.locator('option').count();
    if (count > 1) {
      await ownerSelect.selectOption({ index: 1 });
    }

    await page.fill('input[placeholder="e.g. Seoul-DC-A / Rack 12"]', 'Data Center X / Rack 7');
    await page.fill('textarea.textarea', 'Lifecycle testing for CMDB modernization extra details.');

    // --- Tab: Technical Details ---
    await page.click('button.tab-btn:has-text("Technical Details")');
    const jsonEditor = page.locator('.json-editor textarea');
    await expect(jsonEditor).toBeVisible({ timeout: 5000 });
    await jsonEditor.click(); // Focus first
    await jsonEditor.clear();
    await jsonEditor.fill(JSON.stringify({ 
      cpu: "8-core", 
      ram: "32GB", 
      os: "Ubuntu 22.04 LTS"
    }, null, 2));

    // Submit Registration
    console.log('Finalizing Registration...');
    const submitBtn = page.locator('button.btn-primary:has-text("Register Asset")');
    await submitBtn.scrollIntoViewIfNeeded();
    await submitBtn.click();
    
    console.log('Waiting for modal to close...');
    await expect(page.locator('.modal-overlay')).not.toBeVisible({ timeout: 20000 });

    // Verify it appeared in the list
    const ciItem = page.locator(`.ci-item:has-text("${testCIName}")`);
    await expect(ciItem).toBeVisible();
    await expect(ciItem.locator(`.status-pill.PROVISIONING`)).toBeVisible();

    // Stage 2: Change Status to ACTIVE
    console.log('Stage 2: Moving to ACTIVE status...');
    await ciItem.click();
    await page.selectOption('select.status-select', 'ACTIVE');
    await page.click('button.btn-primary:has-text("Update Asset")');
    await expect(page.locator('.modal-overlay')).not.toBeVisible();
    await expect(ciItem.locator('.status-pill.ACTIVE')).toBeVisible();

    // Stage 3: Change Status to MAINTENANCE
    console.log('Stage 3: Moving to MAINTENANCE status...');
    await ciItem.click();
    await page.selectOption('select.status-select', 'MAINTENANCE');
    await page.click('button.btn-primary:has-text("Update Asset")');
    await expect(page.locator('.modal-overlay')).not.toBeVisible();
    await expect(ciItem.locator('.status-pill.MAINTENANCE')).toBeVisible();

    // Stage 4: Change Status to RETIRED
    console.log('Stage 4: Moving to RETIRED status...');
    await ciItem.click();
    await page.selectOption('select.status-select', 'RETIRED');
    await page.click('button.btn-primary:has-text("Update Asset")');
    await expect(page.locator('.modal-overlay')).not.toBeVisible();
    await expect(ciItem.locator('.status-pill.RETIRED')).toBeVisible();

    // Stage 5: Hard Deletion
    console.log('Stage 5: Performing Hard Deletion...');
    await ciItem.click();
    
    // Check History Tab (Log)
    await page.click('button.tab-btn:has-text("Log")');
    await expect(page.locator('.history-list')).toBeVisible();

    // Click Delete Asset
    await page.getByRole('button', { name: 'Delete Asset' }).click();
    
    // Select Hard Delete option
    const hardDeleteOption = page.locator('label').filter({ hasText: 'Hard Delete (Physical)' });
    await expect(hardDeleteOption).toBeVisible();
    await hardDeleteOption.click();
    
    // Confirm Deletion
    const confirmBtn = page.getByRole('button', { name: 'Confirm Deletion' });
    await confirmBtn.click();
    
    // Final Verification: Should be gone from the list completely
    await expect(page.locator(`.ci-item:has-text("${testCIName}")`)).not.toBeVisible({ timeout: 15000 });
    console.log('Full CI lifecycle test PASSED successfully.');
  });
});
