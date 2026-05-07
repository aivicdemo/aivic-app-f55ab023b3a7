import { test, expect } from '@playwright/test';

describe("予約申請画面", () => {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseURL}/login`);
    await page.fill('[data-testid="username"]', 'testuser');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(`${baseURL}/reservation/apply`);
  });

  test("SCEN-278: 機器名で検索結果が正しく表示される", async ({ page }) => {
    // SCEN-278
    await page.fill('[data-testid="equipment-search"]', '顕微鏡');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="equipment-item"]')).toContainText('顕微鏡');
  });

  test("SCEN-279: カテゴリ絞り込みで該当機器のみ表示", async ({ page }) => {
    // SCEN-279
    await page.selectOption('[data-testid="category-filter"]', '顕微鏡');
    await page.click('[data-testid="filter-button"]');
    await expect(page.locator('[data-testid="equipment-list"] [data-testid="equipment-item"]')).toContainText('顕微鏡');
    await expect(page.locator('[data-testid="result-count"]')).toBeVisible();
  });

  test("SCEN-280: 機器選択で詳細情報が表示される", async ({ page }) => {
    // SCEN-280
    await page.click('[data-testid="equipment-item"]:first-child');
    await expect(page.locator('[data-testid="equipment-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="equipment-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="equipment-specs"]')).toBeVisible();
  });

  test("SCEN-281: カレンダーで利用日を正常選択できる", async ({ page }) => {
    // SCEN-281
    await page.click('[data-testid="calendar"]');
    await page.click('[data-testid="calendar-date"]:not(.disabled):first-child');
    await expect(page.locator('[data-testid="selected-date"]')).toHaveClass(/selected/);
    await expect(page.locator('[data-testid="date-input"]')).not.toHaveValue('');
  });

  test("SCEN-282: 利用時間を設定して料金が計算される", async ({ page }) => {
    // SCEN-282
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.fill('[data-testid="start-time"]', '09:00');
    await page.fill('[data-testid="end-time"]', '12:00');
    await page.click('[data-testid="calculate-button"]');
    await expect(page.locator('[data-testid="calculated-fee"]')).toBeVisible();
  });

  test("SCEN-283: プロジェクト選択で内容が反映される", async ({ page }) => {
    // SCEN-283
    await page.selectOption('[data-testid="project-select"]', 'project-1');
    await expect(page.locator('[data-testid="project-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="project-leader"]')).toBeVisible();
    await expect(page.locator('[data-testid="project-budget"]')).toBeVisible();
  });

  test("SCEN-284: 研究目的を入力して保存される", async ({ page }) => {
    // SCEN-284
    await page.fill('[data-testid="research-purpose"]', '新薬開発のための化合物分析実験');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="research-purpose"]')).toHaveValue('新薬開発のための化合物分析実験');
  });

  test("SCEN-285: 実験内容詳細が正常入力できる", async ({ page }) => {
    // SCEN-285
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.fill('[data-testid="date-input"]', '2024-12-25');
    await page.fill('[data-testid="experiment-details"]', 'タンパク質の構造解析実験。サンプル数：10個、測定時間：約2時間、使用試薬：○○溶液');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test("SCEN-286: 測定要件入力で申請が完了する", async ({ page }) => {
    // SCEN-286
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.fill('[data-testid="date-input"]', '2024-12-25');
    await page.fill('[data-testid="measurement-requirements"]', '温度25℃、湿度50%、測定時間2時間');
    await page.fill('[data-testid="research-purpose"]', '研究目的');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="application-complete"]')).toBeVisible();
  });

  test("SCEN-287: 申請者情報が正しく確認できる", async ({ page }) => {
    // SCEN-287
    await expect(page.locator('[data-testid="applicant-name"]')).toContainText('testuser');
    await expect(page.locator('[data-testid="applicant-department"]')).toBeVisible();
    await expect(page.locator('[data-testid="applicant-contact"]')).toBeVisible();
  });

  test("SCEN-288: 緊急連絡先入力で申請送信完了", async ({ page }) => {
    // SCEN-288
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.fill('[data-testid="date-input"]', '2024-12-25');
    await page.fill('[data-testid="research-purpose"]', '研究目的');
    await page.fill('[data-testid="emergency-contact-phone"]', '090-1234-5678');
    await page.fill('[data-testid="emergency-contact-name"]', '緊急連絡者');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="application-number"]')).toBeVisible();
  });

  test("SCEN-289: 存在しない機器名で検索結果なし", async ({ page }) => {
    // SCEN-289
    await page.fill('[data-testid="equipment-search"]', '存在しない機器XYZ123');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="no-results-message"]')).toContainText('該当する機器が見つかりませんでした');
  });

  test("SCEN-290: 過去日付選択でエラーメッセージ", async ({ page }) => {
    // SCEN-290
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.fill('[data-testid="date-input"]', '2023-01-01');
    await page.fill('[data-testid="start-time"]', '09:00');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('過去の日付');
  });

  test("SCEN-291: 予約済み時間選択で競合エラー", async ({ page }) => {
    // SCEN-291
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.fill('[data-testid="date-input"]', '2024-12-25');
    await page.fill('[data-testid="start-time"]', '14:00');
    await page.fill('[data-testid="research-purpose"]', '研究目的');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="conflict-error"]')).toContainText('既に予約されています');
  });

  test("SCEN-292: 利用時間未設定で申請エラー", async ({ page }) => {
    // SCEN-292
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.fill('[data-testid="date-input"]', '2024-12-25');
    await page.fill('[data-testid="research-purpose"]', '研究目的');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="time-error"]')).toContainText('利用時間');
  });

  test("SCEN-293: プロジェクト未選択で送信エラー", async ({ page }) => {
    // SCEN-293
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.fill('[data-testid="date-input"]', '2024-12-25');
    await page.fill('[data-testid="start-time"]', '09:00');
    await page.fill('[data-testid="end-time"]', '12:00');
    await page.fill('[data-testid="research-purpose"]', '研究目的');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="project-error"]')).toContainText('プロジェクトが未選択');
  });

  test("SCEN-294: 研究目的空欄で必須エラー表示", async ({ page }) => {
    // SCEN-294
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.fill('[data-testid="date-input"]', '2024-12-25');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="purpose-error"]')).toContainText('研究目的');
  });

  test("SCEN-295: 測定要件未入力で申請不可", async ({ page }) => {
    // SCEN-295
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.fill('[data-testid="date-input"]', '2024-12-25');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="requirements-error"]')).toContainText('測定要件');
  });

  test("SCEN-296: 緊急連絡先不正形式でエラー", async ({ page }) => {
    // SCEN-296
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.fill('[data-testid="date-input"]', '2024-12-25');
    await page.fill('[data-testid="research-purpose"]', '研究目的');
    await page.fill('[data-testid="emergency-contact-phone"]', 'abc-defg-hijk');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="contact-error"]')).toBeVisible();
  });

  test("SCEN-297: 機器検索で部分一致結果表示", async ({ page }) => {
    // SCEN-297
    await page.fill('[data-testid="equipment-search"]', '顕微');
    await page.press('[data-testid="equipment-search"]', 'Enter');
    await expect(page.locator('[data-testid="equipment-item"]')).toContainText('顕微');
    await expect(page.locator('[data-testid="result-count"]')).toBeVisible();
  });

  test("SCEN-298: 当日予約の最短受付時間確認", async ({ page }) => {
    // SCEN-298
    const today = new Date().toISOString().split('T')[0];
    await page.fill('[data-testid="date-input"]', today);
    await expect(page.locator('[data-testid="time-slot"].disabled')).toHaveCount({ min: 1 });
    await page.click('[data-testid="time-slot"]:not(.disabled):first-child');
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.click('[data-testid="submit-button"]');
  });

  test("SCEN-299: 最大連続利用時間での申請", async ({ page }) => {
    // SCEN-299
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.fill('[data-testid="date-input"]', '2024-12-25');
    await page.fill('[data-testid="start-time"]', '09:00');
    await page.fill('[data-testid="end-time"]', '17:00');
    await page.fill('[data-testid="research-purpose"]', '研究目的');
    await page.click('[data-testid="submit-button"]');
    await page.click('[data-testid="confirm-ok"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test("SCEN-300: 研究目的文字数上限での入力", async ({ page }) => {
    // SCEN-300
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.fill('[data-testid="date-input"]', '2024-12-25');
    const maxText = 'a'.repeat(1000);
    await page.fill('[data-testid="research-purpose"]', maxText);
    await expect(page.locator('[data-testid="char-count"]')).toContainText('1000');
    await page.fill('[data-testid="research-purpose"]', maxText + 'b');
    await expect(page.locator('[data-testid="research-purpose"]')).toHaveValue(maxText);
  });

  test("SCEN-301: 実験内容最大文字数入力確認", async ({ page }) => {
    // SCEN-301
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.fill('[data-testid="date-input"]', '2024-12-25');
    const maxText = 'a'.repeat(1000);
    await page.fill('[data-testid="experiment-details"]', maxText);
    await page.fill('[data-testid="experiment-details"]', maxText + 'b');
    await expect(page.locator('[data-testid="experiment-details"]')).toHaveValue(maxText);
    await page.click('[data-testid="submit-button"]');
  });

  test("SCEN-302: 最大予約可能日数での申請", async ({ page }) => {
    // SCEN-302
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.fill('[data-testid="start-date"]', '2024-12-25');
    await page.fill('[data-testid="end-date"]', '2025-01-25');
    await page.fill('[data-testid="research-purpose"]', '研究目的');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="application-status"]')).toContainText('申請中');
  });
});