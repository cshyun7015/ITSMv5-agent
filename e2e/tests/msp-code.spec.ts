import { test, expect } from '@playwright/test';

test.describe('MSP Code Management E2E', () => {
  test.beforeEach(async ({ page }) => {
    // 실제 로컬 개발 서버가 실행 중이라고 가정하고 접속
    await page.goto('/');
  });

  test('앱 타이틀 및 서브타이틀이 정상적으로 표시되는지 확인', async ({ page }) => {
    await expect(page.locator('.header__title')).toHaveText('MSP Admin Command Center');
    await expect(page.locator('.header__subtitle')).toContainText('Premium Developer Code Management');
  });

  test('코드 리스트 데이타가 Glassmorphism 테이블에 렌더링되는지 확인', async ({ page }) => {
    const rows = page.locator('.code-list__row');
    // Mock 데이터 4개가 존재하는지 확인
    await expect(rows).toHaveCount(4);
    
    // 첫 번째 행의 내용 확인
    await expect(rows.first()).toContainText('TICKET_PRIORITY');
    await expect(rows.first()).toContainText('Critical');
  });

  test('Add New Code 버튼 클릭 시 Drawer(서랍)가 열리는지 확인', async ({ page }) => {
    await page.click('text=Add New Code');
    
    // Drawer가 열렸는지 확인
    const drawer = page.locator('.drawer-content');
    await expect(drawer).toBeVisible();
    await expect(page.locator('.drawer-header__title')).toHaveText('Create New Code');
  });

  test('Edit 버튼 클릭 시 해당 코드 정보가 포함된 Drawer가 열리는지 확인', async ({ page }) => {
    // 첫 번째 행의 Edit 버튼 클릭
    await page.locator('.code-list__row').first().locator('text=Edit').click();
    
    const drawerTitle = page.locator('.drawer-header__title');
    await expect(drawerTitle).toHaveText('Edit Code');
  });
});
