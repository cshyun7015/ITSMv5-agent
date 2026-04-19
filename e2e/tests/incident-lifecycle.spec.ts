import { test, expect } from '@playwright/test';

test.describe('Incident Lifecycle E2E', () => {
  test.beforeEach(async ({ page }) => {
    // 운영사 로그인 처리
    await page.goto('/');
    await page.fill('input[placeholder*="Enter tenant ID"]', 'OPER_MSP');
    await page.fill('input[placeholder*="Enter administrator ID"]', 'msp');
    await page.fill('input[placeholder="••••••••"]', 'pwd');
    await page.click('button:has-text("Sign In")');
    
    // 대시보드 로딩 대기 (SPA이므로 URL 대신 헤더 텍스트로 확인)
    await expect(page.locator('h1')).toContainText('Global Operations Center');
    // Ensure we are fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('인시던트 등록부터 종료까지 전체 생애주기 검증', async ({ page }) => {
    const testTitle = `E2E Test Incident - ${Date.now()}`;
    
    // 1. 인시던트 메뉴 진입
    const incidentMenuBtn = page.getByRole('button', { name: /Incidents/i });
    await incidentMenuBtn.click();
    await expect(page.locator('h2')).toContainText('Active Incidents');

    // 2. 인시던트 등록 (NEW)
    const registerBtn = page.getByRole('button', { name: /Register Incident/i });
    await registerBtn.click();
    
    // 모달 헤더로 대기 및 애니메이션 시간 확보
    const modalHeader = page.locator('h2', { hasText: 'Manual Incident Registration' });
    await expect(modalHeader).toBeVisible();
    await page.waitForTimeout(500); // 0.3s animation + buffer
    
    // 폼 입력
    await page.selectOption('select.modern-input:near(:text("Target Org"))', { index: 1 });
    await page.fill('input[placeholder*="ERP, VPN, DB"]', 'E2E Test Service');
    await page.fill('input[placeholder*="Database Connectivity Issue"]', testTitle);
    await page.fill('textarea[placeholder*="Provide context"]', 'This is an automated E2E test description.');
    
    // Category, Impact, Urgency
    await page.selectOption('select.modern-input:near(:text("Category Code"))', { index: 1 });
    
    // 명시적으로 버튼을 기다리고 클릭
    const submitBtn = page.getByRole('button', { name: 'Deploy Incident' });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();
    
    // 모달이 닫힐 때까지 대기
    await expect(page.locator('.incident-form-modal')).toBeHidden({ timeout: 10000 });
    
    // 등록 확인 (목록 갱신 대기)
    await expect(page.locator('h3', { hasText: testTitle })).toBeVisible({ timeout: 10000 });
    const incidentCard = page.locator('.incident-item', { hasText: testTitle });
    await expect(incidentCard.locator('.status-pill.NEW')).toBeVisible();

    // 3. 인시던트 상세 진입 및 수락 (ASSIGNED)
    await incidentCard.click();
    await expect(page.locator('h1')).toContainText(testTitle);
    await expect(page.locator('.value-badge.NEW')).toBeVisible();

    await page.click('button.btn-assign');
    await expect(page.locator('.value-badge', { hasText: 'ASSIGNED' })).toBeVisible({ timeout: 10000 });
    
    // 상태 변경 후 백엔드 플러시 및 UI 정착을 위해 잠깐 대기
    await page.waitForTimeout(1000);

    // 4. 작업 노트 추가 (자동 IN_PROGRESS 전이 확인)
    await page.fill('textarea[placeholder*="Add a work note"]', 'Investigating the issue...');
    await page.click('button.btn-add-note');
    
    // 히스토리에 노트 추가 확인 및 상태 변경 로그 확인 (DB 확정 지점)
    await expect(page.locator('.timeline-item.work_note', { hasText: 'Investigating the issue...' })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.timeline-item.status_change', { hasText: 'Auto-transitioned to IN_PROGRESS' })).toBeVisible({ timeout: 10000 });
    
    // 배지 상태 최종 확인 (toPass()를 통한 UI/Back 정합성 동기화)
    await expect(async () => {
      await expect(page.locator('.value-badge', { hasText: 'IN_PROGRESS' })).toBeVisible({ timeout: 2000 });
    }).toPass({ timeout: 15000 });

    // 5. 해결 처리 (RESOLVED)
    await page.fill('textarea.resolution-textarea', 'Issue resolved by restarting the service.');
    await page.click('button.btn-resolve');
    
    await expect(page.locator('.value-badge.RESOLVED')).toBeVisible();
    await expect(page.locator('.resolution-view')).toContainText('Issue resolved');

    // 6. 인시던트 종료 (CLOSED)
    await page.click('button.btn-close-action');
    
    await expect(page.locator('.value-badge.CLOSED')).toBeVisible();
    await expect(page.locator('.btn-close-action')).not.toBeVisible(); // 종료된 인시던트는 버튼 숨김
    
    // 최종 확인: 대시보드 복귀 후 리스트에서 (닫힌 인시던트는 기본 필터에서 제외될 수 있음)
    await page.click('button.back-link');
    await page.waitForTimeout(1000); // 목록 갱신 대기
  });
});
