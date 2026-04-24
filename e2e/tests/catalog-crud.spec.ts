import { test, expect } from '@playwright/test';

test.describe('Operator Catalog Management E2E', () => {
  test.beforeEach(async ({ page }) => {
    // 운영사 로그인 처리 (MSP_CORE)
    await page.goto('/');
    // 로그인 페이지에서 로그인 수행 (토큰 생성/저장을 위해)
    // 실제 환경에서는 localStorage.setItem 등으로 단축 가능하지만 정석대로 수행
    await page.fill('input[placeholder="Tenant ID"]', 'MSP_CORE');
    await page.fill('input[placeholder="Username"]', 'admin');
    await page.fill('input[placeholder="Password"]', 'password');
    await page.click('button:has-text("Sign In")');
    
    // 대시보드 로딩 대기
    await expect(page).toHaveURL(/.*MSP_CORE/);
    
    // 카탈로그 관리 메뉴 이동
    await page.click('text=Service Catalog');
  });

  test('카테고리 생성 및 수정 성공 시나리오', async ({ page }) => {
    await page.click('button:has-text("Category Master")');
    
    // 신규 생성
    await page.click('[data-testid="create-category-btn"]');
    await page.fill('input[value="📁"]', '🚀'); // Icon field
    await page.fill('label:has-text("Category Name") >> .. >> input', 'Test Category');
    await page.fill('textarea', 'Automated test category description');
    await page.click('[data-testid="save-category-btn"]');
    
    // 생성 확인
    await expect(page.locator('strong:has-text("Test Category")')).toBeVisible();
    
    // 수정
    await page.locator('.category-item', { hasText: 'Test Category' }).locator('button:has-text("Edit")').click();
    await page.fill('label:has-text("Category Name") >> .. >> input', 'Updated Tech Category');
    await page.click('[data-testid="save-category-btn"]');
    
    // 수정 확인
    await expect(page.locator('strong:has-text("Updated Tech Category")')).toBeVisible();
  });

  test('서비스 템플릿 생성 및 삭제 시나리오', async ({ page }) => {
    // 템플릿 리스트 뷰
    await page.click('button:has-text("Template Library")');
    
    // 템플릿 생성 시작
    await page.click('[data-testid="add-template-card"]');
    
    // 기본 정보 입력
    await page.fill('input[placeholder="e.g. AWS S3 Bucket Request"]', 'E2E Test Template');
    
    // 폼 빌더 작업
    await page.click('button:has-text("+ Add Input Field")');
    await page.fill('.field-editor-card input', 'Test Input Label');
    await page.click('[data-testid="save-schema-btn"]');
    
    // 템플릿 생성 확인
    await expect(page.locator('h3:has-text("E2E Test Template")')).toBeVisible();
    
    // 템플릿 삭제
    page.on('dialog', dialog => dialog.accept()); // Confirm dialog 처리
    await page.locator('.template-card', { hasText: 'E2E Test Template' }).locator('button[title="Delete"]').click();
    
    // 삭제 확인
    await expect(page.locator('h3:has-text("E2E Test Template")')).not.toBeVisible();
  });
});
