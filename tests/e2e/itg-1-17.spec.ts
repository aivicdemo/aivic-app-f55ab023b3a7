import { test, expect } from '@playwright/test';

describe("予約スケジュール", () => {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseURL}/login`);
    await page.fill('[data-testid="username"]', 'testuser');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(`${baseURL}/dashboard`);
  });

  test("SCEN-060: 機器選択ドロップダウンで機器を選択", async ({ page }) => {
    // SCEN-060
    await page.goto(`${baseURL}/reservation-schedule`);
    await page.click('[data-testid="equipment-dropdown"]');
    await expect(page.locator('[data-testid="equipment-list"]')).toBeVisible();
    await page.click('[data-testid="equipment-option-1"]');
    await expect(page.locator('[data-testid="equipment-dropdown"]')).toContainText('機器1');
    await expect(page.locator('[data-testid="schedule-view"]')).toBeVisible();
  });

  test("SCEN-061: カレンダー表示を月表示に切替", async ({ page }) => {
    // SCEN-061
    await page.goto(`${baseURL}/reservation-schedule`);
    await page.click('[data-testid="view-toggle-month"]');
    await expect(page.locator('[data-testid="calendar-month-view"]')).toBeVisible();
    await expect(page.locator('[data-testid="month-grid"]')).toBeVisible();
    await expect(page.locator('[data-testid="reservation-items"]')).toBeVisible();
  });

  test("SCEN-062: カレンダー表示を週表示に切替", async ({ page }) => {
    // SCEN-062
    await page.goto(`${baseURL}/reservation-schedule`);
    await page.click('[data-testid="view-toggle-week"]');
    await expect(page.locator('[data-testid="calendar-week-view"]')).toBeVisible();
    await expect(page.locator('[data-testid="week-grid"]')).toBeVisible();
    await expect(page.locator('[data-testid="time-slots"]')).toBeVisible();
  });

  test("SCEN-063: カレンダー表示を日表示に切替", async ({ page }) => {
    // SCEN-063
    await page.goto(`${baseURL}/reservation-schedule`);
    await page.click('[data-testid="view-toggle-day"]');
    await expect(page.locator('[data-testid="calendar-day-view"]')).toBeVisible();
    await expect(page.locator('[data-testid="time-axis"]')).toBeVisible();
    await expect(page.locator('[data-testid="current-time-highlight"]')).toBeVisible();
  });

  test("SCEN-064: 日付選択カレンダーで特定日を選択", async ({ page }) => {
    // SCEN-064
    await page.goto(`${baseURL}/reservation-schedule`);
    await page.click('[data-testid="date-picker"]');
    await page.click('[data-testid="calendar-date-15"]');
    await expect(page.locator('[data-testid="calendar-date-15"]')).toHaveClass(/selected/);
    await expect(page.locator('[data-testid="selected-date"]')).toContainText('15');
  });

  test("SCEN-065: 空き時間帯をクリックして新規予約", async ({ page }) => {
    // SCEN-065
    await page.goto(`${baseURL}/reservation-schedule`);
    await page.click('[data-testid="equipment-dropdown"]');
    await page.click('[data-testid="equipment-option-1"]');
    await page.click('[data-testid="available-slot-1000"]');
    await expect(page.locator('[data-testid="new-reservation-form"]')).toBeVisible();
    await page.fill('[data-testid="purpose-input"]', 'テスト予約');
    await page.click('[data-testid="confirm-reservation"]');
    await expect(page.locator('[data-testid="reserved-slot-1000"]')).toBeVisible();
  });

  test("SCEN-066: 予約時間選択スライダーで時間設定", async ({ page }) => {
    // SCEN-066
    await page.goto(`${baseURL}/reservation-schedule`);
    await page.click('[data-testid="equipment-dropdown"]');
    await page.click('[data-testid="equipment-option-1"]');
    await page.click('[data-testid="new-reservation-button"]');
    await page.locator('[data-testid="start-time-slider"]').fill('10:00');
    await page.locator('[data-testid="end-time-slider"]').fill('12:00');
    await expect(page.locator('[data-testid="selected-time-display"]')).toContainText('10:00 - 12:00');
    await page.click('[data-testid="confirm-time"]');
  });

  test("SCEN-067: 利用目的入力フィールドに目的記入", async ({ page }) => {
    // SCEN-067
    await page.goto(`${baseURL}/reservation-schedule`);
    await page.click('[data-testid="equipment-dropdown"]');
    await page.click('[data-testid="equipment-option-1"]');
    await page.click('[data-testid="available-slot-1000"]');
    await page.fill('[data-testid="purpose-input"]', '実験用サンプルの分析測定');
    await expect(page.locator('[data-testid="purpose-input"]')).toHaveValue('実験用サンプルの分析測定');
  });

  test("SCEN-068: 予約詳細ポップアップが正しく表示", async ({ page }) => {
    // SCEN-068
    await page.goto(`${baseURL}/reservation-schedule`);
    await page.click('[data-testid="equipment-dropdown"]');
    await page.click('[data-testid="equipment-option-1"]');
    await page.click('[data-testid="existing-reservation"]');
    await expect(page.locator('[data-testid="reservation-popup"]')).toBeVisible();
    await expect(page.locator('[data-testid="reservation-details"]')).toContainText('予約者名');
    await expect(page.locator('[data-testid="reservation-details"]')).toContainText('予約時間');
  });

  test("SCEN-069: 予約完了後にスケジュールに反映", async ({ page }) => {
    // SCEN-069
    await page.goto(`${baseURL}/reservation-schedule`);
    await page.click('[data-testid="equipment-dropdown"]');
    await page.click('[data-testid="equipment-option-1"]');
    await page.click('[data-testid="available-slot-1400"]');
    await page.fill('[data-testid="purpose-input"]', 'テスト利用');
    await page.click('[data-testid="confirm-reservation"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await page.goto(`${baseURL}/reservation-schedule`);
    await expect(page.locator('[data-testid="reserved-slot-1400"]')).toBeVisible();
  });

  test("SCEN-070: 機器稼働状況インジケーター表示", async ({ page }) => {
    // SCEN-070
    await page.goto(`${baseURL}/reservation-schedule`);
    await page.click('[data-testid="equipment-dropdown"]');
    await page.click('[data-testid="equipment-option-1"]');
    await expect(page.locator('[data-testid="equipment-status-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="status-icon"]')).toBeVisible();
    await page.hover('[data-testid="equipment-status-indicator"]');
    await expect(page.locator('[data-testid="status-tooltip"]')).toBeVisible();
  });

  test("SCEN-071: 機器選択せずにスケジュール表示", async ({ page }) => {
    // SCEN-071
    await page.goto(`${baseURL}/reservation-schedule`);
    await page.click('[data-testid="show-schedule-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('機器を選択してください');
  });

  test("SCEN-072: 予約済み時間帯をクリック", async ({ page }) => {
    // SCEN-072
    await page.goto(`${baseURL}/reservation-schedule`);
    await page.click('[data-testid="equipment-dropdown"]');
    await page.click('[data-testid="equipment-option-1"]');
    await page.click('[data-testid="reserved-slot"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('この時間帯は既に予約されています');
  });

  test("SCEN-073: 過去日付で新規予約を作成", async ({ page }) => {
    // SCEN-073
    await page.goto(`${baseURL}/reservation-schedule`);
    await page.click('[data-testid="new-reservation-button"]');
    await page.click('[data-testid="equipment-dropdown"]');
    await page.click('[data-testid="equipment-option-1"]');
    await page.fill('[data-testid="date-input"]', '2023-12-01');
    await page.fill('[data-testid="purpose-input"]', 'テスト');
    await page.click('[data-testid="submit-reservation"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('過去の日付では予約できません');
  });

  test("SCEN-074: 利用目的未入力で予約作成", async ({ page }) => {
    // SCEN-074
    await page.goto(`${baseURL}/reservation-schedule`);
    await page.click('[data-testid="equipment-dropdown"]');
    await page.click('[data-testid="equipment-option-1"]');
    await page.click('[data-testid="available-slot-1500"]');
    await page.click('[data-testid="confirm-reservation"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('利用目的を入力してください');
  });

  test("SCEN-075: 予約時間の開始終了が同時刻", async ({ page }) => {
    // SCEN-075
    await page.goto(`${baseURL}/reservation-schedule`);
    await page.click('[data-testid="equipment-dropdown"]');
    await page.click('[data-testid="equipment-option-1"]');
    await page.click('[data-testid="new-reservation-button"]');
    await page.fill('[data-testid="start-time"]', '10:00');
    await page.fill('[data-testid="end-time"]', '10:00');
    await page.click('[data-testid="submit-reservation"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('開始時刻と終了時刻が同じため予約できません');
  });

  test("SCEN-076: 予約終了時刻が開始時刻より前", async ({ page }) => {
    // SCEN-076
    await page.goto(`${baseURL}/reservation-schedule`);
    await page.click('[data-testid="equipment-dropdown"]');
    await page.click('[data-testid="equipment-option-1"]');
    await page.click('[data-testid="new-reservation-button"]');
    await page.fill('[data-testid="start-time"]', '14:00');
    await page.fill('[data-testid="end-time"]', '13:00');
    await page.click('[data-testid="submit-reservation"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('終了時刻は開始時刻より後に設定してください');
  });

  test("SCEN-077: 機器メンテナンス中に予約作成", async ({ page }) => {
    // SCEN-077
    await page.goto(`${baseURL}/reservation-schedule`);
    await page.click('[data-testid="equipment-dropdown"]');
    await page.click('[data-testid="maintenance-equipment"]');
    await page.click('[data-testid="new-reservation-button"]');
    await page.fill('[data-testid="purpose-input"]', 'テスト');
    await page.click('[data-testid="submit-reservation"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('選択された機器はメンテナンス中のため予約できません');
  });

  test("SCEN-078: システム時刻の1分前に予約作成", async ({ page }) => {
    // SCEN-078
    await page.goto(`${baseURL}/reservation-schedule`);
    await page.click('[data-testid="equipment-dropdown"]');
    await page.click('[data-testid="equipment-option-1"]');
    await page.click('[data-testid="new-reservation-button"]');
    const pastTime = new Date(Date.now() - 60000).toTimeString().slice(0, 5);
    await page.fill('[data-testid="start-time"]', pastTime);
    await page.fill('[data-testid="purpose-input"]', 'テスト');
    await page.click('[data-testid="submit-reservation"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('過去の時刻では予約できません');
  });

  test("SCEN-079: 機器利用可能時間の境界で予約", async ({ page }) => {
    // SCEN-079
    await page.goto(`${baseURL}/reservation-schedule`);
    await page.click('[data-testid="equipment-dropdown"]');
    await page.click('[data-testid="equipment-option-1"]');
    await page.click('[data-testid="new-reservation-button"]');
    await page.fill('[data-testid="start-time"]', '09:00');
    await page.fill('[data-testid="end-time"]', '18:00');
    await page.fill('[data-testid="purpose-input"]', '境界値テスト');
    await page.click('[data-testid="submit-reservation"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="reservation-list"]')).toContainText('09:00 - 18:00');
  });

  test("SCEN-080: 利用目的に最大文字数を入力", async ({ page }) => {
    // SCEN-080
    await page.goto(`${baseURL}/reservation-schedule`);
    await page.click('[data-testid="equipment-dropdown"]');
    await page.click('[data-testid="equipment-option-1"]');
    await page.click('[data-testid="available-slot-1100"]');
    const maxText = 'A'.repeat(1000);
    await page.fill('[data-testid="purpose-input"]', maxText);
    await page.click('[data-testid="confirm-reservation"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test("SCEN-081: 利用目的に最大文字数+1を入力", async ({ page }) => {
    // SCEN-081
    await page.goto(`${baseURL}/reservation-schedule`);
    await page.click('[data-testid="equipment-dropdown"]');
    await page.click('[data-testid="equipment-option-1"]');
    await page.click('[data-testid="available-slot-1200"]');
    const overMaxText = 'A'.repeat(1001);
    await page.fill('[data-testid="purpose-input"]', overMaxText);
    await page.click('[data-testid="confirm-reservation"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('利用目的は1000文字以内で入力してください');
  });

  test("SCEN-082: 予約可能上限時間で予約作成", async ({ page }) => {
    // SCEN-082
    await page.goto(`${baseURL}/reservation-schedule`);
    await page.click('[data-testid="equipment-dropdown"]');
    await page.click('[data-testid="equipment-option-1"]');
    await page.click('[data-testid="new-reservation-button"]');
    await page.fill('[data-testid="start-time"]', '10:00');
    await page.fill('[data-testid="end-time"]', '13:00');
    await page.fill('[data-testid="purpose-input"]', '上限時間テスト');
    await page.click('[data-testid="submit-reservation"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test("SCEN-083: 予約可能上限+1分で予約作成", async ({ page }) => {
    // SCEN-083
    await page.goto(`${baseURL}/reservation-schedule`);
    await page.click('[data-testid="equipment-dropdown"]');
    await page.click('[data-testid="equipment-option-1"]');
    await page.click('[data-testid="new-reservation-button"]');
    await page.fill('[data-testid="start-time"]', '10:00');
    await page.fill('[data-testid="end-time"]', '13:01');
    await page.fill('[data-testid="purpose-input"]', 'テスト');
    await page.click('[data-testid="submit-reservation"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('予約可能上限時間を超過しています');
  });

  test("SCEN-084: 月末日から翌月1日の表示切替", async ({ page }) => {
    // SCEN-084
    await page.goto(`${baseURL}/reservation-schedule`);
    await page.click('[data-testid="calendar-date-31"]');
    await expect(page.locator('[data-testid="current-date"]')).toContainText('31');
    await page.click('[data-testid="next-day-button"]');
    await expect(page.locator('[data-testid="current-date"]')).toContainText('1');
    await expect(page.locator('[data-testid="month-display"]')).toContainText('2月');
    await page.click('[data-testid="prev-day-button"]');
    await expect(page.locator('[data-testid="current-date"]')).toContainText('31');
  });

  test("SCEN-085: 年末年始をまたぐ週表示", async ({ page }) => {
    // SCEN-085
    await page.goto(`${baseURL}/reservation-schedule`);
    await page.click('[data-testid="view-toggle-week"]');
    await page.click('[data-testid="navigate-to-year-end-week"]');
    await expect(page.locator('[data-testid="week-view"]')).toContainText('12月31日');
    await expect(page.locator('[data-testid="week-view"]')).toContainText('1月6日');
    await expect(page.locator('[data-testid="year-display"]')).toContainText('2024');
    await expect(page.locator('[data-testid="week-schedule"]')).toBeVisible();
  });
});