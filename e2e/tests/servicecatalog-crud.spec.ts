import { test, expect } from '@playwright/test';

test.describe('Service Catalog CRUD E2E Test', () => {
  test.beforeEach(async ({ page }) => {
    // 1. 운영자 계정으로 로그인 (MSP_CORE)
    await page.goto('/');
    await page.fill('input[placeholder="Enter administrator ID"]', 'admin');
    await page.fill('input[type="password"]', 'password');
    await page.click('button:has-text("Sign In")');

    // 2. 서비스 카탈로그 선택 (Global Catalog 메뉴)
    await page.click('text=Global Catalog');
    await expect(page.locator('h2')).toContainText('Catalog & Template Governance');
  });

  test('서비스 카탈로그 생성, 수정, 삭제 시나리오', async ({ page }) => {
    // --- 3. 신규 서비스 생성 ---
    await page.click('[data-testid="add-template-card"]');

    // 서비스 명 입력
    await page.fill('label:has-text("Service Name") >> .. >> input', '공인 인증서 교체');

    // 카테고리 선택 (Software & Licenses)
    await page.selectOption('label:has-text("Category") >> .. >> select', { label: 'Software & Licenses' });

    // --- 폼 빌더 작업 ---
    // 첫 번째 필드 추가: 해당 자원명 (Text Input, Required)
    await page.click('button:has-text("+ Add Input Field")');
    const firstField = page.locator('.field-editor-card').nth(0);
    await firstField.locator('label:has-text("Label") >> .. >> input').fill('해당 자원명');
    await firstField.locator('input[type="checkbox"]').check();

    // 두 번째 필드 추가: 첨부 파일 (File, Required)
    await page.click('button:has-text("+ Add Input Field")');
    const secondField = page.locator('.field-editor-card').nth(1);
    await secondField.locator('label:has-text("Label") >> .. >> input').fill('첨부 파일');
    await secondField.locator('label:has-text("Type") >> .. >> select').selectOption('file');
    await secondField.locator('input[type="checkbox"]').check();

    // 저장 버튼 클릭
    page.on('dialog', dialog => dialog.accept()); // 알림창 확인
    await page.click('[data-testid="save-schema-btn"]');

    // --- 4. 생성 확인 ---
    await expect(page.locator('h3:has-text("공인 인증서 교체")')).toBeVisible();

    // --- 5. 수정 시나리오 ---
    const card = page.locator('.template-card', { hasText: '공인 인증서 교체' });
    await card.locator('button[title="Edit"]').click();

    // 서비스 명 수정
    await page.fill('label:has-text("Service Name") >> .. >> input', '공인 인증서 교체를 신청합니다.');
    
    // 저장
    await page.click('[data-testid="save-schema-btn"]');

    // --- 6. 수정 확인 ---
    await expect(page.locator('h3:has-text("공인 인증서 교체를 신청합니다.")')).toBeVisible();

    // --- 7. 삭제 시나리오 ---
    const updatedCard = page.locator('.template-card', { hasText: '공인 인증서 교체를 신청합니다.' });
    await updatedCard.locator('button[title="Delete"]').click();

    // 삭제 확인
    await expect(page.locator('h3:has-text("공인 인증서 교체를 신청합니다.")')).not.toBeVisible();
  });
});
