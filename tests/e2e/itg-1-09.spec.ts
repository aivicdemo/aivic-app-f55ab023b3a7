import { test, expect } from '@playwright/test';

describe("機器予約申請画面", () => {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseURL}/login`);
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'password');
    await page.click('#loginButton');
    await page.waitForURL('**/dashboard');
  });

  test('SCEN-207: 機器名キーワードで正常検索', async ({ page }) => {
    // SCEN-207
    await page.goto(`${baseURL}/equipment-reservation`);
    await page.fill('#equipment-search', '顕微鏡');
    await page.click('#search-button');
    await page.waitForSelector('.search-results');
    await expect(page.locator('.equipment-item')).toContainText('顕微鏡');
  });

  test('SCEN-208: カテゴリ選択で機器絞り込み', async ({ page }) => {
    // SCEN-208
    await page.goto(`${baseURL}/equipment-reservation`);
    await page.selectOption('#category-filter', '分析機器');
    await page.waitForSelector('.equipment-list');
    await expect(page.locator('.equipment-item .category')).toContainText('分析機器');
  });

  test('SCEN-209: カレンダーから利用日選択', async ({ page }) => {
    // SCEN-209
    await page.goto(`${baseURL}/equipment-reservation`);
    await page.click('.equipment-item:first-child .select-button');
    await page.click('#usage-date-calendar');
    await page.click('[data-date="2024-12-25"]');
    await expect(page.locator('#usage-date')).toHaveValue('2024-12-25');
  });

  test('SCEN-210: 機器一覧から詳細表示', async ({ page }) => {
    // SCEN-210
    await page.goto(`${baseURL}/equipment-reservation`);
    await page.click('.equipment-item:first-child .detail-button');
    await expect(page.locator('.equipment-detail')).toBeVisible();
    await expect(page.locator('.equipment-specs')).toBeVisible();
  });

  test('SCEN-211: 利用目的入力して申請完了', async ({ page }) => {
    // SCEN-211
    await page.goto(`${baseURL}/equipment-reservation`);
    await page.click('.equipment-item:first-child .select-button');
    await page.fill('#start-datetime', '2024-12-25 10:00');
    await page.fill('#end-datetime', '2024-12-25 14:00');
    await page.fill('#purpose', 'タンパク質構造解析研究');
    await page.click('#submit-button');
    await expect(page.locator('.success-message')).toContainText('申請が完了しました');
  });

  test('SCEN-212: 実験内容詳細を記入して送信', async ({ page }) => {
    // SCEN-212
    await page.goto(`${baseURL}/equipment-reservation`);
    await page.click('.equipment-item:first-child .select-button');
    await page.fill('#start-datetime', '2024-12-25 10:00');
    await page.fill('#end-datetime', '2024-12-25 14:00');
    await page.fill('#experiment-details', 'タンパク質の精製と分析実験。サンプル数10個、予想実験時間4時間');
    await page.click('#submit-button');
    await expect(page.locator('.confirmation-screen')).toBeVisible();
  });

  test('SCEN-213: 測定要件を指定して予約', async ({ page }) => {
    // SCEN-213
    await page.goto(`${baseURL}/equipment-reservation`);
    await page.click('.equipment-item:first-child .select-button');
    await page.fill('#start-datetime', '2024-12-25 10:00');
    await page.fill('#end-datetime', '2024-12-25 14:00');
    await page.fill('#measurement-requirements', '測定対象：有機化合物、精度：±0.1%、室温条件');
    await page.click('#submit-button');
    await expect(page.locator('.confirmation-screen')).toBeVisible();
  });

  test('SCEN-214: 技術仕様要求を入力して申請', async ({ page }) => {
    // SCEN-214
    await page.goto(`${baseURL}/equipment-reservation`);
    await page.click('.equipment-item:first-child .select-button');
    await page.fill('#start-datetime', '2024-12-25 10:00');
    await page.fill('#end-datetime', '2024-12-25 14:00');
    await page.fill('#purpose', '材料分析');
    await page.fill('#technical-specs', '精度：±0.05%、測定範囲：1-100nm、室温環境');
    await page.click('#submit-button');
    await expect(page.locator('.application-complete')).toBeVisible();
  });

  test('SCEN-215: 開始終了日時を設定して予約', async ({ page }) => {
    // SCEN-215
    await page.goto(`${baseURL}/equipment-reservation`);
    await page.click('.equipment-item:first-child .reserve-button');
    await page.fill('#start-date', '2024-12-25');
    await page.fill('#start-time', '10:00');
    await page.fill('#end-date', '2024-12-25');
    await page.fill('#end-time', '14:00');
    await page.click('#submit-reservation');
    await expect(page.locator('.reservation-complete')).toContainText('予約完了');
  });

  test('SCEN-216: 存在しない機器名で検索', async ({ page }) => {
    // SCEN-216
    await page.goto(`${baseURL}/equipment-reservation`);
    await page.fill('#equipment-search', '存在しない機器ABC123');
    await page.click('#search-button');
    await expect(page.locator('.error-message')).toContainText('該当する機器が見つかりません');
  });

  test('SCEN-217: 利用不可日時を選択', async ({ page }) => {
    // SCEN-217
    await page.goto(`${baseURL}/equipment-reservation`);
    await page.click('.equipment-item:first-child .select-button');
    await page.fill('#start-datetime', '2024-12-31 10:00');
    await page.fill('#end-datetime', '2024-12-31 14:00');
    await page.click('#submit-button');
    await expect(page.locator('.error-message')).toContainText('選択した日時は利用できません');
  });

  test('SCEN-218: 利用目的未入力で申請', async ({ page }) => {
    // SCEN-218
    await page.goto(`${baseURL}/equipment-reservation`);
    await page.click('.equipment-item:first-child .select-button');
    await page.fill('#start-datetime', '2024-12-25 10:00');
    await page.fill('#end-datetime', '2024-12-25 14:00');
    await page.click('#submit-button');
    await expect(page.locator('.validation-error')).toContainText('利用目的を入力してください');
  });

  test('SCEN-219: 実験内容空欄で送信', async ({ page }) => {
    // SCEN-219
    await page.goto(`${baseURL}/equipment-reservation`);
    await page.click('.equipment-item:first-child .select-button');
    await page.fill('#start-datetime', '2024-12-25 10:00');
    await page.fill('#end-datetime', '2024-12-25 14:00');
    await page.click('#submit-button');
    await expect(page.locator('.error-message')).toContainText('実験内容を入力してください');
  });

  test('SCEN-220: 開始日時未選択で申請', async ({ page }) => {
    // SCEN-220
    await page.goto(`${baseURL}/equipment-reservation`);
    await page.click('.equipment-item:first-child .select-button');
    await page.fill('#end-datetime', '2024-12-25 14:00');
    await page.fill('#purpose', '研究目的');
    await page.click('#submit-button');
    await expect(page.locator('.validation-error')).toContainText('開始日時を選択してください');
  });

  test('SCEN-221: 終了日時が開始前の設定', async ({ page }) => {
    // SCEN-221
    await page.goto(`${baseURL}/equipment-reservation`);
    await page.click('.equipment-item:first-child .select-button');
    await page.fill('#start-datetime', '2024-01-15 10:00');
    await page.fill('#end-datetime', '2024-01-15 09:00');
    await page.click('#submit-button');
    await expect(page.locator('.validation-error')).toContainText('終了日時は開始日時より後に設定してください');
  });

  test('SCEN-222: 過去日時を開始日に設定', async ({ page }) => {
    // SCEN-222
    await page.goto(`${baseURL}/equipment-reservation`);
    await page.click('.equipment-item:first-child .select-button');
    await page.fill('#start-datetime', '2023-12-01 10:00');
    await page.fill('#end-datetime', '2023-12-01 14:00');
    await page.fill('#purpose', '研究目的');
    await page.click('#submit-button');
    await expect(page.locator('.error-message')).toContainText('開始日時は現在日時以降を設定してください');
  });

  test('SCEN-223: システムエラー時の画面表示', async ({ page }) => {
    // SCEN-223
    await page.route('**/api/reservations', route => route.fulfill({ status: 500 }));
    await page.goto(`${baseURL}/equipment-reservation`);
    await page.click('.equipment-item:first-child .select-button');
    await page.fill('#start-datetime', '2024-12-25 10:00');
    await page.fill('#end-datetime', '2024-12-25 14:00');
    await page.fill('#purpose', '研究目的');
    await page.click('#submit-button');
    await expect(page.locator('.system-error')).toBeVisible();
  });

  test('SCEN-224: 検索フィールド文字数上限', async ({ page }) => {
    // SCEN-224
    await page.goto(`${baseURL}/equipment-reservation`);
    const maxText = 'a'.repeat(100);
    await page.fill('#equipment-search', maxText);
    await page.click('#search-button');
    await expect(page.locator('.search-results')).toBeVisible();
    const overText = 'a'.repeat(101);
    await page.fill('#equipment-search', overText);
    await expect(page.locator('#equipment-search')).toHaveValue(maxText);
  });

  test('SCEN-225: 利用目的最大文字数入力', async ({ page }) => {
    // SCEN-225
    await page.goto(`${baseURL}/equipment-reservation`);
    await page.click('.equipment-item:first-child .select-button');
    await page.fill('#start-datetime', '2024-12-25 10:00');
    await page.fill('#end-datetime', '2024-12-25 14:00');
    await page.fill('#purpose', 'a'.repeat(1000));
    await page.click('#submit-button');
    await expect(page.locator('.success-message')).toBeVisible();
  });

  test('SCEN-226: 実験内容最大文字数入力', async ({ page }) => {
    // SCEN-226
    await page.goto(`${baseURL}/equipment-reservation`);
    await page.click('.equipment-item:first-child .select-button');
    await page.fill('#start-datetime', '2024-12-25 10:00');
    await page.fill('#end-datetime', '2024-12-25 14:00');
    await page.fill('#experiment-details', 'a'.repeat(1000));
    await page.click('#submit-button');
    await expect(page.locator('.application-complete')).toBeVisible();
  });

  test('SCEN-227: 測定要件最大文字数入力', async ({ page }) => {
    // SCEN-227
    await page.goto(`${baseURL}/equipment-reservation`);
    await page.click('.equipment-item:first-child .select-button');
    await page.fill('#start-datetime', '2024-12-25 10:00');
    await page.fill('#end-datetime', '2024-12-25 14:00');
    await page.fill('#measurement-requirements', 'a'.repeat(1000));
    await page.fill('#purpose', '研究目的');
    await page.click('#submit-button');
    await expect(page.locator('.reservation-complete')).toBeVisible();
  });

  test('SCEN-228: 技術仕様要求最大文字数', async ({ page }) => {
    // SCEN-228
    await page.goto(`${baseURL}/equipment-reservation`);
    await page.click('.equipment-item:first-child .select-button');
    await page.fill('#start-datetime', '2024-12-25 10:00');
    await page.fill('#end-datetime', '2024-12-25 14:00');
    await page.fill('#technical-specs', 'a'.repeat(1000));
    await page.fill('#purpose', '研究目的');
    await page.click('#submit-button');
    await expect(page.locator('.application-complete')).toBeVisible();
  });

  test('SCEN-229: 同一日時の連続予約', async ({ page }) => {
    // SCEN-229
    await page.goto(`${baseURL}/equipment-reservation`);
    await page.click('.equipment-item:first-child .select-button');
    await page.fill('#start-datetime', '2024-01-15 10:00');
    await page.fill('#end-datetime', '2024-01-15 12:00');
    await page.fill('#purpose', '研究目的1');
    await page.click('#submit-button');
    await page.waitForURL('**/reservations');
    await page.goto(`${baseURL}/equipment-reservation`);
    await page.click('.equipment-item:first-child .select-button');
    await page.fill('#start-datetime', '2024-01-15 12:00');
    await page.fill('#end-datetime', '2024-01-15 14:00');
    await page.fill('#purpose', '研究目的2');
    await page.click('#submit-button');
    await expect(page.locator('.success-message')).toBeVisible();
  });

  test('SCEN-230: 最大予約可能期間の設定', async ({ page }) => {
    // SCEN-230
    await page.goto(`${baseURL}/equipment-reservation`);
    await page.click('.equipment-item:first-child .select-button');
    await page.fill('#start-datetime', '2024-12-25 10:00');
    await page.fill('#end-datetime', '2025-01-25 10:00');
    await page.fill('#purpose', '研究目的');
    await page.click('#submit-button');
    await expect(page.locator('.success-message')).toBeVisible();
    await page.fill('#end-datetime', '2025-01-26 10:00');
    await page.click('#submit-button');
    await expect(page.locator('.error-message')).toContainText('最大予約可能期間を超過');
  });

  test('SCEN-231: 特殊文字を含む検索', async ({ page }) => {
    // SCEN-231
    await page.goto(`${baseURL}/equipment-reservation`);
    await page.fill('#equipment-search', '@#$%^&*()');
    await page.click('#search-button');
    await expect(page.locator('.no-results')).toContainText('検索結果が見つかりません');
    await page.fill('#equipment-search', '顕微鏡@#$');
    await page.click('#search-button');
    await expect(page.locator('.search-results')).toBeVisible();
    await page.fill('#equipment-search', '\'; DROP TABLE --');
    await page.click('#search-button');
    await expect(page.locator('.no-results')).toContainText('検索結果が見つかりません');
  });
});