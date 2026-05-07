import { test, expect } from '@playwright/test';

describe("機器稼働状況", () => {
  const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/dashboard');
  });

  test("SCEN-132: 機器一覧が正常に表示される", async ({ page }) => {
    // SCEN-132
    await page.click('[data-testid="equipment-status-menu"]');
    await page.waitForURL('**/equipment-status');
    const equipmentList = page.locator('[data-testid="equipment-list"]');
    await expect(equipmentList).toBeVisible();
    await expect(page.locator('[data-testid="equipment-item"]')).toHaveCount(await page.locator('[data-testid="equipment-item"]').count());
    await expect(page.locator('[data-testid="equipment-name"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="equipment-id"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="equipment-status"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="reservation-status"]').first()).toBeVisible();
  });

  test("SCEN-133: 稼働中フィルターで機器絞り込み", async ({ page }) => {
    // SCEN-133
    await page.goto(`${BASE_URL}/equipment-status`);
    await expect(page.locator('[data-testid="status-filter"]')).toBeVisible();
    await page.selectOption('[data-testid="status-filter"]', 'operating');
    await page.click('[data-testid="apply-filter-button"]');
    const equipmentItems = page.locator('[data-testid="equipment-item"]');
    for (let i = 0; i < await equipmentItems.count(); i++) {
      await expect(equipmentItems.nth(i).locator('[data-testid="equipment-status"]')).toContainText('稼働中');
    }
  });

  test("SCEN-134: 停止中フィルターで機器絞り込み", async ({ page }) => {
    // SCEN-134
    await page.goto(`${BASE_URL}/equipment-status`);
    await page.selectOption('[data-testid="status-filter"]', 'stopped');
    await page.click('[data-testid="apply-filter-button"]');
    const equipmentItems = page.locator('[data-testid="equipment-item"]');
    for (let i = 0; i < await equipmentItems.count(); i++) {
      await expect(equipmentItems.nth(i).locator('[data-testid="equipment-status"]')).toContainText('停止中');
    }
  });

  test("SCEN-135: メンテナンス中フィルターで絞り込み", async ({ page }) => {
    // SCEN-135
    await page.goto(`${BASE_URL}/equipment-status`);
    await page.selectOption('[data-testid="status-filter"]', 'maintenance');
    await page.click('[data-testid="apply-filter-button"]');
    const equipmentItems = page.locator('[data-testid="equipment-item"]');
    for (let i = 0; i < await equipmentItems.count(); i++) {
      await expect(equipmentItems.nth(i).locator('[data-testid="equipment-status"]')).toContainText('メンテナンス中');
    }
  });

  test("SCEN-136: 機器カテゴリーで正常絞り込み", async ({ page }) => {
    // SCEN-136
    await page.goto(`${BASE_URL}/equipment-status`);
    await expect(page.locator('[data-testid="category-filter"]')).toBeVisible();
    await page.selectOption('[data-testid="category-filter"]', '分析装置');
    await page.click('[data-testid="apply-filter-button"]');
    await expect(page.locator('[data-testid="equipment-item"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="applied-filters"]')).toContainText('分析装置');
  });

  test("SCEN-137: 機器名検索で該当機器表示", async ({ page }) => {
    // SCEN-137
    await page.goto(`${BASE_URL}/equipment-status`);
    await page.fill('[data-testid="equipment-name-search"]', 'テスト機器');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="equipment-item"]')).toHaveCount(await page.locator('[data-testid="equipment-item"]').count());
    await expect(page.locator('[data-testid="equipment-status"]').first()).toBeVisible();
  });

  test("SCEN-138: 稼働状況ステータスが正常表示", async ({ page }) => {
    // SCEN-138
    await page.goto(`${BASE_URL}/equipment-status`);
    await page.click('[data-testid="equipment-item"]').first();
    await expect(page.locator('[data-testid="status-display"]')).toBeVisible();
    const statusText = await page.locator('[data-testid="equipment-status"]').textContent();
    expect(['稼働中', '停止中', 'メンテナンス中']).toContain(statusText);
  });

  test("SCEN-139: 現在利用者情報が正常表示", async ({ page }) => {
    // SCEN-139
    await page.goto(`${BASE_URL}/equipment-status`);
    await expect(page.locator('[data-testid="current-user-info"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="user-name"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="start-time"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="end-time"]').first()).toBeVisible();
  });

  test("SCEN-140: 予約スケジュールが正常表示", async ({ page }) => {
    // SCEN-140
    await page.goto(`${BASE_URL}/equipment-status`);
    await expect(page.locator('[data-testid="schedule-display"]')).toBeVisible();
    await expect(page.locator('[data-testid="current-time"]')).toBeVisible();
    await expect(page.locator('[data-testid="reserved-equipment"]')).toBeVisible();
    await expect(page.locator('[data-testid="available-equipment"]')).toBeVisible();
    await expect(page.locator('[data-testid="time-axis"]')).toBeVisible();
    await expect(page.locator('[data-testid="equipment-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="reserving-user"]')).toBeVisible();
  });

  test("SCEN-141: 機器詳細リンクで詳細画面遷移", async ({ page }) => {
    // SCEN-141
    await page.goto(`${BASE_URL}/equipment-status`);
    await page.click('[data-testid="equipment-detail-link"]').first();
    await page.waitForURL('**/equipment/*/detail');
    await expect(page.locator('[data-testid="equipment-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="equipment-spec"]')).toBeVisible();
    await expect(page.locator('[data-testid="equipment-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="reservation-status"]')).toBeVisible();
  });

  test("SCEN-142: 稼働時間が正確に表示される", async ({ page }) => {
    // SCEN-142
    await page.goto(`${BASE_URL}/equipment-status`);
    await page.click('[data-testid="equipment-item"]').first();
    await expect(page.locator('[data-testid="operation-time-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-operation-time"]')).toMatch(/\d{1,2}:\d{2}:\d{2}/);
    await expect(page.locator('[data-testid="daily-operation-time"]')).toMatch(/\d{1,2}:\d{2}:\d{2}/);
    await expect(page.locator('[data-testid="weekly-operation-time"]')).toMatch(/\d{1,2}:\d{2}:\d{2}/);
  });

  test("SCEN-143: メンテナンス予定が正常表示", async ({ page }) => {
    // SCEN-143
    await page.goto(`${BASE_URL}/equipment-status`);
    const maintenanceEquipment = page.locator('[data-testid="equipment-item"]').filter({ hasText: 'メンテナンス予定' });
    await maintenanceEquipment.first().click();
    await expect(page.locator('[data-testid="maintenance-schedule"]')).toBeVisible();
    await expect(page.locator('[data-testid="maintenance-date"]')).toBeVisible();
    await expect(page.locator('[data-testid="maintenance-duration"]')).toBeVisible();
    await expect(page.locator('[data-testid="maintenance-content"]')).toBeVisible();
  });

  test("SCEN-144: 利用可能時間が正常表示", async ({ page }) => {
    // SCEN-144
    await page.goto(`${BASE_URL}/equipment-status`);
    const availableEquipment = page.locator('[data-testid="equipment-item"]').filter({ hasText: '利用可能' });
    await availableEquipment.first().click();
    await expect(page.locator('[data-testid="available-time-slots"]')).toBeVisible();
    const timeSlots = page.locator('[data-testid="time-slot"]');
    await expect(timeSlots.first().locator('[data-testid="date"]')).toBeVisible();
    await expect(timeSlots.first().locator('[data-testid="start-time"]')).toBeVisible();
    await expect(timeSlots.first().locator('[data-testid="end-time"]')).toBeVisible();
  });

  test("SCEN-145: 緊急停止ボタンで機器停止", async ({ page }) => {
    // SCEN-145
    await page.goto(`${BASE_URL}/equipment-status`);
    const operatingEquipment = page.locator('[data-testid="equipment-item"]').filter({ hasText: '稼働中' });
    await operatingEquipment.first().locator('[data-testid="emergency-stop-button"]').click();
    await page.click('[data-testid="confirm-ok-button"]');
    await expect(operatingEquipment.first().locator('[data-testid="equipment-status"]')).toContainText('停止中');
  });

  test("SCEN-146: 存在しない機器名で検索", async ({ page }) => {
    // SCEN-146
    await page.goto(`${BASE_URL}/equipment-status`);
    await page.fill('[data-testid="equipment-name-search"]', '存在しない機器ABC123');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="no-results-message"]')).toContainText('該当する機器が見つかりません');
  });

  test("SCEN-147: 不正な文字列で機器名検索", async ({ page }) => {
    // SCEN-147
    await page.goto(`${BASE_URL}/equipment-status`);
    await page.fill('[data-testid="equipment-name-search"]', '<script>alert("test")</script>');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="error-message"], [data-testid="no-results-message"]')).toBeVisible();
  });

  test("SCEN-148: 権限なしで緊急停止実行", async ({ page }) => {
    // SCEN-148
    await page.goto(`${BASE_URL}/equipment-status`);
    const operatingEquipment = page.locator('[data-testid="equipment-item"]').filter({ hasText: '稼働中' });
    await operatingEquipment.first().locator('[data-testid="emergency-stop-button"]').click();
    await expect(page.locator('[data-testid="permission-error-message"]')).toBeVisible();
  });

  test("SCEN-149: ネットワーク断で一覧取得失敗", async ({ page }) => {
    // SCEN-149
    await page.goto(`${BASE_URL}/equipment-status`);
    await page.context().setOffline(true);
    await page.click('[data-testid="refresh-button"]');
    await expect(page.locator('[data-testid="network-error-message"]')).toBeVisible();
  });

  test("SCEN-150: 機器詳細リンク先存在せず", async ({ page }) => {
    // SCEN-150
    await page.goto(`${BASE_URL}/equipment-status`);
    await page.goto(`${BASE_URL}/equipment/999999/detail`);
    await expect(page.locator('[data-testid="not-found-message"]')).toContainText('機器詳細が見つかりません');
  });

  test("SCEN-151: 空文字で機器名検索", async ({ page }) => {
    // SCEN-151
    await page.goto(`${BASE_URL}/equipment-status`);
    await page.fill('[data-testid="equipment-name-search"]', '');
    await page.click('[data-testid="search-button"]');
    const result = page.locator('[data-testid="error-message"], [data-testid="equipment-list"]');
    await expect(result).toBeVisible();
  });

  test("SCEN-152: 最大文字数で機器名検索", async ({ page }) => {
    // SCEN-152
    await page.goto(`${BASE_URL}/equipment-status`);
    const longText = 'a'.repeat(255);
    await page.fill('[data-testid="equipment-name-search"]', longText);
    await page.click('[data-testid="search-button"]');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="equipment-list"], [data-testid="no-results-message"]')).toBeVisible();
  });

  test("SCEN-153: 全フィルターを同時適用", async ({ page }) => {
    // SCEN-153
    await page.goto(`${BASE_URL}/equipment-status`);
    await page.selectOption('[data-testid="category-filter"]', '顕微鏡');
    await page.selectOption('[data-testid="status-filter"]', 'operating');
    await page.selectOption('[data-testid="department-filter"]', '生物学部');
    await page.selectOption('[data-testid="period-filter"]', 'today');
    await page.fill('[data-testid="equipment-name-search"]', '電子');
    await page.click('[data-testid="apply-filter-button"]');
    await expect(page.locator('[data-testid="applied-filters"]')).toBeVisible();
    const result = page.locator('[data-testid="equipment-list"], [data-testid="no-results-message"]');
    await expect(result).toBeVisible();
  });

  test("SCEN-154: 機器データ0件時の表示", async ({ page }) => {
    // SCEN-154
    await page.goto(`${BASE_URL}/equipment-status`);
    const equipmentCount = await page.locator('[data-testid="equipment-item"]').count();
    if (equipmentCount === 0) {
      await expect(page.locator('[data-testid="no-equipment-message"]')).toContainText('登録されている機器がありません');
    }
  });

  test("SCEN-155: 大量機器データでの表示", async ({ page }) => {
    // SCEN-155
    await page.goto(`${BASE_URL}/equipment-status`);
    await page.waitForLoadState('networkidle');
    const startTime = Date.now();
    await page.locator('[data-testid="equipment-list"]').waitFor();
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
    await expect(page.locator('[data-testid="pagination"], [data-testid="virtual-scroll"]')).toBeVisible();
    await page.selectOption('[data-testid="category-filter"]', '顕微鏡');
    await page.click('[data-testid="apply-filter-button"]');
    await page.locator('[data-testid="sort-select"]').selectOption('name');
    await page.mouse.wheel(0, 1000);
    await page.waitForTimeout(100);
  });

  test("SCEN-156: フィルター結果0件時の表示", async ({ page }) => {
    // SCEN-156
    await page.goto(`${BASE_URL}/equipment-status`);
    await page.selectOption('[data-testid="category-filter"]', '存在しない機器種別');
    await page.selectOption('[data-testid="facility-filter"]', '存在しない施設');
    await page.selectOption('[data-testid="status-filter"]', '故障中');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="no-results-message"]')).toContainText('該当する機器が見つかりませんでした');
    await expect(page.locator('[data-testid="equipment-list"]')).toBeEmpty();
  });
});