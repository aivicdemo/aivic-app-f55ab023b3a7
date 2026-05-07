import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("予約申請画面", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="username"]', 'testuser');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/dashboard');
  });

  test('SCEN-278: 機器名で検索結果が正しく表示される', async ({ page }) => {
    // SCEN-278
    await page.goto(`${BASE_URL}/reservation/apply`);
    await page.fill('[data-testid="equipment-search"]', '顕微鏡');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="equipment-item"]')).toContainText('顕微鏡');
  });

  test('SCEN-279: カテゴリ絞り込みで該当機器のみ表示', async ({ page }) => {
    // SCEN-279
    await page.goto(`${BASE_URL}/reservation/apply`);
    await page.selectOption('[data-testid="category-filter"]', '顕微鏡');
    await page.click('[data-testid="filter-button"]');
    await expect(page.locator('[data-testid="equipment-list"] [data-testid="equipment-item"]')).toContainText('顕微鏡');
    await expect(page.locator('[data-testid="result-count"]')).toBeVisible();
  });

  test('SCEN-280: 機器選択で詳細情報が表示される', async ({ page }) => {
    // SCEN-280
    await page.goto(`${BASE_URL}/reservation/apply`);
    await page.click('[data-testid="equipment-item"]:first-child');
    await expect(page.locator('[data-testid="equipment-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="equipment-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="equipment-specs"]')).toBeVisible();
  });

  test('SCEN-281: カレンダーで利用日を正常選択できる', async ({ page }) => {
    // SCEN-281
    await page.goto(`${BASE_URL}/reservation/apply`);
    await page.click('[data-testid="date-picker"]');
    await page.click('.calendar-date:not(.disabled):nth-child(15)');
    await expect(page.locator('.calendar-date.selected')).toBeVisible();
    await expect(page.locator('[data-testid="selected-date"]')).not.toBeEmpty();
  });

  test('SCEN-282: 利用時間を設定して料金が計算される', async ({ page }) => {
    // SCEN-282
    await page.goto(`${BASE_URL}/reservation/apply`);
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.fill('[data-testid="start-datetime"]', '2024-12-31T09:00');
    await page.fill('[data-testid="end-datetime"]', '2024-12-31T11:00');
    await page.click('[data-testid="calculate-fee"]');
    await expect(page.locator('[data-testid="calculated-fee"]')).toBeVisible();
  });

  test('SCEN-283: プロジェクト選択で内容が反映される', async ({ page }) => {
    // SCEN-283
    await page.goto(`${BASE_URL}/reservation/apply`);
    await page.click('[data-testid="project-dropdown"]');
    await page.click('[data-testid="project-option"]:first-child');
    await expect(page.locator('[data-testid="project-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="project-leader"]')).toBeVisible();
  });

  test('SCEN-284: 研究目的を入力して保存される', async ({ page }) => {
    // SCEN-284
    await page.goto(`${BASE_URL}/reservation/apply`);
    await page.fill('[data-testid="research-purpose"]', '新薬開発のための化合物分析実験');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="research-purpose"]')).toHaveValue('新薬開発のための化合物分析実験');
  });

  test('SCEN-285: 実験内容詳細が正常入力できる', async ({ page }) => {
    // SCEN-285
    await page.goto(`${BASE_URL}/reservation/apply`);
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.fill('[data-testid="date-picker"]', '2024-12-31');
    await page.fill('[data-testid="experiment-details"]', 'タンパク質の構造解析実験。サンプル数：10個、測定時間：約2時間、使用試薬：○○溶液');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('SCEN-286: 測定要件入力で申請が完了する', async ({ page }) => {
    // SCEN-286
    await page.goto(`${BASE_URL}/reservation/apply`);
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.fill('[data-testid="date-picker"]', '2024-12-31');
    await page.fill('[data-testid="measurement-requirements"]', '温度25℃、湿度60%、測定時間2時間');
    await page.fill('[data-testid="research-purpose"]', 'テスト研究');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="application-complete"]')).toBeVisible();
  });

  test('SCEN-287: 申請者情報が正しく確認できる', async ({ page }) => {
    // SCEN-287
    await page.goto(`${BASE_URL}/reservation/apply`);
    await expect(page.locator('[data-testid="applicant-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="applicant-department"]')).toBeVisible();
    await expect(page.locator('[data-testid="applicant-contact"]')).toBeVisible();
    await expect(page.locator('[data-testid="applicant-name"]')).toContainText('testuser');
  });

  test('SCEN-288: 緊急連絡先入力で申請送信完了', async ({ page }) => {
    // SCEN-288
    await page.goto(`${BASE_URL}/reservation/apply`);
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.fill('[data-testid="date-picker"]', '2024-12-31');
    await page.fill('[data-testid="research-purpose"]', 'テスト研究');
    await page.fill('[data-testid="emergency-contact-phone"]', '090-1234-5678');
    await page.fill('[data-testid="emergency-contact-name"]', '緊急連絡担当者');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="application-number"]')).toBeVisible();
  });

  test('SCEN-289: 存在しない機器名で検索結果なし', async ({ page }) => {
    // SCEN-289
    await page.goto(`${BASE_URL}/reservation/apply`);
    await page.fill('[data-testid="equipment-search"]', '存在しない機器XYZ123');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="no-results-message"]')).toContainText('該当する機器が見つかりませんでした');
  });

  test('SCEN-290: 過去日付選択でエラーメッセージ', async ({ page }) => {
    // SCEN-290
    await page.goto(`${BASE_URL}/reservation/apply`);
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.fill('[data-testid="date-picker"]', '2020-01-01');
    await page.fill('[data-testid="time-picker"]', '10:00');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('過去の日付は選択できません');
  });

  test('SCEN-291: 予約済み時間選択で競合エラー', async ({ page }) => {
    // SCEN-291
    await page.goto(`${BASE_URL}/reservation/apply`);
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.fill('[data-testid="start-datetime"]', '2024-12-31T10:00');
    await page.fill('[data-testid="end-datetime"]', '2024-12-31T12:00');
    await page.fill('[data-testid="research-purpose"]', 'テスト研究');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="conflict-error"]')).toContainText('選択された時間帯は既に予約されています');
  });

  test('SCEN-292: 利用時間未設定で申請エラー', async ({ page }) => {
    // SCEN-292
    await page.goto(`${BASE_URL}/reservation/apply`);
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.fill('[data-testid="date-picker"]', '2024-12-31');
    await page.fill('[data-testid="research-purpose"]', 'テスト研究');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="time-error"]')).toContainText('利用時間を設定してください');
  });

  test('SCEN-293: プロジェクト未選択で送信エラー', async ({ page }) => {
    // SCEN-293
    await page.goto(`${BASE_URL}/reservation/apply`);
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.fill('[data-testid="start-datetime"]', '2024-12-31T10:00');
    await page.fill('[data-testid="end-datetime"]', '2024-12-31T12:00');
    await page.fill('[data-testid="research-purpose"]', 'テスト研究');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="project-error"]')).toContainText('プロジェクトを選択してください');
  });

  test('SCEN-294: 研究目的空欄で必須エラー表示', async ({ page }) => {
    // SCEN-294
    await page.goto(`${BASE_URL}/reservation/apply`);
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.fill('[data-testid="date-picker"]', '2024-12-31');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="purpose-error"]')).toContainText('研究目的は必須です');
  });

  test('SCEN-295: 測定要件未入力で申請不可', async ({ page }) => {
    // SCEN-295
    await page.goto(`${BASE_URL}/reservation/apply`);
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.fill('[data-testid="date-picker"]', '2024-12-31');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="requirements-error"]')).toContainText('測定要件を入力してください');
  });

  test('SCEN-296: 緊急連絡先不正形式でエラー', async ({ page }) => {
    // SCEN-296
    await page.goto(`${BASE_URL}/reservation/apply`);
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.fill('[data-testid="date-picker"]', '2024-12-31');
    await page.fill('[data-testid="research-purpose"]', 'テスト研究');
    await page.fill('[data-testid="emergency-contact-phone"]', 'abc-defg-hijk');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="phone-error"]')).toContainText('正しい電話番号を入力してください');
  });

  test('SCEN-297: 機器検索で部分一致結果表示', async ({ page }) => {
    // SCEN-297
    await page.goto(`${BASE_URL}/reservation/apply`);
    await page.fill('[data-testid="equipment-search"]', '顕微');
    await page.press('[data-testid="equipment-search"]', 'Enter');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="equipment-item"]').first()).toContainText('顕微');
    await expect(page.locator('[data-testid="result-count"]')).toBeVisible();
  });

  test('SCEN-298: 当日予約の最短受付時間確認', async ({ page }) => {
    // SCEN-298
    await page.goto(`${BASE_URL}/reservation/apply`);
    await page.click('[data-testid="equipment-item"]:first-child');
    const today = new Date().toISOString().split('T')[0];
    await page.fill('[data-testid="date-picker"]', today);
    await page.fill('[data-testid="start-time"]', '09:00');
    await expect(page.locator('[data-testid="time-slot"].disabled')).toBeVisible();
    await page.fill('[data-testid="start-time"]', '14:00');
    await page.click('[data-testid="submit-button"]');
  });

  test('SCEN-299: 最大連続利用時間での申請', async ({ page }) => {
    // SCEN-299
    await page.goto(`${BASE_URL}/reservation/apply`);
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.fill('[data-testid="start-datetime"]', '2024-12-31T09:00');
    await page.fill('[data-testid="end-datetime"]', '2025-01-01T09:00');
    await page.fill('[data-testid="research-purpose"]', 'テスト研究');
    await page.click('[data-testid="submit-button"]');
    await page.click('[data-testid="confirm-ok"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('SCEN-300: 研究目的文字数上限での入力', async ({ page }) => {
    // SCEN-300
    await page.goto(`${BASE_URL}/reservation/apply`);
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.fill('[data-testid="date-picker"]', '2024-12-31');
    const maxText = 'a'.repeat(500);
    await page.fill('[data-testid="research-purpose"]', maxText);
    await expect(page.locator('[data-testid="char-count"]')).toContainText('500');
    await page.type('[data-testid="research-purpose"]', 'x');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('SCEN-301: 実験内容最大文字数入力確認', async ({ page }) => {
    // SCEN-301
    await page.goto(`${BASE_URL}/reservation/apply`);
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.fill('[data-testid="date-picker"]', '2024-12-31');
    const maxText = 'a'.repeat(1000);
    await page.fill('[data-testid="experiment-details"]', maxText);
    await expect(page.locator('[data-testid="experiment-char-count"]')).toContainText('1000');
    await page.type('[data-testid="experiment-details"]', 'x');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('SCEN-302: 最大予約可能日数での申請', async ({ page }) => {
    // SCEN-302
    await page.goto(`${BASE_URL}/reservation/apply`);
    await page.click('[data-testid="equipment-item"]:first-child');
    const today = new Date().toISOString().split('T')[0];
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    await page.fill('[data-testid="start-date"]', today);
    await page.fill('[data-testid="end-date"]', maxDate.toISOString().split('T')[0]);
    await page.fill('[data-testid="research-purpose"]', 'テスト研究');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="application-complete"]')).toBeVisible();
  });
});