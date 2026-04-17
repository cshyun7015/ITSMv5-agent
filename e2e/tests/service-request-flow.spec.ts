import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Service Request with File Attachment Flow', () => {

  test('should create a catalog item with file field, submit request with file, and verify by operator', async ({ page, context }) => {
    // 1. 운영자 로그인 및 파일 필드가 포함된 카탈로그 생성
    await page.goto('http://localhost:3000');
    await page.fill('input[placeholder="Enter administrator ID"]', 'admin');
    await page.fill('input[placeholder="••••••••"]', 'password');
    await page.click('button:has-text("Sign In")');

    await page.click('text=Global Catalog');
    await page.click('text=New Service');
    
    const serviceName = `공인 인증서 교체 (E2E) ${Date.now()}`;
    await page.fill('input[placeholder="e.g. AWS S3 Bucket Request"]', serviceName);
    // 기본 카테고리(Cloud Infrastructure) 사용

    // 필드 1: 대상 서버명
    await page.click('button:has-text("Add Input Field")');
    const field1 = page.locator('.field-editor-card').last();
    await field1.locator('label:has-text("Label") + input').fill('대상 서버 명');
    await field1.locator('label:has-text("Type") + select').selectOption('text');
    await field1.locator('input[type="checkbox"]').check();

    // 필드 2: 첨부 파일
    await page.click('button:has-text("Add Input Field")');
    const field2 = page.locator('.field-editor-card').last();
    await field2.locator('label:has-text("Label") + input').fill('첨부 파일');
    await field2.locator('label:has-text("Type") + select').selectOption('file');
    await field2.locator('input[type="checkbox"]').check();

    await page.click('text=Generate & Save Schema');
    await expect(page.locator(`text=${serviceName}`)).toBeVisible();

    // 서비스 배포 (Tenant Deployment)
    const card = page.locator('.template-card').filter({ hasText: serviceName }).first();
    await card.locator('button.deploy-btn').click({ force: true });
    
    // 배포 모달 대기 및 테넌트 선택
    await page.waitForSelector('.deploy-overlay');
    await page.locator('.tenant-checkbox-item', { hasText: 'Cloud Nexus Customer' }).click(); // Click label/item to check
    await page.click('button:has-text("Deploy to 1 Tenants")');
    
    // 배포 완료 대기 (모달 닫힘 확인)
    await expect(page.locator('.deploy-overlay')).not.toBeVisible({ timeout: 10000 });

    // 2. 사용자 포탈 로그인 및 서비스 신청
    const userPage = await context.newPage();
    await userPage.goto('http://localhost:4001');
    await userPage.fill('input[placeholder="e.g. CN_TENANT_01"]', 'CN_TENANT_01');
    await userPage.fill('input[placeholder="your@email.com"]', 'user1');
    await userPage.fill('input[placeholder="••••••••"]', 'password');
    await userPage.click('button:has-text("Sign In")');

    await userPage.click('button:has-text("Service Catalog")');
    await userPage.click(`text=${serviceName}`);

    await userPage.fill('input[placeholder="Enter Request Title"]', '포탈 서버 인증서 갱신 요청');
    await userPage.fill('textarea[placeholder="Describe your request..."]', '만료 예정인 공인 인증서 교체 요청드립니다.');
    
    // 동적 필드 입력
    // 동적 필드 입력 (Placeholder 사용)
    await userPage.fill('input[placeholder="Enter 대상 서버 명..."]', 'Portal-Prod-01');
    
    // 파일 첨부
    const fileChooserPromise = userPage.waitForEvent('filechooser');
    await userPage.click('input[type="file"]');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path.join(__dirname, '../test-file.pdf'));

    await userPage.click('button:has-text("Submit Request")');
    await expect(userPage.locator('text=My Requests')).toBeVisible();
    await expect(userPage.locator('text=포탈 서버 인증서 갱신 요청')).toBeVisible();

    // 3. 운영자 포탈에서 확인 및 다운로드
    await page.bringToFront();
    await page.goto('http://localhost:3000'); // Refresh to see fulfillment board
    await page.click('text=Fulfillment');
    
    await expect(page.locator('text=포탈 서버 인증서 갱신 요청')).toBeVisible();
    await page.click('text=포탈 서버 인증서 갱신 요청');

    // 상세 화면에서 첨부 파일 확인
    await expect(page.locator('text=Attachments (1)')).toBeVisible();
    await expect(page.locator('text=test-file.pdf')).toBeVisible();

    // 다운로드 동작 확인 (클릭 시 새 창 또는 다운로드 발생)
    const downloadPromise = page.waitForEvent('download');
    await page.click('text=test-file.pdf');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('test-file.pdf');
  });
});
