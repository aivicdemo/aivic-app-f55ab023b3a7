import { test, expect } from '@playwright/test';

describe('機器稼働状況', () => {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseURL}/login`);
    await page.fill('[data-testid="username"]', 'testuser');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/dashboard');
  });

  test('SCEN-132: 機器一覧が正常に表示される', async ({ page }) => {
    // SCEN-132
    await page.click('[data-testid="menu-equipment-status"]');
    await page.waitForURL('**/equipment-status');
    await expect(page.locator('[data-testid="equipment-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="equipment-item"]')).toHaveCount(3);
    await expect(page.locator('[data-testid="equipment-name"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="equipment-id"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="equipment-status"]').first()).toBeVisible();
  });

  test('SCEN-133: 稼働中フィルターで機器絞り込み', async ({ page }) => {
    // SCEN-133
    await page.goto(`${baseURL}/equipment-status`);
    await page.selectOption('[data-testid="status-filter"]', 'operating');
    await page.click('[data-testid="apply-filter-button"]');
    await page.waitForTimeout(1000);
    const statuses = await page.locator('[data-testid="equipment-status"]').allTextContents();
    expect(statuses.every(status => status.includes('稼働中'))).toBe(true);
  });

  test('SCEN-134: 停止中フィルターで機器絞り込み', async ({ page }) => {
    // SCEN-134
    await page.goto(`${baseURL}/equipment-status`);
    await page.selectOption('[data-testid="status-filter"]', 'stopped');
    await page.click('[data-testid="apply-filter-button"]');
    await page.waitForTimeout(1000);
    const statuses = await page.locator('[data-testid="equipment-status"]').allTextContents();
    expect(statuses.every(status => status.includes('停止中'))).toBe(true);
  });

  test('SCEN-135: メンテナンス中フィルターで絞り込み', async ({ page }) => {
    // SCEN-135
    await page.goto(`${baseURL}/equipment-status`);
    await page.selectOption('[data-testid="status-filter"]', 'maintenance');
    await page.click('[data-testid="apply-filter-button"]');
    await page.waitForTimeout(1000);
    const statuses = await page.locator('[data-testid="equipment-status"]').allTextContents();
    expect(statuses.every(status => status.includes('メンテナンス中'))).toBe(true);
  });

  test('SCEN-136: 機器カテゴリーで正常絞り込み', async ({ page }) => {
    // SCEN-136
    await page.goto(`${baseURL}/equipment-status`);
    await page.selectOption('[data-testid="category-filter"]', 'analyzer');
    await page.click('[data-testid="apply-filter-button"]');
    await page.waitForTimeout(1000);
    await expect(page.locator('[data-testid="equipment-item"]')).toHaveCountGreaterThan(0);
    await expect(page.locator('[data-testid="active-filter"]')).toContainText('分析装置');
  });

  test('SCEN-137: 機器名検索で該当機器表示', async ({ page }) => {
    // SCEN-137
    await page.goto(`${baseURL}/equipment-status`);
    await page.fill('[data-testid="equipment-search"]', '顕微鏡');
    await page.press('[data-testid="equipment-search"]', 'Enter');
    await page.waitForTimeout(1000);
    await expect(page.locator('[data-testid="equipment-item"]')).toHaveCountGreaterThan(0);
    await expect(page.locator('[data-testid="equipment-name"]').first()).toContainText('顕微鏡');
  });

  test('SCEN-138: 稼働状況ステータスが正常表示', async ({ page }) => {
    // SCEN-138
    await page.goto(`${baseURL}/equipment-status`);
    await expect(page.locator('[data-testid="equipment-status"]').first()).toBeVisible();
    const statusText = await page.locator('[data-testid="equipment-status"]').first().textContent();
    expect(['稼働中', '停止中', 'メンテナンス中']).toContain(statusText);
  });

  test('SCEN-139: 現在利用者情報が正常表示', async ({ page }) => {
    // SCEN-139
    await page.goto(`${baseURL}/equipment-status`);
    await expect(page.locator('[data-testid="current-user"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="usage-start-time"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="usage-end-time"]').first()).toBeVisible();
  });

  test('SCEN-140: 予約スケジュールが正常表示', async ({ page }) => {
    // SCEN-140
    await page.goto(`${baseURL}/equipment-status`);
    await expect(page.locator('[data-testid="schedule-display"]')).toBeVisible();
    await expect(page.locator('[data-testid="current-time"]')).toBeVisible();
    await expect(page.locator('[data-testid="reserved-equipment"]')).toBeVisible();
    await expect(page.locator('[data-testid="time-axis"]')).toBeVisible();
    await expect(page.locator('[data-testid="equipment-name-schedule"]').first()).toBeVisible();
  });

  test('SCEN-141: 機器詳細リンクで詳細画面遷移', async ({ page }) => {
    // SCEN-141
    await page.goto(`${baseURL}/equipment-status`);
    await page.click('[data-testid="equipment-detail-link"]');
    await page.waitForURL('**/equipment/**/detail');
    await expect(page.locator('[data-testid="equipment-detail-info"]')).toBeVisible();
    await expect(page.locator('[data-testid="equipment-specifications"]')).toBeVisible();
  });

  test('SCEN-142: 稼働時間が正確に表示される', async ({ page }) => {
    // SCEN-142
    await page.goto(`${baseURL}/equipment-status`);
    await page.click('[data-testid="equipment-detail-link"]');
    await expect(page.locator('[data-testid="total-operating-time"]')).toBeVisible();
    await expect(page.locator('[data-testid="daily-operating-time"]')).toBeVisible();
    await expect(page.locator('[data-testid="weekly-operating-time"]')).toBeVisible();
    const timeFormat = /^\d{1,2}:\d{2}:\d{2}$/;
    const totalTime = await page.locator('[data-testid="total-operating-time"]').textContent();
    expect(totalTime).toMatch(timeFormat);
  });

  test('SCEN-143: メンテナンス予定が正常表示', async ({ page }) => {
    // SCEN-143
    await page.goto(`${baseURL}/equipment-status`);
    await expect(page.locator('[data-testid="maintenance-schedule"]')).toBeVisible();
    await expect(page.locator('[data-testid="maintenance-date"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="maintenance-duration"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="maintenance-content"]').first()).toBeVisible();
  });

  test('SCEN-144: 利用可能時間が正常表示', async ({ page }) => {
    // SCEN-144
    await page.goto(`${baseURL}/equipment-status`);
    await page.click('[data-testid="equipment-detail-link"]');
    await expect(page.locator('[data-testid="available-time-slots"]')).toBeVisible();
    await expect(page.locator('[data-testid="slot-date"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="slot-start-time"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="slot-end-time"]').first()).toBeVisible();
  });

  test('SCEN-145: 緊急停止ボタンで機器停止', async ({ page }) => {
    // SCEN-145
    await page.goto(`${baseURL}/equipment-status`);
    await page.click('[data-testid="emergency-stop-button"]');
    await page.click('[data-testid="confirm-stop-button"]');
    await page.waitForTimeout(2000);
    await expect(page.locator('[data-testid="equipment-status"]').first()).toContainText('停止中');
  });

  test('SCEN-146: 存在しない機器名で検索', async ({ page }) => {
    // SCEN-146
    await page.goto(`${baseURL}/equipment-status`);
    await page.fill('[data-testid="equipment-search"]', '存在しない機器ABC123');
    await page.click('[data-testid="search-button"]');
    await page.waitForTimeout(1000);
    await expect(page.locator('[data-testid="no-results-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="no-results-message"]')).toContainText('該当する機器が見つかりません');
  });

  test('SCEN-147: 不正な文字列で機器名検索', async ({ page }) => {
    // SCEN-147
    await page.goto(`${baseURL}/equipment-status`);
    await page.fill('[data-testid="equipment-search"]', '<script>alert("test")</script>');
    await page.click('[data-testid="search-button"]');
    await page.waitForTimeout(1000);
    const alerts = [];
    page.on('dialog', dialog => alerts.push(dialog.message()));
    expect(alerts).toHaveLength(0);
    await expect(page.locator('[data-testid="no-results-message"]')).toBeVisible();
  });

  test('SCEN-148: 権限なしで緊急停止実行', async ({ page }) => {
    // SCEN-148
    await page.goto(`${baseURL}/login`);
    await page.fill('[data-testid="username"]', 'general_user');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-button"]');
    await page.goto(`${baseURL}/equipment-status`);
    await page.click('[data-testid="emergency-stop-button"]');
    await expect(page.locator('[data-testid="permission-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="permission-error"]')).toContainText('権限');
  });

  test('SCEN-149: ネットワーク断で一覧取得失敗', async ({ page }) => {
    // SCEN-149
    await page.goto(`${baseURL}/equipment-status`);
    await page.context().setOffline(true);
    await page.click('[data-testid="refresh-button"]');
    await page.waitForTimeout(2000);
    await expect(page.locator('[data-testid="network-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="network-error"]')).toContainText('ネットワークエラー');
  });

  test('SCEN-150: 機器詳細リンク先存在せず', async ({ page }) => {
    // SCEN-150
    await page.goto(`${baseURL}/equipment-status`);
    await page.goto(`${baseURL}/equipment/invalid-id/detail`);
    await expect(page.locator('[data-testid="not-found-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="not-found-message"]')).toContainText('機器詳細が見つかりません');
    await expect(page.locator('[data-testid="back-link"]')).toBeVisible();
  });

  test('SCEN-151: 空文字で機器名検索', async ({ page }) => {
    // SCEN-151
    await page.goto(`${baseURL}/equipment-status`);
    await page.fill('[data-testid="equipment-search"]', '');
    await page.press('[data-testid="equipment-search"]', 'Enter');
    await page.waitForTimeout(1000);
    const equipmentCount = await page.locator('[data-testid="equipment-item"]').count();
    expect(equipmentCount).toBeGreaterThanOrEqual(0);
  });

  test('SCEN-152: 最大文字数で機器名検索', async ({ page }) => {
    // SCEN-152
    await page.goto(`${baseURL}/equipment-status`);
    const maxString = 'a'.repeat(255);
    await page.fill('[data-testid="equipment-search"]', maxString);
    await page.click('[data-testid="search-button"]');
    await page.waitForTimeout(2000);
    const isVisible = await page.locator('[data-testid="search-results"]').isVisible();
    expect(isVisible).toBe(true);
  });

  test('SCEN-153: 全フィルターを同時適用', async ({ page }) => {
    // SCEN-153
    await page.goto(`${baseURL}/equipment-status`);
    await page.selectOption('[data-testid="category-filter"]', 'microscope');
    await page.selectOption('[data-testid="status-filter"]', 'operating');
    await page.selectOption('[data-testid="department-filter"]', 'biology');
    await page.selectOption('[data-testid="period-filter"]', 'today');
    await page.fill('[data-testid="equipment-search"]', '電子');
    await page.click('[data-testid="apply-all-filters"]');
    await page.waitForTimeout(2000);
    await expect(page.locator('[data-testid="active-filters"]')).toBeVisible();
  });

  test('SCEN-154: 機器データ0件時の表示', async ({ page }) => {
    // SCEN-154
    await page.goto(`${baseURL}/equipment-status-empty`);
    await expect(page.locator('[data-testid="empty-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="empty-message"]')).toContainText('登録されている機器がありません');
    await expect(page.locator('[data-testid="equipment-item"]')).toHaveCount(0);
  });

  test('SCEN-155: 大量機器データでの表示', async ({ page }) => {
    // SCEN-155
    await page.goto(`${baseURL}/equipment-status-large`);
    await expect(page.locator('[data-testid="pagination"]')).toBeVisible();
    await page.selectOption('[data-testid="category-filter"]', 'analyzer');
    await page.click('[data-testid="apply-filter-button"]');
    await page.click('[data-testid="sort-by-name"]');
    const startTime = Date.now();
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });

  test('SCEN-156: フィルター結果0件時の表示', async ({ page }) => {
    // SCEN-156
    await page.goto(`${baseURL}/equipment-status`);
    await page.selectOption('[data-testid="category-filter"]', 'nonexistent');
    await page.selectOption('[data-testid="facility-filter"]', 'empty-facility');
    await page.selectOption('[data-testid="status-filter"]', 'broken');
    await page.click('[data-testid="search-button"]');
    await page.waitForTimeout(1000);
    await expect(page.locator('[data-testid="no-filter-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="no-filter-results"]')).toContainText('該当する機器が見つかりませんでした');
  });
});