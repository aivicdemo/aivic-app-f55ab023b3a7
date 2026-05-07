import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

describe("予約スケジュール", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="username"]', 'testuser');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/dashboard');
  });

  test('SCEN-060: 機器選択ドロップダウンで機器を選択', async ({ page }) => {
    // SCEN-060
    await page.goto(`${BASE_URL}/schedule`);
    await page.click('[data-testid="equipment-dropdown"]');
    await expect(page.locator('[data-testid="equipment-list"]')).toBeVisible();
    await page.click('[data-testid="equipment-option-1"]');
    await expect(page.locator('[data-testid="equipment-dropdown"]')).toContainText('装置A');
    await expect(page.locator('[data-testid="schedule-view"]')).toBeVisible();
  });

  test('SCEN-061: カレンダー表示を月表示に切替', async ({ page }) => {
    // SCEN-061
    await page.goto(`${BASE_URL}/schedule`);
    await page.click('[data-testid="view-month"]');
    await expect(page.locator('[data-testid="calendar-month-view"]')).toBeVisible();
    await expect(page.locator('[data-testid="calendar-month-view"] .day')).toHaveCount(30);
    await expect(page.locator('[data-testid="existing-reservation"]')).toBeVisible();
  });

  test('SCEN-062: カレンダー表示を週表示に切替', async ({ page }) => {
    // SCEN-062
    await page.goto(`${BASE_URL}/schedule`);
    await page.click('[data-testid="view-week"]');
    await expect(page.locator('[data-testid="calendar-week-view"]')).toBeVisible();
    await expect(page.locator('[data-testid="calendar-week-view"] .day')).toHaveCount(7);
    await expect(page.locator('[data-testid="existing-reservation"]')).toBeVisible();
  });

  test('SCEN-063: カレンダー表示を日表示に切替', async ({ page }) => {
    // SCEN-063
    await page.goto(`${BASE_URL}/schedule`);
    await page.click('[data-testid="view-day"]');
    await expect(page.locator('[data-testid="calendar-day-view"]')).toBeVisible();
    await expect(page.locator('[data-testid="time-slots"]')).toBeVisible();
    await expect(page.locator('[data-testid="current-time-indicator"]')).toBeVisible();
  });

  test('SCEN-064: 日付選択カレンダーで特定日を選択', async ({ page }) => {
    // SCEN-064
    await page.goto(`${BASE_URL}/schedule`);
    await page.click('[data-testid="date-picker"]');
    await page.click('[data-testid="date-15"]');
    await expect(page.locator('[data-testid="date-15"]')).toHaveClass(/selected/);
    await expect(page.locator('[data-testid="selected-date"]')).toContainText('15');
  });

  test('SCEN-065: 空き時間帯をクリックして新規予約', async ({ page }) => {
    // SCEN-065
    await page.goto(`${BASE_URL}/schedule`);
    await page.click('[data-testid="equipment-dropdown"]');
    await page.click('[data-testid="equipment-option-1"]');
    await page.click('[data-testid="available-slot"]');
    await expect(page.locator('[data-testid="new-reservation-form"]')).toBeVisible();
    await page.fill('[data-testid="purpose"]', 'テスト実験');
    await page.click('[data-testid="confirm-reservation"]');
    await expect(page.locator('[data-testid="reserved-slot"]')).toBeVisible();
  });

  test('SCEN-066: 予約時間選択スライダーで時間設定', async ({ page }) => {
    // SCEN-066
    await page.goto(`${BASE_URL}/schedule/new`);
    await page.click('[data-testid="equipment-option-1"]');
    await page.click('[data-testid="date-today"]');
    await page.locator('[data-testid="start-time-slider"]').fill('10:00');
    await page.locator('[data-testid="end-time-slider"]').fill('12:00');
    await expect(page.locator('[data-testid="time-display"]')).toContainText('10:00 - 12:00');
    await page.click('[data-testid="confirm-reservation"]');
  });

  test('SCEN-067: 利用目的入力フィールドに目的記入', async ({ page }) => {
    // SCEN-067
    await page.goto(`${BASE_URL}/schedule/new`);
    await page.click('[data-testid="equipment-option-1"]');
    await page.click('[data-testid="date-today"]');
    await page.click('[data-testid="purpose-field"]');
    await page.fill('[data-testid="purpose-field"]', '実験用サンプルの分析測定');
    await expect(page.locator('[data-testid="purpose-field"]')).toHaveValue('実験用サンプルの分析測定');
  });

  test('SCEN-068: 予約詳細ポップアップが正しく表示', async ({ page }) => {
    // SCEN-068
    await page.goto(`${BASE_URL}/schedule`);
    await page.click('[data-testid="existing-reservation"]');
    await expect(page.locator('[data-testid="reservation-details-popup"]')).toBeVisible();
    await expect(page.locator('[data-testid="reservation-user"]')).toBeVisible();
    await expect(page.locator('[data-testid="reservation-time"]')).toBeVisible();
    await expect(page.locator('[data-testid="reservation-equipment"]')).toBeVisible();
  });

  test('SCEN-069: 予約完了後にスケジュールに反映', async ({ page }) => {
    // SCEN-069
    await page.goto(`${BASE_URL}/schedule/new`);
    await page.click('[data-testid="equipment-option-1"]');
    await page.click('[data-testid="date-tomorrow"]');
    await page.fill('[data-testid="purpose-field"]', 'テスト実験');
    await page.click('[data-testid="confirm-reservation"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await page.goto(`${BASE_URL}/schedule`);
    await expect(page.locator('[data-testid="new-reservation"]')).toBeVisible();
  });

  test('SCEN-070: 機器稼働状況インジケーター表示', async ({ page }) => {
    // SCEN-070
    await page.goto(`${BASE_URL}/schedule`);
    await page.click('[data-testid="equipment-option-1"]');
    await expect(page.locator('[data-testid="status-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="status-indicator"]')).toHaveClass(/running|stopped|maintenance/);
    await page.hover('[data-testid="status-indicator"]');
    await expect(page.locator('[data-testid="status-tooltip"]')).toBeVisible();
  });

  test('SCEN-071: 機器選択せずにスケジュール表示', async ({ page }) => {
    // SCEN-071
    await page.goto(`${BASE_URL}/schedule`);
    await page.click('[data-testid="show-schedule-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('機器を選択してください');
  });

  test('SCEN-072: 予約済み時間帯をクリック', async ({ page }) => {
    // SCEN-072
    await page.goto(`${BASE_URL}/schedule`);
    await page.click('[data-testid="reserved-slot"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('この時間帯は既に予約されています');
  });

  test('SCEN-073: 過去日付で新規予約を作成', async ({ page }) => {
    // SCEN-073
    await page.goto(`${BASE_URL}/schedule/new`);
    await page.click('[data-testid="equipment-option-1"]');
    await page.fill('[data-testid="date-field"]', '2023-01-01');
    await page.fill('[data-testid="purpose-field"]', 'テスト実験');
    await page.click('[data-testid="submit-reservation"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('過去の日付では予約できません');
  });

  test('SCEN-074: 利用目的未入力で予約作成', async ({ page }) => {
    // SCEN-074
    await page.goto(`${BASE_URL}/schedule`);
    await page.click('[data-testid="equipment-option-1"]');
    await page.click('[data-testid="available-slot"]');
    await page.click('[data-testid="submit-reservation"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('利用目的を入力してください');
  });

  test('SCEN-075: 予約時間の開始終了が同時刻', async ({ page }) => {
    // SCEN-075
    await page.goto(`${BASE_URL}/schedule/new`);
    await page.click('[data-testid="equipment-option-1"]');
    await page.fill('[data-testid="start-time"]', '10:00');
    await page.fill('[data-testid="end-time"]', '10:00');
    await page.click('[data-testid="submit-reservation"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('開始時刻と終了時刻が同じため予約できません');
  });

  test('SCEN-076: 予約終了時刻が開始時刻より前', async ({ page }) => {
    // SCEN-076
    await page.goto(`${BASE_URL}/schedule/new`);
    await page.click('[data-testid="equipment-option-1"]');
    await page.fill('[data-testid="start-time"]', '14:00');
    await page.fill('[data-testid="end-time"]', '13:00');
    await page.click('[data-testid="submit-reservation"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('終了時刻は開始時刻より後に設定してください');
  });

  test('SCEN-077: 機器メンテナンス中に予約作成', async ({ page }) => {
    // SCEN-077
    await page.goto(`${BASE_URL}/schedule/new`);
    await page.click('[data-testid="equipment-maintenance"]');
    await page.fill('[data-testid="purpose-field"]', 'テスト実験');
    await page.click('[data-testid="submit-reservation"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('選択された機器はメンテナンス中のため予約できません');
  });

  test('SCEN-078: システム時刻の1分前に予約作成', async ({ page }) => {
    // SCEN-078
    await page.goto(`${BASE_URL}/schedule/new`);
    await page.click('[data-testid="equipment-option-1"]');
    const pastTime = new Date();
    pastTime.setMinutes(pastTime.getMinutes() - 1);
    await page.fill('[data-testid="start-datetime"]', pastTime.toISOString().slice(0, 16));
    await page.click('[data-testid="submit-reservation"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('過去の時刻では予約できません');
  });

  test('SCEN-079: 機器利用可能時間の境界で予約', async ({ page }) => {
    // SCEN-079
    await page.goto(`${BASE_URL}/schedule/new`);
    await page.click('[data-testid="equipment-option-1"]');
    await page.fill('[data-testid="start-time"]', '09:00');
    await page.fill('[data-testid="end-time"]', '18:00');
    await page.fill('[data-testid="purpose-field"]', 'テスト実験');
    await page.click('[data-testid="submit-reservation"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="reservation-list"]')).toContainText('09:00 - 18:00');
  });

  test('SCEN-080: 利用目的に最大文字数を入力', async ({ page }) => {
    // SCEN-080
    await page.goto(`${BASE_URL}/schedule/new`);
    await page.click('[data-testid="equipment-option-1"]');
    const maxText = 'a'.repeat(1000);
    await page.fill('[data-testid="purpose-field"]', maxText);
    await page.click('[data-testid="submit-reservation"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="reservation-purpose"]')).toContainText(maxText);
  });

  test('SCEN-081: 利用目的に最大文字数+1を入力', async ({ page }) => {
    // SCEN-081
    await page.goto(`${BASE_URL}/schedule/new`);
    await page.click('[data-testid="equipment-option-1"]');
    const overMaxText = 'a'.repeat(1001);
    await page.fill('[data-testid="purpose-field"]', overMaxText);
    await page.click('[data-testid="submit-reservation"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('文字数が上限を超えています');
  });

  test('SCEN-082: 予約可能上限時間で予約作成', async ({ page }) => {
    // SCEN-082
    await page.goto(`${BASE_URL}/schedule/new`);
    await page.click('[data-testid="equipment-option-1"]');
    await page.fill('[data-testid="start-time"]', '10:00');
    await page.fill('[data-testid="end-time"]', '13:00');
    await page.fill('[data-testid="purpose-field"]', 'テスト実験');
    await page.click('[data-testid="submit-reservation"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('SCEN-083: 予約可能上限+1分で予約作成', async ({ page }) => {
    // SCEN-083
    await page.goto(`${BASE_URL}/schedule/new`);
    await page.click('[data-testid="equipment-option-1"]');
    await page.fill('[data-testid="start-time"]', '10:00');
    await page.fill('[data-testid="end-time"]', '13:01');
    await page.click('[data-testid="submit-reservation"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('予約可能上限時間を超過しています');
  });

  test('SCEN-084: 月末日から翌月1日の表示切替', async ({ page }) => {
    // SCEN-084
    await page.goto(`${BASE_URL}/schedule`);
    await page.click('[data-testid="date-31"]');
    await expect(page.locator('[data-testid="available-slots"]')).toBeVisible();
    await page.click('[data-testid="next-day"]');
    await expect(page.locator('[data-testid="date-display"]')).toContainText('1日');
    await page.click('[data-testid="prev-day"]');
    await expect(page.locator('[data-testid="date-display"]')).toContainText('31');
  });

  test('SCEN-085: 年末年始をまたぐ週表示', async ({ page }) => {
    // SCEN-085
    await page.goto(`${BASE_URL}/schedule`);
    await page.click('[data-testid="view-week"]');
    await page.click('[data-testid="goto-year-end-week"]');
    await expect(page.locator('[data-testid="week-view"]')).toBeVisible();
    await expect(page.locator('[data-testid="date-31"]')).toBeVisible();
    await expect(page.locator('[data-testid="date-1"]')).toBeVisible();
    await expect(page.locator('[data-testid="reservations"]')).toBeVisible();
  });
});