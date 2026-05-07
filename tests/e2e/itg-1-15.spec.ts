import { test, expect } from '@playwright/test';

describe("機器予約管理", () => {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseURL}/login`);
    await page.fill('[data-testid="username"]', 'testuser');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/dashboard');
  });

  test("SCEN-001: 機器名での検索が正常に動作する", async ({ page }) => {
    // SCEN-001
    await page.goto(`${baseURL}/equipment/search`);
    await page.fill('[data-testid="equipment-name-search"]', '顕微鏡');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="equipment-name"]')).toContainText('顕微鏡');
  });

  test("SCEN-002: カテゴリ選択で機器一覧が絞り込まれる", async ({ page }) => {
    // SCEN-002
    await page.goto(`${baseURL}/equipment`);
    await page.selectOption('[data-testid="category-filter"]', '顕微鏡');
    await expect(page.locator('[data-testid="equipment-category"]').first()).toContainText('顕微鏡');
    await page.selectOption('[data-testid="category-filter"]', '分析装置');
    await expect(page.locator('[data-testid="equipment-category"]').first()).toContainText('分析装置');
    await page.selectOption('[data-testid="category-filter"]', 'すべて');
    await expect(page.locator('[data-testid="equipment-list"]')).toBeVisible();
  });

  test("SCEN-003: カレンダーで日付選択できる", async ({ page }) => {
    // SCEN-003
    await page.goto(`${baseURL}/reservation`);
    await page.click('[data-testid="equipment-select"]');
    await page.click('[data-testid="calendar-date"][data-date="2024-03-15"]');
    await expect(page.locator('[data-testid="calendar-date"][data-date="2024-03-15"]')).toHaveClass(/selected/);
    await page.click('[data-testid="calendar-date"][data-date="2024-03-16"]');
    await expect(page.locator('[data-testid="calendar-date"][data-date="2024-03-16"]')).toHaveClass(/selected/);
  });

  test("SCEN-004: 機器詳細情報が正しく表示される", async ({ page }) => {
    // SCEN-004
    await page.goto(`${baseURL}/equipment`);
    await page.click('[data-testid="equipment-item"]');
    await expect(page.locator('[data-testid="equipment-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="equipment-model"]')).toBeVisible();
    await expect(page.locator('[data-testid="equipment-specs"]')).toBeVisible();
    await expect(page.locator('[data-testid="available-hours"]')).toBeVisible();
  });

  test("SCEN-005: 予約状況タイムラインが表示される", async ({ page }) => {
    // SCEN-005
    await page.goto(`${baseURL}/reservation/timeline`);
    await page.click('[data-testid="timeline-button"]');
    await page.fill('[data-testid="date-range-start"]', '2024-03-01');
    await page.fill('[data-testid="date-range-end"]', '2024-03-31');
    await page.selectOption('[data-testid="category-select"]', '顕微鏡');
    await expect(page.locator('[data-testid="timeline-view"]')).toBeVisible();
  });

  test("SCEN-006: 新規予約が正常に作成できる", async ({ page }) => {
    // SCEN-006
    await page.goto(`${baseURL}/reservation`);
    await page.click('[data-testid="new-reservation-button"]');
    await page.selectOption('[data-testid="equipment-select"]', 'microscope-001');
    await page.fill('[data-testid="start-datetime"]', '2024-03-15T10:00');
    await page.fill('[data-testid="end-datetime"]', '2024-03-15T12:00');
    await page.fill('[data-testid="purpose"]', '実験用データ測定');
    await page.click('[data-testid="register-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toContainText('予約が完了しました');
  });

  test("SCEN-007: 既存予約の変更が正常にできる", async ({ page }) => {
    // SCEN-007
    await page.goto(`${baseURL}/reservation/list`);
    await page.click('[data-testid="reservation-item"]:first-child [data-testid="edit-button"]');
    await page.fill('[data-testid="start-datetime"]', '2024-03-16T14:00');
    await page.fill('[data-testid="end-datetime"]', '2024-03-16T16:00');
    await page.fill('[data-testid="remarks"]', '時間変更のため');
    await page.click('[data-testid="confirm-button"]');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toContainText('変更が完了しました');
  });

  test("SCEN-008: 予約キャンセルが正常に実行される", async ({ page }) => {
    // SCEN-008
    await page.goto(`${baseURL}/reservation/list`);
    await page.click('[data-testid="reservation-item"]:first-child [data-testid="cancel-button"]');
    await page.click('[data-testid="confirm-cancel-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toContainText('キャンセルが完了しました');
    await expect(page.locator('[data-testid="reservation-status"]')).toContainText('キャンセル済み');
  });

  test("SCEN-009: 利用目的入力後に保存できる", async ({ page }) => {
    // SCEN-009
    await page.goto(`${baseURL}/reservation`);
    await page.selectOption('[data-testid="equipment-select"]', 'microscope-001');
    await page.fill('[data-testid="start-datetime"]', '2024-03-15T10:00');
    await page.fill('[data-testid="end-datetime"]', '2024-03-15T12:00');
    await page.fill('[data-testid="purpose"]', '実験データ測定のため');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toContainText('保存が完了しました');
  });

  test("SCEN-010: 実験内容詳細を入力して登録", async ({ page }) => {
    // SCEN-010
    await page.goto(`${baseURL}/reservation`);
    await page.selectOption('[data-testid="equipment-select"]', 'microscope-001');
    await page.fill('[data-testid="start-datetime"]', '2024-03-15T10:00');
    await page.fill('[data-testid="end-datetime"]', '2024-03-15T13:00');
    await page.fill('[data-testid="experiment-details"]', 'タンパク質の精製実験。サンプル数5個、予想実験時間3時間');
    await page.click('[data-testid="register-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toContainText('登録が完了しました');
  });

  test("SCEN-011: 測定要件設定が正常に保存される", async ({ page }) => {
    // SCEN-011
    await page.goto(`${baseURL}/equipment/detail/microscope-001`);
    await page.click('[data-testid="reserve-button"]');
    await page.fill('[data-testid="start-datetime"]', '2024-03-15T10:00');
    await page.fill('[data-testid="end-datetime"]', '2024-03-15T12:00');
    await page.fill('[data-testid="measurement-time"]', '120');
    await page.fill('[data-testid="sample-count"]', '5');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toContainText('測定要件が保存されました');
  });

  test("SCEN-012: 存在しない機器名でエラー表示", async ({ page }) => {
    // SCEN-012
    await page.goto(`${baseURL}/reservation`);
    await page.fill('[data-testid="equipment-name-search"]', '存在しない機器999');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('指定された機器が見つかりません');
  });

  test("SCEN-013: 過去日付選択でエラーメッセージ", async ({ page }) => {
    // SCEN-013
    await page.goto(`${baseURL}/reservation`);
    await page.selectOption('[data-testid="equipment-select"]', 'microscope-001');
    await page.fill('[data-testid="reservation-date"]', '2023-01-01');
    await page.fill('[data-testid="start-time"]', '10:00');
    await page.click('[data-testid="confirm-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('過去の日付は予約できません');
  });

  test("SCEN-014: 重複時間帯予約でエラー表示", async ({ page }) => {
    // SCEN-014
    await page.goto(`${baseURL}/reservation`);
    await page.selectOption('[data-testid="equipment-select"]', 'microscope-001');
    await page.fill('[data-testid="start-datetime"]', '2024-03-15T10:00');
    await page.fill('[data-testid="end-datetime"]', '2024-03-15T12:00');
    await page.click('[data-testid="confirm-button"]');
    await page.fill('[data-testid="start-datetime"]', '2024-03-15T11:00');
    await page.fill('[data-testid="end-datetime"]', '2024-03-15T13:00');
    await page.click('[data-testid="confirm-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('重複する時間帯での予約はできません');
  });

  test("SCEN-015: 権限なし機器でアクセス拒否", async ({ page }) => {
    // SCEN-015
    await page.goto(`${baseURL}/equipment`);
    await page.click('[data-testid="restricted-equipment"]');
    await expect(page.locator('[data-testid="access-denied-message"]')).toContainText('この機器へのアクセス権限がありません');
    await page.click('[data-testid="reserve-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('予約権限がありません');
  });

  test("SCEN-016: 存在しない予約IDで変更エラー", async ({ page }) => {
    // SCEN-016
    await page.goto(`${baseURL}/reservation/edit/99999`);
    await expect(page.locator('[data-testid="error-message"]')).toContainText('指定された予約IDが見つかりません');
    await page.goto(`${baseURL}/reservation/search`);
    await page.fill('[data-testid="reservation-id-search"]', '99999');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('予約が存在しません');
  });

  test("SCEN-017: キャンセル済み予約で操作エラー", async ({ page }) => {
    // SCEN-017
    await page.goto(`${baseURL}/reservation/list`);
    await page.click('[data-testid="cancelled-reservation"] [data-testid="edit-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('キャンセル済みの予約は変更できません');
    await page.click('[data-testid="cancelled-reservation"] [data-testid="delete-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('キャンセル済みの予約は削除できません');
  });

  test("SCEN-018: 利用目的未入力でバリデーション", async ({ page }) => {
    // SCEN-018
    await page.goto(`${baseURL}/reservation`);
    await page.selectOption('[data-testid="equipment-select"]', 'microscope-001');
    await page.fill('[data-testid="start-datetime"]', '2024-03-15T10:00');
    await page.fill('[data-testid="end-datetime"]', '2024-03-15T12:00');
    await page.click('[data-testid="confirm-button"]');
    await expect(page.locator('[data-testid="validation-error"]')).toContainText('利用目的は必須項目です');
    await expect(page).toHaveURL(/.*reservation$/);
  });

  test("SCEN-019: 不正な測定要件でエラー表示", async ({ page }) => {
    // SCEN-019
    await page.goto(`${baseURL}/reservation`);
    await page.selectOption('[data-testid="equipment-select"]', 'microscope-001');
    await page.fill('[data-testid="start-datetime"]', '2024-03-15T10:00');
    await page.fill('[data-testid="end-datetime"]', '2024-03-15T12:00');
    await page.fill('[data-testid="measurement-requirements"]', '<script>alert("test")</script>');
    await page.click('[data-testid="confirm-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('測定要件に不正な文字が含まれています');
  });

  test("SCEN-020: 検索文字数上限でのフィルター", async ({ page }) => {
    // SCEN-020
    await page.goto(`${baseURL}/equipment/search`);
    const longText255 = 'a'.repeat(255);
    const longText256 = 'a'.repeat(256);
    await page.fill('[data-testid="equipment-name-search"]', longText255);
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await page.fill('[data-testid="equipment-name-search"]', longText256);
    await expect(page.locator('[data-testid="error-message"]')).toContainText('検索文字数が上限を超えています');
  });

  test("SCEN-021: 最大予約期間での新規作成", async ({ page }) => {
    // SCEN-021
    await page.goto(`${baseURL}/reservation`);
    await page.click('[data-testid="new-reservation-button"]');
    await page.selectOption('[data-testid="equipment-select"]', 'microscope-001');
    await page.fill('[data-testid="start-datetime"]', '2024-03-15T09:00');
    await page.fill('[data-testid="end-datetime"]', '2024-03-22T09:00');
    await page.fill('[data-testid="purpose"]', '長期実験のため');
    await page.click('[data-testid="create-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toContainText('予約が作成されました');
  });

  test("SCEN-022: 予約開始1分前のキャンセル", async ({ page }) => {
    // SCEN-022
    await page.goto(`${baseURL}/reservation/list`);
    await page.click('[data-testid="imminent-reservation"] [data-testid="cancel-button"]');
    await page.click('[data-testid="confirm-cancel-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('この予約は開始直前のためキャンセルできません');
  });

  test("SCEN-023: 文字数上限の利用目的入力", async ({ page }) => {
    // SCEN-023
    await page.goto(`${baseURL}/reservation`);
    await page.selectOption('[data-testid="equipment-select"]', 'microscope-001');
    await page.fill('[data-testid="start-datetime"]', '2024-03-15T10:00');
    await page.fill('[data-testid="end-datetime"]', '2024-03-15T12:00');
    await page.fill('[data-testid="purpose"]', 'a'.repeat(500));
    await page.click('[data-testid="confirm-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toContainText('予約が完了しました');
    await page.fill('[data-testid="purpose"]', 'a'.repeat(501));
    await page.click('[data-testid="confirm-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('文字数上限を超えています');
  });

  test("SCEN-024: 最大文字数の実験内容入力", async ({ page }) => {
    // SCEN-024
    await page.goto(`${baseURL}/reservation`);
    await page.selectOption('[data-testid="equipment-select"]', 'microscope-001');
    await page.fill('[data-testid="start-datetime"]', '2024-03-15T10:00');
    await page.fill('[data-testid="end-datetime"]', '2024-03-15T12:00');
    await page.fill('[data-testid="experiment-content"]', 'a'.repeat(1000));
    await expect(page.locator('[data-testid="character-count"]')).toContainText('1000/1000');
    await page.click('[data-testid="register-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toContainText('予約が登録されました');
  });

  test("SCEN-025: 同時刻複数機器予約の境界", async ({ page }) => {
    // SCEN-025
    await page.goto(`${baseURL}/reservation`);
    await page.selectOption('[data-testid="equipment-select"]', 'microscope-001');
    await page.fill('[data-testid="start-datetime"]', '2024-03-15T10:00');
    await page.fill('[data-testid="end-datetime"]', '2024-03-15T12:00');
    await page.click('[data-testid="add-equipment-button"]');
    await page.selectOption('[data-testid="equipment-select-2"]', 'analyzer-001');
    await page.click('[data-testid="confirm-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toContainText('複数機器の予約が完了しました');
  });

  test("SCEN-026: 営業時間ぎりぎりの予約作成", async ({ page }) => {
    // SCEN-026
    await page.goto(`${baseURL}/reservation`);
    await page.selectOption('[data-testid="equipment-select"]', 'microscope-001');
    await page.click('[data-testid="calendar-date"][data-date="2024-03-15"]');
    await page.fill('[data-testid="start-time"]', '09:00');
    await page.fill('[data-testid="end-time"]', '17:00');
    await page.fill('[data-testid="purpose"]', '終日実験');
    await page.click('[data-testid="confirm-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toContainText('予約が完了しました');
  });

  test("SCEN-027: 月末最終日の予約変更処理", async ({ page }) => {
    // SCEN-027
    await page.goto(`${baseURL}/reservation/list`);
    await page.click('[data-testid="month-end-reservation"] [data-testid="edit-button"]');
    await page.fill('[data-testid="start-time"]', '14:00');
    await page.fill('[data-testid="end-time"]', '16:00');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toContainText('変更が完了しました');
    await expect(page.locator('[data-testid="updated-time"]')).toContainText('14:00-16:00');
  });
});