import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

describe("緊急要求入力画面", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="username"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/dashboard');
  });

  test('全項目入力で緊急申請送信成功', async ({ page }) => {
    // SCEN-232
    await page.goto(`${BASE_URL}/emergency-request`);
    await page.selectOption('[data-testid="equipment-select"]', 'microscope-001');
    await page.fill('[data-testid="start-datetime"]', '2024-12-20 09:00');
    await page.fill('[data-testid="end-datetime"]', '2024-12-20 17:00');
    await page.fill('[data-testid="emergency-reason"]', '緊急実験のため機器使用が必要です');
    await page.fill('[data-testid="contact-phone"]', '03-1234-5678');
    await page.fill('[data-testid="contact-email"]', 'emergency@example.com');
    await page.selectOption('[data-testid="approver-select"]', 'approver-001');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toContainText('緊急申請が正常に送信されました');
    await expect(page.locator('[data-testid="application-number"]')).toBeVisible();
  });

  test('緊急度選択で画面表示変更', async ({ page }) => {
    // SCEN-233
    await page.goto(`${BASE_URL}/emergency-request`);
    await page.selectOption('[data-testid="urgency-level"]', 'high');
    await expect(page.locator('[data-testid="urgency-indicator"]')).toHaveClass(/high-urgency/);
    await page.selectOption('[data-testid="urgency-level"]', 'medium');
    await expect(page.locator('[data-testid="urgency-indicator"]')).toHaveClass(/medium-urgency/);
    await page.selectOption('[data-testid="urgency-level"]', 'low');
    await expect(page.locator('[data-testid="urgency-indicator"]')).toHaveClass(/low-urgency/);
  });

  test('機器選択で利用可能時間表示', async ({ page }) => {
    // SCEN-234
    await page.goto(`${BASE_URL}/emergency-request`);
    await page.click('[data-testid="equipment-select"]');
    await expect(page.locator('[data-testid="equipment-options"]')).toBeVisible();
    await page.selectOption('[data-testid="equipment-select"]', 'microscope-001');
    await expect(page.locator('[data-testid="available-hours"]')).toContainText('利用可能時間: 9:00-18:00');
    await page.selectOption('[data-testid="equipment-select"]', 'centrifuge-002');
    await expect(page.locator('[data-testid="available-hours"]')).toContainText('利用可能時間: 24時間');
  });

  test('日時入力で期間計算表示', async ({ page }) => {
    // SCEN-235
    await page.goto(`${BASE_URL}/emergency-request`);
    await page.fill('[data-testid="start-datetime"]', '2024-01-15 09:00');
    await page.fill('[data-testid="end-datetime"]', '2024-01-17 17:00');
    await expect(page.locator('[data-testid="duration-display"]')).toContainText('2日8時間');
  });

  test('添付ファイルアップロード成功', async ({ page }) => {
    // SCEN-236
    await page.goto(`${BASE_URL}/emergency-request`);
    await page.fill('[data-testid="subject"]', '緊急実験申請');
    await page.fill('[data-testid="content"]', '緊急実験の内容');
    await page.setInputFiles('[data-testid="file-upload"]', './test-files/document.pdf');
    await expect(page.locator('[data-testid="uploaded-file"]')).toContainText('document.pdf');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toContainText('緊急要求が正常に提出されました');
  });

  test('下書き保存で一時保存完了', async ({ page }) => {
    // SCEN-237
    await page.goto(`${BASE_URL}/emergency-request`);
    await page.selectOption('[data-testid="equipment-select"]', 'microscope-001');
    await page.fill('[data-testid="purpose"]', '実験目的');
    await page.fill('[data-testid="desired-datetime"]', '2024-12-20 10:00');
    await page.click('[data-testid="draft-save-button"]');
    await expect(page.locator('[data-testid="save-message"]')).toContainText('下書きを保存しました');
    await page.reload();
    await expect(page.locator('[data-testid="equipment-select"]')).toHaveValue('microscope-001');
  });

  test('承認者選択で通知先設定', async ({ page }) => {
    // SCEN-238
    await page.goto(`${BASE_URL}/emergency-request`);
    await page.selectOption('[data-testid="equipment-select"]', 'microscope-001');
    await page.selectOption('[data-testid="approver-select"]', 'approver-001');
    await expect(page.locator('[data-testid="notification-settings"]')).toBeVisible();
    await page.check('[data-testid="email-notification"]');
    await expect(page.locator('[data-testid="approver-email"]')).toHaveValue('approver@example.com');
    await page.click('[data-testid="submit-button"]');
  });

  test('必須項目未入力でエラー表示', async ({ page }) => {
    // SCEN-239
    await page.goto(`${BASE_URL}/emergency-request`);
    await page.fill('[data-testid="optional-note"]', '任意項目のみ入力');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('必須項目が入力されていません');
  });

  test('緊急理由未入力で送信失敗', async ({ page }) => {
    // SCEN-240
    await page.goto(`${BASE_URL}/emergency-request`);
    await page.selectOption('[data-testid="equipment-select"]', 'microscope-001');
    await page.fill('[data-testid="start-datetime"]', '2024-12-20 09:00');
    await page.fill('[data-testid="end-datetime"]', '2024-12-20 17:00');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('緊急理由を入力してください');
  });

  test('過去日時入力でエラー表示', async ({ page }) => {
    // SCEN-241
    await page.goto(`${BASE_URL}/emergency-request`);
    await page.selectOption('[data-testid="equipment-select"]', 'microscope-001');
    await page.fill('[data-testid="purpose"]', '実験目的');
    await page.fill('[data-testid="desired-datetime"]', '2023-12-01 10:00');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('過去の日時は指定できません');
  });

  test('終了日時が開始前でエラー', async ({ page }) => {
    // SCEN-242
    await page.goto(`${BASE_URL}/emergency-request`);
    await page.selectOption('[data-testid="equipment-select"]', 'microscope-001');
    await page.fill('[data-testid="start-datetime"]', '2024-12-15 10:00');
    await page.fill('[data-testid="end-datetime"]', '2024-12-15 09:00');
    await page.fill('[data-testid="emergency-reason"]', '緊急実験のため');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('終了日時は開始日時より後に設定してください');
  });

  test('不正電話番号でバリデーション', async ({ page }) => {
    // SCEN-243
    await page.goto(`${BASE_URL}/emergency-request`);
    await page.fill('[data-testid="name"]', 'テスト太郎');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="phone"]', 'abc-def-ghij');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="phone-error"]')).toContainText('正しい電話番号を入力してください');
  });

  test('大容量ファイルでアップロード失敗', async ({ page }) => {
    // SCEN-244
    await page.goto(`${BASE_URL}/emergency-request`);
    await page.selectOption('[data-testid="equipment-select"]', 'microscope-001');
    await page.fill('[data-testid="start-datetime"]', '2024-12-20 09:00');
    await page.setInputFiles('[data-testid="file-upload"]', './test-files/large-file.pdf');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('ファイルサイズが上限を超えています');
  });

  test('利用不可機器選択でエラー', async ({ page }) => {
    // SCEN-245
    await page.goto(`${BASE_URL}/emergency-request`);
    await page.selectOption('[data-testid="equipment-select"]', 'unavailable-equipment');
    await page.fill('[data-testid="start-datetime"]', '2024-12-20 09:00');
    await page.fill('[data-testid="purpose"]', '実験目的');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('選択された機器は利用できません');
  });

  test('緊急理由文字数上限でエラー', async ({ page }) => {
    // SCEN-246
    await page.goto(`${BASE_URL}/emergency-request`);
    await page.fill('[data-testid="emergency-reason"]', 'a'.repeat(501));
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('文字数上限を超えています');
  });

  test('実験概要最大文字数入力', async ({ page }) => {
    // SCEN-247
    await page.goto(`${BASE_URL}/emergency-request`);
    await page.fill('[data-testid="experiment-overview"]', 'a'.repeat(1000));
    await expect(page.locator('[data-testid="experiment-overview"]')).toHaveValue('a'.repeat(1000));
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('利用時間最大期間で申請', async ({ page }) => {
    // SCEN-248
    await page.goto(`${BASE_URL}/emergency-request`);
    await page.selectOption('[data-testid="equipment-select"]', 'microscope-001');
    await page.fill('[data-testid="purpose"]', '実験目的');
    await page.fill('[data-testid="start-datetime"]', '2024-12-20 00:00');
    await page.fill('[data-testid="end-datetime"]', '2024-12-27 23:59');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toContainText('申請が完了しました');
  });

  test('電話番号最小桁数で入力', async ({ page }) => {
    // SCEN-249
    await page.goto(`${BASE_URL}/emergency-request`);
    await page.fill('[data-testid="phone"]', '0312345678');
    await page.selectOption('[data-testid="equipment-select"]', 'microscope-001');
    await page.fill('[data-testid="emergency-reason"]', '緊急実験のため');
    await page.click('[data-testid="confirm-button"]');
    await expect(page).toHaveURL(/.*\/confirm/);
  });

  test('ファイル容量上限ギリギリ', async ({ page }) => {
    // SCEN-250
    await page.goto(`${BASE_URL}/emergency-request`);
    await page.selectOption('[data-testid="equipment-select"]', 'microscope-001');
    await page.fill('[data-testid="purpose"]', '実験目的');
    await page.setInputFiles('[data-testid="file-upload"]', './test-files/max-size-file.pdf');
    await expect(page.locator('[data-testid="uploaded-file"]')).toContainText('max-size-file.pdf');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toContainText('緊急要求が送信完了しました');
  });

  test('同時刻重複予約で競合警告', async ({ page, context }) => {
    // SCEN-251
    await page.goto(`${BASE_URL}/emergency-request`);
    await page.selectOption('[data-testid="equipment-select"]', 'microscope-001');
    await page.fill('[data-testid="start-datetime"]', '2024-12-20 10:00');
    await page.fill('[data-testid="emergency-reason"]', '緊急実験');
    
    const page2 = await context.newPage();
    await page2.goto(`${BASE_URL}/login`);
    await page2.fill('[data-testid="username"]', 'test@example.com');
    await page2.fill('[data-testid="password"]', 'password123');
    await page2.click('[data-testid="login-button"]');
    await page2.goto(`${BASE_URL}/emergency-request`);
    await page2.selectOption('[data-testid="equipment-select"]', 'microscope-001');
    await page2.fill('[data-testid="start-datetime"]', '2024-12-20 10:00');
    
    await page.click('[data-testid="confirm-button"]');
    await page2.click('[data-testid="confirm-button"]');
    await expect(page2.locator('[data-testid="conflict-warning"]')).toContainText('選択した時間帯は既に予約されています');
  });
});