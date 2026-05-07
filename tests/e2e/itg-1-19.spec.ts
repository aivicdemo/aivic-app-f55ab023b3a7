import { test, expect } from '@playwright/test';

describe("利用料金・予算分析", () => {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseURL}/login`);
    await page.fill('[data-testid="username"]', 'testuser');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(`${baseURL}/dashboard`);
  });

  test('SCEN-112: 予算入力と機器選択で料金計算実行', async ({ page }) => {
    // SCEN-112
    await page.goto(`${baseURL}/cost-analysis`);
    await page.fill('[data-testid="budget-input"]', '100000');
    await page.selectOption('[data-testid="equipment-select"]', 'microscope');
    await page.fill('[data-testid="usage-time"]', '4');
    await page.click('[data-testid="calculate-button"]');
    await expect(page.locator('[data-testid="calculation-result"]')).toBeVisible();
  });

  test('SCEN-113: 利用期間設定で総費用が更新', async ({ page }) => {
    // SCEN-113
    await page.goto(`${baseURL}/cost-analysis`);
    await page.selectOption('[data-testid="equipment-select"]', 'centrifuge');
    await page.fill('[data-testid="start-date"]', '2024-01-15');
    await page.fill('[data-testid="end-date"]', '2024-01-20');
    await page.click('[data-testid="confirm-period"]');
    await expect(page.locator('[data-testid="total-cost"]')).toContainText('¥');
  });

  test('SCEN-114: 時間単価と日単価の切り替え動作', async ({ page }) => {
    // SCEN-114
    await page.goto(`${baseURL}/cost-analysis`);
    await page.click('[data-testid="hourly-rate"]');
    await expect(page.locator('[data-testid="rate-display"]')).toContainText('時間');
    await page.click('[data-testid="daily-rate"]');
    await expect(page.locator('[data-testid="rate-display"]')).toContainText('日');
    await page.click('[data-testid="hourly-rate"]');
    await expect(page.locator('[data-testid="rate-display"]')).toContainText('時間');
  });

  test('SCEN-115: 割引制度適用で料金が減額', async ({ page }) => {
    // SCEN-115
    await page.goto(`${baseURL}/cost-analysis`);
    await page.selectOption('[data-testid="equipment-select"]', 'spectrometer');
    await page.fill('[data-testid="usage-date"]', '2024-02-01');
    await page.fill('[data-testid="usage-hours"]', '2');
    const originalPrice = await page.textContent('[data-testid="original-price"]');
    await page.click('[data-testid="student-discount"]');
    await expect(page.locator('[data-testid="discounted-price"]')).not.toHaveText(originalPrice);
  });

  test('SCEN-116: 追加オプション選択で費用加算', async ({ page }) => {
    // SCEN-116
    await page.goto(`${baseURL}/equipment-list`);
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.fill('[data-testid="reservation-date"]', '2024-02-15');
    await page.fill('[data-testid="reservation-time"]', '3');
    await page.check('[data-testid="option-extension"]');
    await page.check('[data-testid="option-support"]');
    await expect(page.locator('[data-testid="total-amount"]')).toBeVisible();
  });

  test('SCEN-117: 予算内機器フィルターで絞り込み', async ({ page }) => {
    // SCEN-117
    await page.goto(`${baseURL}/equipment-list`);
    await page.click('[data-testid="budget-filter"]');
    await page.fill('[data-testid="budget-limit"]', '50000');
    await page.click('[data-testid="apply-filter"]');
    const equipmentItems = await page.locator('[data-testid="equipment-price"]').all();
    for (const item of equipmentItems) {
      await expect(item).toContainText(/^¥[1-4]\d{4}$|^¥[1-9]\d{3}$|^¥\d{3}$/);
    }
  });

  test('SCEN-118: 料金詳細内訳ポップアップ表示', async ({ page }) => {
    // SCEN-118
    await page.goto(`${baseURL}/cost-analysis`);
    await page.click('[data-testid="cost-detail-button"]');
    await expect(page.locator('[data-testid="cost-breakdown-popup"]')).toBeVisible();
    await expect(page.locator('[data-testid="base-cost"]')).toBeVisible();
    await expect(page.locator('[data-testid="tax-cost"]')).toBeVisible();
    await page.click('[data-testid="popup-close"]');
    await expect(page.locator('[data-testid="cost-breakdown-popup"]')).not.toBeVisible();
  });

  test('SCEN-119: シミュレーション結果グラフ描画', async ({ page }) => {
    // SCEN-119
    await page.goto(`${baseURL}/cost-analysis`);
    await page.fill('[data-testid="simulation-period"]', '30');
    await page.selectOption('[data-testid="equipment-select"]', 'analyzer');
    await page.fill('[data-testid="usage-hours"]', '8');
    await page.click('[data-testid="run-simulation"]');
    await expect(page.locator('[data-testid="chart-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="chart-legend"]')).toBeVisible();
  });

  test('SCEN-120: 予算未入力で計算エラー表示', async ({ page }) => {
    // SCEN-120
    await page.goto(`${baseURL}/cost-analysis`);
    await page.fill('[data-testid="analysis-period"]', '2024-01-01');
    await page.click('[data-testid="calculate-button"]');
    await expect(page.locator('[data-testid="budget-error"]')).toContainText('予算を入力してください');
  });

  test('SCEN-121: 負の予算値入力でエラー発生', async ({ page }) => {
    // SCEN-121
    await page.goto(`${baseURL}/cost-analysis`);
    await page.fill('[data-testid="budget-input"]', '-10000');
    await page.click('[data-testid="confirm-button"]');
    await expect(page.locator('[data-testid="budget-error"]')).toContainText('正の値を入力してください');
  });

  test('SCEN-122: 予算超過時にアラート表示', async ({ page }) => {
    // SCEN-122
    await page.goto(`${baseURL}/budget-management`);
    const budgetBalance = await page.textContent('[data-testid="budget-balance"]');
    await page.goto(`${baseURL}/equipment-reservation`);
    await page.fill('[data-testid="reservation-amount"]', '999999');
    await page.click('[data-testid="confirm-reservation"]');
    await expect(page.locator('[data-testid="budget-exceeded-alert"]')).toBeVisible();
  });

  test('SCEN-123: 無効な文字列予算でバリデーション', async ({ page }) => {
    // SCEN-123
    await page.goto(`${baseURL}/cost-analysis`);
    await page.fill('[data-testid="budget-input"]', 'abc');
    await page.fill('[data-testid="analysis-period"]', '30');
    await page.click('[data-testid="execute-analysis"]');
    await expect(page.locator('[data-testid="validation-error"]')).toContainText('予算は数値で入力してください');
  });

  test('SCEN-124: 機器未選択で計算失敗エラー', async ({ page }) => {
    // SCEN-124
    await page.goto(`${baseURL}/cost-analysis`);
    await page.fill('[data-testid="usage-time"]', '4');
    await page.fill('[data-testid="usage-date"]', '2024-03-01');
    await page.click('[data-testid="calculate-button"]');
    await expect(page.locator('[data-testid="equipment-error"]')).toContainText('機器を選択してください');
  });

  test('SCEN-125: 過去日程設定でエラーメッセージ', async ({ page }) => {
    // SCEN-125
    await page.goto(`${baseURL}/cost-analysis`);
    await page.fill('[data-testid="start-date"]', '2023-12-01');
    await page.fill('[data-testid="end-date"]', '2023-11-30');
    await page.click('[data-testid="execute-analysis"]');
    await expect(page.locator('[data-testid="date-error"]')).toContainText('開始日は終了日より前の日付を設定してください');
  });

  test('SCEN-126: 最大予算値での計算処理確認', async ({ page }) => {
    // SCEN-126
    await page.goto(`${baseURL}/cost-analysis`);
    await page.fill('[data-testid="budget-input"]', '999999999');
    await page.fill('[data-testid="analysis-period"]', '365');
    await page.click('[data-testid="calculate-button"]');
    await expect(page.locator('[data-testid="calculation-result"]')).toBeVisible();
    await expect(page.locator('[data-testid="chart-container"]')).toBeVisible();
  });

  test('SCEN-127: 最小利用期間での料金算出', async ({ page }) => {
    // SCEN-127
    await page.goto(`${baseURL}/cost-analysis`);
    await page.selectOption('[data-testid="equipment-select"]', 'minimum-usage-equipment');
    await page.fill('[data-testid="start-datetime"]', '2024-03-01T09:00');
    await page.fill('[data-testid="end-datetime"]', '2024-03-01T10:00');
    await page.click('[data-testid="calculate-cost"]');
    await expect(page.locator('[data-testid="calculated-cost"]')).toBeVisible();
  });

  test('SCEN-128: 最大利用期間での費用計算', async ({ page }) => {
    // SCEN-128
    await page.goto(`${baseURL}/equipment-list`);
    await page.click('[data-testid="expensive-equipment"]');
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="usage-period"]', '365');
    await page.fill('[data-testid="user-count"]', '99');
    await page.check('[data-testid="all-options"]');
    await page.click('[data-testid="calculate-cost"]');
    await expect(page.locator('[data-testid="cost-breakdown"]')).toBeVisible();
  });

  test('SCEN-129: 予算ぴったりの機器選択動作', async ({ page }) => {
    // SCEN-129
    await page.goto(`${baseURL}/cost-analysis`);
    await page.fill('[data-testid="budget-limit"]', '50000');
    await page.check('[data-testid="within-budget-filter"]');
    await page.click('[data-testid="search-equipment"]');
    await page.click('[data-testid="optimal-equipment"]');
    await page.fill('[data-testid="usage-adjustment"]', '2');
    await expect(page.locator('[data-testid="total-cost"]')).toContainText('¥50,000');
  });

  test('SCEN-130: 全割引制度同時適用での計算', async ({ page }) => {
    // SCEN-130
    await page.goto(`${baseURL}/cost-analysis`);
    await page.selectOption('[data-testid="equipment-select"]', 'multi-discount-equipment');
    await page.check('[data-testid="student-discount"]');
    await page.check('[data-testid="longterm-discount"]');
    await page.check('[data-testid="research-discount"]');
    await page.fill('[data-testid="reservation-period"]', '7');
    await page.click('[data-testid="calculate-cost"]');
    await expect(page.locator('[data-testid="discount-breakdown"]')).toBeVisible();
  });

  test('SCEN-131: 全追加オプション選択時の動作', async ({ page }) => {
    // SCEN-131
    await page.goto(`${baseURL}/equipment-reservation`);
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.fill('[data-testid="reservation-datetime"]', '2024-04-01T10:00');
    await page.check('[data-testid="tech-support"]');
    await page.check('[data-testid="extension-time"]');
    await page.check('[data-testid="special-reagent"]');
    await page.check('[data-testid="data-analysis"]');
    await expect(page.locator('[data-testid="option-breakdown"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-amount"]')).toBeVisible();
  });
});