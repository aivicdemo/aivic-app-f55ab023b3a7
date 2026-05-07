import { test, expect } from '@playwright/test';

describe("機器予約申請画面", () => {
  const baseUrl = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseUrl}/login`);
    await page.fill('[data-testid="username"]', 'testuser');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(`${baseUrl}/dashboard`);
  });

  test('SCEN-207: 機器名キーワードで正常検索', async ({ page }) => {
    // SCEN-207
    await page.goto(`${baseUrl}/equipment/reservation`);
    await page.fill('[data-testid="equipment-search"]', '顕微鏡');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="search-results"]');
    await expect(page.locator('[data-testid="equipment-list"]')).toContainText('顕微鏡');
  });

  test('SCEN-208: カテゴリ選択で機器絞り込み', async ({ page }) => {
    // SCEN-208
    await page.goto(`${baseUrl}/equipment/reservation`);
    await page.selectOption('[data-testid="category-filter"]', '分析機器');
    await page.waitForSelector('[data-testid="filtered-results"]');
    await expect(page.locator('[data-testid="category-display"]')).toContainText('分析機器');
    await expect(page.locator('[data-testid="equipment-list"] .equipment-item')).toHaveCount(3);
  });

  test('SCEN-209: カレンダーから利用日選択', async ({ page }) => {
    // SCEN-209
    await page.goto(`${baseUrl}/equipment/reservation`);
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.click('[data-testid="calendar-icon"]');
    await page.click('[data-testid="calendar-date"][data-date="2024-12-25"]');
    await expect(page.locator('[data-testid="usage-date"]')).toHaveValue('2024-12-25');
  });

  test('SCEN-210: 機器一覧から詳細表示', async ({ page }) => {
    // SCEN-210
    await page.goto(`${baseUrl}/equipment/reservation`);
    await page.click('[data-testid="equipment-detail-button"]:first-child');
    await expect(page.locator('[data-testid="equipment-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="equipment-specs"]')).toBeVisible();
    await expect(page.locator('[data-testid="usage-fee"]')).toBeVisible();
  });

  test('SCEN-211: 利用目的入力して申請完了', async ({ page }) => {
    // SCEN-211
    await page.goto(`${baseUrl}/equipment/reservation`);
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.fill('[data-testid="start-datetime"]', '2024-12-25 10:00');
    await page.fill('[data-testid="end-datetime"]', '2024-12-25 12:00');
    await page.fill('[data-testid="usage-purpose"]', '研究実験のため');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toContainText('申請が完了');
  });

  test('SCEN-212: 実験内容詳細を記入して送信', async ({ page }) => {
    // SCEN-212
    await page.goto(`${baseUrl}/equipment/reservation`);
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.fill('[data-testid="reservation-date"]', '2024-12-25');
    await page.fill('[data-testid="experiment-details"]', 'タンパク質の精製と分析実験。サンプル数10個、予想実験時間4時間');
    await page.fill('[data-testid="additional-info"]', '使用試薬：Buffer A, B');
    await page.click('[data-testid="send-button"]');
    await expect(page.locator('[data-testid="confirmation-message"]')).toBeVisible();
  });

  test('SCEN-213: 測定要件を指定して予約', async ({ page }) => {
    // SCEN-213
    await page.goto(`${baseUrl}/equipment/reservation`);
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.fill('[data-testid="reservation-datetime"]', '2024-12-25 14:00');
    await page.fill('[data-testid="measurement-target"]', 'サンプルA');
    await page.fill('[data-testid="measurement-conditions"]', '温度25℃、湿度50%');
    await page.selectOption('[data-testid="accessories"]', '専用プレート');
    await page.click('[data-testid="reserve-button"]');
    await expect(page.locator('[data-testid="reservation-confirmation"]')).toBeVisible();
  });

  test('SCEN-214: 技術仕様要求を入力して申請', async ({ page }) => {
    // SCEN-214
    await page.goto(`${baseUrl}/equipment/reservation`);
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.fill('[data-testid="reservation-datetime"]', '2024-12-25 16:00');
    await page.fill('[data-testid="usage-purpose"]', '分析実験');
    await page.fill('[data-testid="technical-specs"]', '精度±0.1%, 測定範囲1-100μm');
    await page.fill('[data-testid="contact-info"]', 'test@example.com');
    await page.click('[data-testid="apply-button"]');
    await expect(page.locator('[data-testid="application-complete"]')).toBeVisible();
  });

  test('SCEN-215: 開始終了日時を設定して予約', async ({ page }) => {
    // SCEN-215
    await page.goto(`${baseUrl}/equipment/list`);
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.click('[data-testid="reservation-button"]');
    await page.fill('[data-testid="start-date"]', '2024-12-25');
    await page.fill('[data-testid="start-time"]', '09:00');
    await page.fill('[data-testid="end-date"]', '2024-12-25');
    await page.fill('[data-testid="end-time"]', '17:00');
    await page.click('[data-testid="reservation-apply"]');
    await expect(page.locator('[data-testid="reservation-complete"]')).toContainText('予約完了');
  });

  test('SCEN-216: 存在しない機器名で検索', async ({ page }) => {
    // SCEN-216
    await page.goto(`${baseUrl}/equipment/reservation`);
    await page.fill('[data-testid="equipment-search"]', '存在しない機器ABC123');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('該当する機器が見つかりません');
    await expect(page.locator('[data-testid="equipment-list"]')).toBeEmpty();
  });

  test('SCEN-217: 利用不可日時を選択', async ({ page }) => {
    // SCEN-217
    await page.goto(`${baseUrl}/equipment/reservation`);
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.fill('[data-testid="start-datetime"]', '2024-12-31 10:00');
    await page.fill('[data-testid="usage-purpose"]', 'テスト実験');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('利用不可');
  });

  test('SCEN-218: 利用目的未入力で申請', async ({ page }) => {
    // SCEN-218
    await page.goto(`${baseUrl}/equipment/reservation`);
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.fill('[data-testid="usage-datetime"]', '2024-12-25 10:00');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="validation-error"]')).toContainText('利用目的を入力してください');
  });

  test('SCEN-219: 実験内容空欄で送信', async ({ page }) => {
    // SCEN-219
    await page.goto(`${baseUrl}/equipment/reservation`);
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.fill('[data-testid="reservation-date"]', '2024-12-25');
    await page.click('[data-testid="send-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('実験内容');
    await expect(page).toHaveURL(new RegExp('/equipment/reservation'));
  });

  test('SCEN-220: 開始日時未選択で申請', async ({ page }) => {
    // SCEN-220
    await page.goto(`${baseUrl}/equipment/reservation`);
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.fill('[data-testid="end-datetime"]', '2024-12-25 18:00');
    await page.fill('[data-testid="usage-purpose"]', 'テスト実験');
    await page.click('[data-testid="apply-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('開始日時');
  });

  test('SCEN-221: 終了日時が開始前の設定', async ({ page }) => {
    // SCEN-221
    await page.goto(`${baseUrl}/equipment/reservation`);
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.fill('[data-testid="start-datetime"]', '2024-01-15 10:00');
    await page.fill('[data-testid="end-datetime"]', '2024-01-15 09:00');
    await page.click('[data-testid="reservation-button"]');
    await expect(page.locator('[data-testid="validation-error"]')).toContainText('終了日時が開始日時より前');
  });

  test('SCEN-222: 過去日時を開始日に設定', async ({ page }) => {
    // SCEN-222
    await page.goto(`${baseUrl}/equipment/reservation`);
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.fill('[data-testid="start-datetime"]', '2023-12-01 10:00');
    await page.fill('[data-testid="end-datetime"]', '2023-12-01 12:00');
    await page.fill('[data-testid="usage-purpose"]', 'テスト');
    await page.click('[data-testid="reservation-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('開始日時は現在日時以降を設定してください');
  });

  test('SCEN-223: システムエラー時の画面表示', async ({ page }) => {
    // SCEN-223
    await page.route('**/api/reservations', route => route.fulfill({ status: 500 }));
    await page.goto(`${baseUrl}/equipment/reservation`);
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.fill('[data-testid="start-datetime"]', '2024-12-25 10:00');
    await page.fill('[data-testid="usage-purpose"]', 'テスト実験');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="system-error"]')).toBeVisible();
    await page.click('[data-testid="back-button"]');
  });

  test('SCEN-224: 検索フィールド文字数上限', async ({ page }) => {
    // SCEN-224
    await page.goto(`${baseUrl}/equipment/reservation`);
    const maxLength = '顕微鏡'.repeat(50);
    await page.fill('[data-testid="equipment-search"]', maxLength);
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    const overLimit = maxLength + 'X';
    await page.fill('[data-testid="equipment-search"]', overLimit);
    await expect(page.locator('[data-testid="char-limit-error"]')).toBeVisible();
  });

  test('SCEN-225: 利用目的最大文字数入力', async ({ page }) => {
    // SCEN-225
    await page.goto(`${baseUrl}/equipment/reservation`);
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.fill('[data-testid="reservation-datetime"]', '2024-12-25 10:00');
    const maxText = 'A'.repeat(1000);
    await page.fill('[data-testid="usage-purpose"]', maxText);
    await page.click('[data-testid="apply-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('SCEN-226: 実験内容最大文字数入力', async ({ page }) => {
    // SCEN-226
    await page.goto(`${baseUrl}/equipment/reservation`);
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.fill('[data-testid="reservation-datetime"]', '2024-12-25 14:00');
    const maxText = 'B'.repeat(1000);
    await page.fill('[data-testid="experiment-content"]', maxText);
    await page.click('[data-testid="apply-button"]');
    await expect(page.locator('[data-testid="application-complete"]')).toBeVisible();
  });

  test('SCEN-227: 測定要件最大文字数入力', async ({ page }) => {
    // SCEN-227
    await page.goto(`${baseUrl}/equipment/reservation`);
    await page.click('[data-testid="equipment-item"]:first-child');
    const maxText = 'C'.repeat(1000);
    await page.fill('[data-testid="measurement-requirements"]', maxText);
    await page.fill('[data-testid="usage-purpose"]', 'テスト');
    await page.click('[data-testid="apply-button"]');
    await expect(page.locator('[data-testid="reservation-success"]')).toBeVisible();
  });

  test('SCEN-228: 技術仕様要求最大文字数', async ({ page }) => {
    // SCEN-228
    await page.goto(`${baseUrl}/equipment/reservation`);
    await page.click('[data-testid="equipment-item"]:first-child');
    const maxText = 'D'.repeat(1000);
    await page.fill('[data-testid="technical-requirements"]', maxText);
    await page.fill('[data-testid="usage-purpose"]', 'テスト実験');
    await page.click('[data-testid="apply-button"]');
    await expect(page.locator('[data-testid="application-success"]')).toBeVisible();
  });

  test('SCEN-229: 同一日時の連続予約', async ({ page }) => {
    // SCEN-229
    await page.goto(`${baseUrl}/equipment/reservation`);
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.fill('[data-testid="start-datetime"]', '2024-01-15 10:00');
    await page.fill('[data-testid="end-datetime"]', '2024-01-15 12:00');
    await page.fill('[data-testid="usage-purpose"]', '実験1');
    await page.click('[data-testid="apply-button"]');
    await page.waitForSelector('[data-testid="success-message"]');
    await page.goto(`${baseUrl}/equipment/reservation`);
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.fill('[data-testid="start-datetime"]', '2024-01-15 12:00');
    await page.fill('[data-testid="end-datetime"]', '2024-01-15 14:00');
    await page.fill('[data-testid="usage-purpose"]', '実験2');
    await page.click('[data-testid="apply-button"]');
    await expect(page.locator('[data-testid="reservation-list"]')).toContainText('10:00-12:00');
    await expect(page.locator('[data-testid="reservation-list"]')).toContainText('12:00-14:00');
  });

  test('SCEN-230: 最大予約可能期間の設定', async ({ page }) => {
    // SCEN-230
    await page.goto(`${baseUrl}/equipment/reservation`);
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.fill('[data-testid="start-datetime"]', '2024-12-25 10:00');
    await page.fill('[data-testid="end-datetime"]', '2025-01-25 10:00');
    await page.fill('[data-testid="usage-purpose"]', 'テスト');
    await page.click('[data-testid="apply-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await page.fill('[data-testid="end-datetime"]', '2025-01-26 10:00');
    await page.click('[data-testid="apply-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('最大予約可能期間');
  });

  test('SCEN-231: 特殊文字を含む検索', async ({ page }) => {
    // SCEN-231
    await page.goto(`${baseUrl}/equipment/reservation`);
    await page.fill('[data-testid="equipment-search"]', '@#$%^&*()');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="no-results"]')).toContainText('検索結果が見つかりません');
    await page.fill('[data-testid="equipment-search"]', '顕微鏡@#$');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await page.fill('[data-testid="equipment-search"]', '\'; DROP TABLE --');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="no-results"]')).toBeVisible();
  });
});