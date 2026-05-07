import { test, expect } from '@playwright/test';

describe("緊急要求入力画面", () => {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseURL}/login`);
    await page.fill('#username', 'testuser');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('SCEN-232: 全項目入力で緊急申請送信成功', async ({ page }) => {
    // SCEN-232
    await page.goto(`${baseURL}/emergency-request`);
    await page.selectOption('#equipment', 'microscope-001');
    await page.fill('#start-datetime', '2024-12-20T09:00');
    await page.fill('#end-datetime', '2024-12-20T17:00');
    await page.fill('#emergency-reason', '実験データの緊急解析が必要なため');
    await page.fill('#contact-phone', '03-1234-5678');
    await page.fill('#contact-email', 'test@example.com');
    await page.selectOption('#approver', 'approver001');
    await page.click('#submit-emergency-request');
    await expect(page.locator('.success-message')).toContainText('緊急申請が正常に送信されました');
  });

  test('SCEN-233: 緊急度選択で画面表示変更', async ({ page }) => {
    // SCEN-233
    await page.goto(`${baseURL}/emergency-request`);
    await page.selectOption('#priority-level', 'high');
    await expect(page.locator('.priority-indicator')).toHaveClass(/high-priority/);
    await page.selectOption('#priority-level', 'medium');
    await expect(page.locator('.priority-indicator')).toHaveClass(/medium-priority/);
    await page.selectOption('#priority-level', 'low');
    await expect(page.locator('.priority-indicator')).toHaveClass(/low-priority/);
  });

  test('SCEN-234: 機器選択で利用可能時間表示', async ({ page }) => {
    // SCEN-234
    await page.goto(`${baseURL}/emergency-request`);
    await page.click('#equipment');
    await expect(page.locator('#equipment option')).toHaveCount.greaterThan(0);
    await page.selectOption('#equipment', 'microscope-001');
    await expect(page.locator('#available-times')).toBeVisible();
    await page.selectOption('#equipment', 'analyzer-002');
    await expect(page.locator('#available-times')).toHaveText(/利用可能時間/);
  });

  test('SCEN-235: 日時入力で期間計算表示', async ({ page }) => {
    // SCEN-235
    await page.goto(`${baseURL}/emergency-request`);
    await page.fill('#start-datetime', '2024-01-15T09:00');
    await page.fill('#end-datetime', '2024-01-17T17:00');
    await expect(page.locator('#duration-display')).toContainText('2日8時間');
  });

  test('SCEN-236: 添付ファイルアップロード成功', async ({ page }) => {
    // SCEN-236
    await page.goto(`${baseURL}/emergency-request`);
    await page.fill('#subject', '緊急実験申請');
    await page.fill('#content', '緊急実験の詳細内容');
    await page.setInputFiles('#attachment', 'test-files/sample.pdf');
    await expect(page.locator('#file-list')).toContainText('sample.pdf');
    await page.click('#submit-request');
    await expect(page.locator('.success-message')).toBeVisible();
  });

  test('SCEN-237: 下書き保存で一時保存完了', async ({ page }) => {
    // SCEN-237
    await page.goto(`${baseURL}/emergency-request`);
    await page.selectOption('#equipment', 'microscope-001');
    await page.fill('#purpose', '研究用途');
    await page.click('#save-draft');
    await expect(page.locator('.save-message')).toContainText('下書きを保存しました');
    await page.reload();
    await expect(page.locator('#equipment')).toHaveValue('microscope-001');
  });

  test('SCEN-238: 承認者選択で通知先設定', async ({ page }) => {
    // SCEN-238
    await page.goto(`${baseURL}/emergency-request`);
    await page.fill('#equipment-info', '顕微鏡の緊急使用');
    await page.selectOption('#approver', 'approver001');
    await expect(page.locator('#notification-settings')).toBeVisible();
    await page.check('#email-notification');
    await expect(page.locator('#approver-email')).toHaveValue('approver001@example.com');
    await page.click('#submit-request');
  });

  test('SCEN-239: 必須項目未入力でエラー表示', async ({ page }) => {
    // SCEN-239
    await page.goto(`${baseURL}/emergency-request`);
    await page.fill('#optional-field', '任意項目の入力');
    await page.click('#submit-request');
    await expect(page.locator('.error-message')).toContainText('必須項目が入力されていません');
  });

  test('SCEN-240: 緊急理由未入力で送信失敗', async ({ page }) => {
    // SCEN-240
    await page.goto(`${baseURL}/emergency-request`);
    await page.selectOption('#equipment', 'microscope-001');
    await page.fill('#start-datetime', '2024-12-20T09:00');
    await page.click('#submit-request');
    await expect(page.locator('.error-message')).toContainText('緊急理由の入力は必須です');
  });

  test('SCEN-241: 過去日時入力でエラー表示', async ({ page }) => {
    // SCEN-241
    await page.goto(`${baseURL}/emergency-request`);
    await page.selectOption('#equipment', 'microscope-001');
    await page.fill('#purpose', '研究用途');
    await page.fill('#desired-datetime', '2023-12-01T10:00');
    await page.click('#submit-request');
    await expect(page.locator('.error-message')).toContainText('過去の日時は指定できません');
  });

  test('SCEN-242: 終了日時が開始前でエラー', async ({ page }) => {
    // SCEN-242
    await page.goto(`${baseURL}/emergency-request`);
    await page.selectOption('#equipment', 'microscope-001');
    await page.fill('#start-datetime', '2024-12-15T10:00');
    await page.fill('#end-datetime', '2024-12-15T09:00');
    await page.fill('#emergency-reason', '緊急実験');
    await page.click('#submit-request');
    await expect(page.locator('.error-message')).toContainText('終了日時は開始日時より後に設定してください');
  });

  test('SCEN-243: 不正電話番号でバリデーション', async ({ page }) => {
    // SCEN-243
    await page.goto(`${baseURL}/emergency-request`);
    await page.fill('#name', 'テストユーザー');
    await page.fill('#email', 'test@example.com');
    await page.fill('#phone', 'abc-def-ghij');
    await page.click('#submit-request');
    await expect(page.locator('#phone-error')).toContainText('正しい電話番号を入力してください');
  });

  test('SCEN-244: 大容量ファイルでアップロード失敗', async ({ page }) => {
    // SCEN-244
    await page.goto(`${baseURL}/emergency-request`);
    await page.fill('#equipment-name', '顕微鏡');
    await page.fill('#usage-datetime', '2024-12-20T10:00');
    await page.setInputFiles('#file-upload', 'test-files/large-file.zip');
    await page.click('#upload-btn');
    await expect(page.locator('.error-message')).toContainText('ファイルサイズが上限を超えています');
  });

  test('SCEN-245: 利用不可機器選択でエラー', async ({ page }) => {
    // SCEN-245
    await page.goto(`${baseURL}/emergency-request`);
    await page.selectOption('#equipment', 'unavailable-equipment');
    await page.fill('#usage-datetime', '2024-12-20T10:00');
    await page.fill('#purpose', '研究用途');
    await page.click('#submit-request');
    await expect(page.locator('.error-message')).toContainText('選択された機器は現在利用できません');
  });

  test('SCEN-246: 緊急理由文字数上限でエラー', async ({ page }) => {
    // SCEN-246
    await page.goto(`${baseURL}/emergency-request`);
    const longText = 'あ'.repeat(501);
    await page.fill('#emergency-reason', longText);
    await page.click('#submit-request');
    await expect(page.locator('.error-message')).toContainText('文字数上限を超えています');
  });

  test('SCEN-247: 実験概要最大文字数入力', async ({ page }) => {
    // SCEN-247
    await page.goto(`${baseURL}/emergency-request`);
    const maxText = 'あ'.repeat(500);
    await page.fill('#experiment-overview', maxText);
    await expect(page.locator('#experiment-overview')).toHaveValue(maxText);
    await page.click('#save-btn');
    await expect(page.locator('.success-message')).toBeVisible();
  });

  test('SCEN-248: 利用時間最大期間で申請', async ({ page }) => {
    // SCEN-248
    await page.goto(`${baseURL}/emergency-request`);
    await page.selectOption('#equipment', 'microscope-001');
    await page.fill('#purpose', '研究用途');
    await page.fill('#start-datetime', '2024-12-20T09:00');
    await page.fill('#end-datetime', '2024-12-27T17:00');
    await page.click('#submit-request');
    await expect(page.locator('.success-message')).toBeVisible();
  });

  test('SCEN-249: 電話番号最小桁数で入力', async ({ page }) => {
    // SCEN-249
    await page.goto(`${baseURL}/emergency-request`);
    await page.fill('#phone', '0312345678');
    await page.fill('#equipment', '顕微鏡');
    await page.fill('#purpose', '研究用途');
    await page.click('#confirm-btn');
    await expect(page.locator('.error-message')).not.toBeVisible();
  });

  test('SCEN-250: ファイル容量上限ギリギリ', async ({ page }) => {
    // SCEN-250
    await page.goto(`${baseURL}/emergency-request`);
    await page.fill('#equipment-name', '顕微鏡');
    await page.fill('#purpose', '研究用途');
    await page.setInputFiles('#file-attachment', 'test-files/9.99mb-file.pdf');
    await expect(page.locator('#file-list')).toContainText('9.99mb-file.pdf');
    await page.click('#submit-request');
    await expect(page.locator('.success-message')).toBeVisible();
  });

  test('SCEN-251: 同時刻重複予約で競合警告', async ({ page, context }) => {
    // SCEN-251
    await page.goto(`${baseURL}/emergency-request`);
    await page.selectOption('#equipment', 'microscope-001');
    await page.fill('#datetime', '2024-12-20T10:00');
    await page.fill('#reason', '緊急実験');
    
    const page2 = await context.newPage();
    await page2.goto(`${baseURL}/login`);
    await page2.fill('#username', 'testuser2');
    await page2.fill('#password', 'password123');
    await page2.click('button[type="submit"]');
    await page2.goto(`${baseURL}/emergency-request`);
    await page2.selectOption('#equipment', 'microscope-001');
    await page2.fill('#datetime', '2024-12-20T10:00');
    await page2.fill('#reason', '緊急実験2');
    
    await page.click('#confirm-reservation');
    await page2.click('#confirm-reservation');
    await expect(page2.locator('.warning-message')).toContainText('選択した時間帯は既に予約されています');
  });
});