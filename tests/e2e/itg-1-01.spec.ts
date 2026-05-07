import { test, expect } from '@playwright/test';

describe("機器予約管理", () => {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseURL}/login`);
    await page.fill('[data-testid="username"]', 'testuser');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(`${baseURL}/dashboard`);
  });

  test("SCEN-001: 機器名での検索が正常に動作する", async ({ page }) => {
    // SCEN-001
    await page.goto(`${baseURL}/equipment/search`);
    await page.fill('[data-testid="equipment-search"]', '顕微鏡');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    const results = page.locator('[data-testid="equipment-name"]');
    await expect(results.first()).toContainText('顕微鏡');
  });

  test("SCEN-002: カテゴリ選択で機器一覧が絞り込まれる", async ({ page }) => {
    // SCEN-002
    await page.goto(`${baseURL}/equipment`);
    await page.selectOption('[data-testid="category-filter"]', '顕微鏡');
    await expect(page.locator('[data-testid="equipment-list"]')).toBeVisible();
    await page.selectOption('[data-testid="category-filter"]', '分析装置');
    await expect(page.locator('[data-testid="equipment-list"]')).toBeVisible();
    await page.selectOption('[data-testid="category-filter"]', 'すべて');
    await expect(page.locator('[data-testid="equipment-list"]')).toBeVisible();
  });

  test("SCEN-003: カレンダーで日付選択できる", async ({ page }) => {
    // SCEN-003
    await page.goto(`${baseURL}/reservation`);
    await page.click('[data-testid="equipment-select"]');
    await page.click('[data-testid="calendar-date"]:nth-child(15)');
    await expect(page.locator('[data-testid="calendar-date"].selected')).toBeVisible();
    await page.click('[data-testid="calendar-date"]:nth-child(20)');
    await expect(page.locator('[data-testid="calendar-date"].selected')).toHaveCount(1);
  });

  test("SCEN-004: 機器詳細情報が正しく表示される", async ({ page }) => {
    // SCEN-004
    await page.goto(`${baseURL}/equipment`);
    await page.click('[data-testid="equipment-item"]:first-child');
    await expect(page.locator('[data-testid="equipment-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="equipment-model"]')).toBeVisible();
    await expect(page.locator('[data-testid="equipment-specs"]')).toBeVisible();
    await expect(page.locator('[data-testid="available-hours"]')).toBeVisible();
    await expect(page.locator('[data-testid="usage-fee"]')).toBeVisible();
  });

  test("SCEN-005: 予約状況タイムラインが表示される", async ({ page }) => {
    // SCEN-005
    await page.goto(`${baseURL}/reservation/timeline`);
    await page.click('[data-testid="timeline-button"]');
    await page.fill('[data-testid="date-range"]', '2024-01-01');
    await page.selectOption('[data-testid="equipment-category"]', '顕微鏡');
    await expect(page.locator('[data-testid="timeline-view"]')).toBeVisible();
    await expect(page.locator('[data-testid="reservation-status"]')).toBeVisible();
  });

  test("SCEN-006: 新規予約が正常に作成できる", async ({ page }) => {
    // SCEN-006
    await page.goto(`${baseURL}/reservation`);
    await page.click('[data-testid="new-reservation"]');
    await page.selectOption('[data-testid="equipment-select"]', 'microscope-001');
    await page.fill('[data-testid="start-datetime"]', '2024-03-15T10:00');
    await page.fill('[data-testid="end-datetime"]', '2024-03-15T12:00');
    await page.fill('[data-testid="purpose"]', 'データ測定実験');
    await page.click('[data-testid="reserve-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test("SCEN-007: 既存予約の変更が正常にできる", async ({ page }) => {
    // SCEN-007
    await page.goto(`${baseURL}/reservation/list`);
    await page.click('[data-testid="reservation-item"]:first-child');
    await page.click('[data-testid="edit-button"]');
    await page.fill('[data-testid="start-datetime"]', '2024-03-16T14:00');
    await page.fill('[data-testid="end-datetime"]', '2024-03-16T16:00');
    await page.fill('[data-testid="remarks"]', '時間変更のため');
    await page.click('[data-testid="confirm-button"]');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="update-success"]')).toBeVisible();
  });

  test("SCEN-008: 予約キャンセルが正常に実行される", async ({ page }) => {
    // SCEN-008
    await page.goto(`${baseURL}/reservation/list`);
    await page.click('[data-testid="reservation-item"]:first-child');
    await page.click('[data-testid="cancel-button"]');
    await page.click('[data-testid="confirm-cancel"]');
    await expect(page.locator('[data-testid="cancel-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="reservation-status"]')).toContainText('キャンセル済み');
  });

  test("SCEN-009: 利用目的入力後に保存できる", async ({ page }) => {
    // SCEN-009
    await page.goto(`${baseURL}/reservation`);
    await page.selectOption('[data-testid="equipment-select"]', 'microscope-002');
    await page.fill('[data-testid="datetime"]', '2024-03-20T10:00');
    await page.fill('[data-testid="purpose"]', '実験データ測定のため');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="save-success"]')).toBeVisible();
  });

  test("SCEN-010: 実験内容詳細を入力して登録", async ({ page }) => {
    // SCEN-010
    await page.goto(`${baseURL}/reservation`);
    await page.selectOption('[data-testid="equipment-select"]', 'analyzer-001');
    await page.fill('[data-testid="datetime"]', '2024-03-21T13:00');
    await page.fill('[data-testid="experiment-details"]', 'タンパク質の精製実験。サンプル数5個、予想実験時間3時間');
    await page.fill('[data-testid="materials"]', 'PBS溶液、試薬A');
    await page.fill('[data-testid="notes"]', '温度管理要注意');
    await page.click('[data-testid="register-button"]');
    await expect(page.locator('[data-testid="registration-success"]')).toBeVisible();
  });

  test("SCEN-011: 測定要件設定が正常に保存される", async ({ page }) => {
    // SCEN-011
    await page.goto(`${baseURL}/equipment/analyzer-001`);
    await page.click('[data-testid="reserve-button"]');
    await page.fill('[data-testid="datetime"]', '2024-03-22T09:00');
    await page.fill('[data-testid="measurement-time"]', '120');
    await page.fill('[data-testid="sample-count"]', '5');
    await page.fill('[data-testid="conditions"]', '室温25度、湿度50%');
    await page.fill('[data-testid="comments"]', '精密測定のため');
    await page.click('[data-testid="save-button"]');
    await page.click('[data-testid="ok-button"]');
    await expect(page.locator('[data-testid="measurement-requirements"]')).toBeVisible();
  });

  test("SCEN-012: 存在しない機器名でエラー表示", async ({ page }) => {
    // SCEN-012
    await page.goto(`${baseURL}/reservation`);
    await page.fill('[data-testid="equipment-search"]', '存在しない機器999');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('指定された機器が見つかりません');
  });

  test("SCEN-013: 過去日付選択でエラーメッセージ", async ({ page }) => {
    // SCEN-013
    await page.goto(`${baseURL}/reservation`);
    await page.selectOption('[data-testid="equipment-select"]', 'microscope-001');
    await page.fill('[data-testid="reservation-date"]', '2023-01-01');
    await page.fill('[data-testid="reservation-time"]', '10:00');
    await page.click('[data-testid="confirm-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('過去の日付は予約できません');
  });

  test("SCEN-014: 重複時間帯予約でエラー表示", async ({ page }) => {
    // SCEN-014
    await page.goto(`${baseURL}/reservation`);
    await page.selectOption('[data-testid="equipment-select"]', 'microscope-001');
    await page.fill('[data-testid="start-datetime"]', '2024-01-15T10:00');
    await page.fill('[data-testid="end-datetime"]', '2024-01-15T12:00');
    await page.click('[data-testid="confirm-button"]');
    await page.fill('[data-testid="start-datetime"]', '2024-01-15T11:00');
    await page.fill('[data-testid="end-datetime"]', '2024-01-15T13:00');
    await page.click('[data-testid="confirm-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('重複');
  });

  test("SCEN-015: 権限なし機器でアクセス拒否", async ({ page }) => {
    // SCEN-015
    await page.goto(`${baseURL}/equipment`);
    await page.click('[data-testid="restricted-equipment"]');
    await expect(page.locator('[data-testid="access-denied"]')).toBeVisible();
    await page.click('[data-testid="reserve-button"]');
    await expect(page.locator('[data-testid="permission-error"]')).toContainText('アクセス権限がありません');
  });

  test("SCEN-016: 存在しない予約IDで変更エラー", async ({ page }) => {
    // SCEN-016
    await page.goto(`${baseURL}/reservation/edit/99999`);
    await expect(page.locator('[data-testid="error-message"]')).toContainText('予約が見つかりません');
    await page.goto(`${baseURL}/reservation/search`);
    await page.fill('[data-testid="reservation-id"]', '99999');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="not-found"]')).toBeVisible();
  });

  test("SCEN-017: キャンセル済み予約で操作エラー", async ({ page }) => {
    // SCEN-017
    await page.goto(`${baseURL}/reservation/list`);
    await page.click('[data-testid="cancelled-reservation"]');
    await page.click('[data-testid="edit-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('キャンセル済み');
    await page.click('[data-testid="delete-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('操作できません');
  });

  test("SCEN-018: 利用目的未入力でバリデーション", async ({ page }) => {
    // SCEN-018
    await page.goto(`${baseURL}/reservation`);
    await page.selectOption('[data-testid="equipment-select"]', 'microscope-001');
    await page.fill('[data-testid="datetime"]', '2024-03-25T10:00');
    await page.click('[data-testid="confirm-button"]');
    await expect(page.locator('[data-testid="validation-error"]')).toContainText('利用目的は必須です');
  });

  test("SCEN-019: 不正な測定要件でエラー表示", async ({ page }) => {
    // SCEN-019
    await page.goto(`${baseURL}/reservation`);
    await page.selectOption('[data-testid="equipment-select"]', 'analyzer-001');
    await page.fill('[data-testid="datetime"]', '2024-03-26T14:00');
    await page.fill('[data-testid="measurement-requirements"]', '<script>alert("test")</script>');
    await page.click('[data-testid="confirm-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('不正な入力値');
  });

  test("SCEN-020: 検索文字数上限でのフィルター", async ({ page }) => {
    // SCEN-020
    await page.goto(`${baseURL}/equipment/search`);
    const maxText = 'a'.repeat(255);
    await page.fill('[data-testid="equipment-search"]', maxText);
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    const overMaxText = 'a'.repeat(256);
    await page.fill('[data-testid="equipment-search"]', overMaxText);
    await expect(page.locator('[data-testid="char-limit-error"]')).toBeVisible();
  });

  test("SCEN-021: 最大予約期間での新規作成", async ({ page }) => {
    // SCEN-021
    await page.goto(`${baseURL}/reservation`);
    await page.click('[data-testid="new-reservation"]');
    await page.selectOption('[data-testid="equipment-select"]', 'microscope-001');
    await page.fill('[data-testid="start-datetime"]', '2024-04-01T09:00');
    await page.fill('[data-testid="end-datetime"]', '2024-04-08T17:00');
    await page.fill('[data-testid="purpose"]', '長期実験');
    await page.click('[data-testid="create-button"]');
    await page.click('[data-testid="ok-button"]');
    await expect(page.locator('[data-testid="reservation-created"]')).toBeVisible();
  });

  test("SCEN-022: 予約開始1分前のキャンセル", async ({ page }) => {
    // SCEN-022
    await page.goto(`${baseURL}/reservation/list`);
    await page.click('[data-testid="imminent-reservation"]');
    await page.click('[data-testid="cancel-button"]');
    await page.click('[data-testid="confirm-yes"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('開始直前のためキャンセルできません');
  });

  test("SCEN-023: 文字数上限の利用目的入力", async ({ page }) => {
    // SCEN-023
    await page.goto(`${baseURL}/reservation`);
    await page.selectOption('[data-testid="equipment-select"]', 'microscope-001');
    await page.fill('[data-testid="datetime"]', '2024-04-10T10:00');
    const maxPurpose = 'a'.repeat(500);
    await page.fill('[data-testid="purpose"]', maxPurpose);
    await page.click('[data-testid="confirm-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    const overMaxPurpose = 'a'.repeat(501);
    await page.fill('[data-testid="purpose"]', overMaxPurpose);
    await page.click('[data-testid="confirm-button"]');
    await expect(page.locator('[data-testid="char-limit-error"]')).toBeVisible();
  });

  test("SCEN-024: 最大文字数の実験内容入力", async ({ page }) => {
    // SCEN-024
    await page.goto(`${baseURL}/reservation`);
    await page.selectOption('[data-testid="equipment-select"]', 'analyzer-001');
    await page.fill('[data-testid="datetime"]', '2024-04-12T13:00');
    const maxContent = 'a'.repeat(1000);
    await page.fill('[data-testid="experiment-content"]', maxContent);
    await expect(page.locator('[data-testid="char-count"]')).toContainText('1000');
    await page.click('[data-testid="register-button"]');
    await expect(page.locator('[data-testid="registration-success"]')).toBeVisible();
  });

  test("SCEN-025: 同時刻複数機器予約の境界", async ({ page }) => {
    // SCEN-025
    await page.goto(`${baseURL}/reservation`);
    await page.selectOption('[data-testid="equipment-select"]', 'microscope-001');
    await page.fill('[data-testid="datetime"]', '2024-04-15T10:00');
    await page.click('[data-testid="reserve