import { test, expect } from '@playwright/test';

test.describe('CMDB CI Management CRUD E2E', () => {
  const testCIName = `E2E-TEST-SERVER-${Date.now()}`;
  const updatedCIName = `${testCIName}-UPDATED`;

  test.beforeEach(async ({ page }) => {
    // 1. Login with oper1 (ocomp1 tenant) - to ensure tenant match for CRUD
    await page.goto('http://localhost:3000'); 
    await page.fill('input[placeholder="Enter tenant ID (e.g. ocomp1)"]', 'ocomp1');
    await page.fill('input[placeholder="Enter administrator ID"]', 'oper1');
    await page.fill('input[placeholder="••••••••"]', 'pwd');
    await page.click('button:has-text("Sign In")');

    // 2. Wait for Dashboard to be ready
    await expect(page.locator('button:has-text("Sign Out")')).toBeVisible({ timeout: 15000 });
    
    // Navigate to CIs using robust text selector
    const cisBtn = page.locator('button:has-text("CIs")');
    await cisBtn.waitFor({ state: 'visible' });
    await cisBtn.click();
    
    // Wait for CI page title 
    await expect(page.locator('h2:has-text("Configuration Items (CIs)")')).toBeVisible({ timeout: 15000 });
  });

  test('should Register, Inquiry, Update, and Delete a CI', async ({ page }) => {
    // --- CREATE ---
    console.log('Starting Registration...');
    await page.click('button.btn-register');
    await expect(page.locator('text=Register New Asset')).toBeVisible();

    // Select ucomp1 which is available for oper1 as a customer
    await page.selectOption('select.tenant-select', 'ucomp1');
    await page.fill('input[placeholder="e.g. Production Web Server 01"]', testCIName);
    await page.fill('input[placeholder="S/N or Asset ID"]', 'SN-E2E-12345');
    await page.fill('input[placeholder="e.g. Seoul-DC-A / Rack 12"]', 'E2E-LOCATION');
    
    // Submit register and wait for modal to close
    const registerBtn = page.locator('button.btn-primary:has-text("Register Asset")');
    await registerBtn.click();
    await expect(page.locator('text=Register New Asset')).not.toBeVisible({ timeout: 10000 });
    
    // Switch tenant filter to ucomp1 to see the registered CI
    console.log('Switching tenant filter to ucomp1...');
    const filterContainer = page.locator('.tenant-filter');
    await expect(filterContainer).toBeVisible({ timeout: 15000 });
    
    const filterSelect = filterContainer.locator('select.filter-select');
    await filterSelect.selectOption('ucomp1');
    
    // Wait for list to reload (loading spinner should appear and disappear)
    await expect(page.locator('.loading')).not.toBeVisible({ timeout: 10000 });

    // Success check - should be in the list
    const newItem = page.locator(`.ci-item:has-text("${testCIName}")`);
    await expect(newItem).toBeVisible({ timeout: 15000 });

    // --- INQUIRY & UPDATE ---
    console.log('Starting Update...');
    await page.click(`.ci-item:has-text("${testCIName}")`);
    await expect(page.locator('text=Configuration Item Detail')).toBeVisible();

    // Update name
    await page.fill('input[placeholder="e.g. Production Web Server 01"]', updatedCIName);
    await page.selectOption('select.status-select', 'MAINTENANCE');

    // Submit update
    await page.click('button.btn-primary:has-text("Update Asset")');

    // Verification in list
    await expect(page.locator(`.ci-item:has-text("${updatedCIName}")`)).toBeVisible();
    await expect(page.locator(`.ci-item:has-text("${updatedCIName}")`).locator('.status-pill.MAINTENANCE')).toBeVisible();

    // --- DELETE ---
    console.log('Starting Deletion...');
    await page.click(`.ci-item:has-text("${updatedCIName}")`);
    
    // Setup dialog handler for confirm()
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Are you sure you want to retire this asset');
      await dialog.accept();
    });

    await page.click('button.btn-delete:has-text("Delete Asset")');

    // Final verification: should be gone from the list
    await expect(page.locator(`.ci-item:has-text("${updatedCIName}")`)).not.toBeVisible({ timeout: 5000 });
    console.log('E2E Life-cycle completed successfully.');
  });
});
