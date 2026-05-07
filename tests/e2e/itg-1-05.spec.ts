import { test, expect } from '@playwright/test';

describe("利用料金・予算分析", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000");
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/dashboard');
  });

  test("予算入力と機器選択で料金計算実行", async ({ page }) => {
    // SCEN-112
    await page.goto('/budget-analysis');
    await page.fill('[data-testid="budget-input"]', '100000');
    await page.selectOption('[data-testid="equipment-select"]', 'equipment-1');
    await page.fill('[data-testid="usage-time"]', '5');
    await page.click('[data-testid="calculate-button"]');
    await expect(page.locator('[data-testid="calculation-result"]')).toBeVisible();
  });

  test("利用期間設定で総費用が更新", async ({ page }) => {
    // SCEN-113
    await page.goto('/budget-analysis');
    await page.selectOption('[data-testid="equipment-select"]', 'equipment-1');
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-01-31');
    await page.click('[data-testid="confirm-period"]');
    await expect(page.locator('[data-testid="total-cost"]')).toContainText('¥');
  });

  test("時間単価と日単価の切り替え動作", async ({ page }) => {
    // SCEN-114
    await page.goto('/budget-analysis');
    await page.click('[data-testid="hourly-rate"]');
    await expect(page.locator('[data-testid="price-display"]')).toContainText('時間');
    await page.click('[data-testid="daily-rate"]');
    await expect(page.locator('[data-testid="price-display"]')).toContainText('日');
    await page.click('[data-testid="hourly-rate"]');
    await expect(page.locator('[data-testid="price-display"]')).toContainText('時間');
  });

  test("割引制度適用で料金が減額", async ({ page }) => {
    // SCEN-115
    await page.goto('/budget-analysis');
    await page.selectOption('[data-testid="equipment-select"]', 'equipment-1');
    await page.fill('[data-testid="usage-time"]', '5');
    const originalPrice = await page.locator('[data-testid="original-price"]').textContent();
    await page.selectOption('[data-testid="discount-select"]', 'student-discount');
    await page.click('[data-testid="apply-discount"]');
    await expect(page.locator('[data-testid="discounted-price"]')).toBeVisible();
    await expect(page.locator('[data-testid="discount-amount"]')).toBeVisible();
  });

  test("追加オプション選択で費用加算", async ({ page }) => {
    // SCEN-116
    await page.goto('/budget-analysis');
    await page.selectOption('[data-testid="equipment-select"]', 'equipment-1');
    await page.fill('[data-testid="usage-time"]', '3');
    await page.check('[data-testid="option-support"]');
    await page.check('[data-testid="option-materials"]');
    await page.click('[data-testid="calculate-button"]');
    await expect(page.locator('[data-testid="total-amount"]')).toBeVisible();
    await expect(page.locator('[data-testid="option-cost"]')).toBeVisible();
  });

  test("予算内機器フィルターで絞り込み", async ({ page }) => {
    // SCEN-117
    await page.goto('/equipment-list');
    await page.click('[data-testid="budget-filter"]');
    await page.fill('[data-testid="budget-limit"]', '50000');
    await page.click('[data-testid="apply-filter"]');
    const equipmentList = page.locator('[data-testid="equipment-item"]');
    await expect(equipmentList.first()).toBeVisible();
    await expect(page.locator('[data-testid="price"]').first()).toContainText('¥');
  });

  test("料金詳細内訳ポップアップ表示", async ({ page }) => {
    // SCEN-118
    await page.goto('/budget-analysis');
    await page.click('[data-testid="price-detail-button"]');
    await expect(page.locator('[data-testid="price-breakdown-popup"]')).toBeVisible();
    await expect(page.locator('[data-testid="basic-fee"]')).toBeVisible();
    await expect(page.locator('[data-testid="tax-amount"]')).toBeVisible();
    await page.click('[data-testid="close-popup"]');
    await expect(page.locator('[data-testid="price-breakdown-popup"]')).not.toBeVisible();
  });

  test("シミュレーション結果グラフ描画", async ({ page }) => {
    // SCEN-119
    await page.goto('/budget-analysis');
    await page.fill('[data-testid="simulation-period"]', '12');
    await page.selectOption('[data-testid="equipment-select"]', 'equipment-1');
    await page.fill('[data-testid="usage-hours"]', '10');
    await page.click('[data-testid="run-simulation"]');
    await expect(page.locator('[data-testid="chart-area"]')).toBeVisible();
    await expect(page.locator('[data-testid="chart-legend"]')).toBeVisible();
  });

  test("予算未入力で計算エラー表示", async ({ page }) => {
    // SCEN-120
    await page.goto('/budget-analysis');
    await page.fill('[data-testid="period-input"]', '2024-01-01');
    await page.click('[data-testid="calculate-button"]');
    await expect(page.locator('[data-testid="budget-error"]')).toContainText('予算を入力してください');
  });

  test("負の予算値入力でエラー発生", async ({ page }) => {
    // SCEN-121
    await page.goto('/budget-analysis');
    await page.fill('[data-testid="budget-input"]', '-10000');
    await page.click('[data-testid="confirm-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('正の値を入力してください');
  });

  test("予算超過時にアラート表示", async ({ page }) => {
    // SCEN-122
    await page.goto('/budget-management');
    const budgetBalance = await page.locator('[data-testid="budget-balance"]').textContent();
    await page.selectOption('[data-testid="equipment-select"]', 'expensive-equipment');
    await page.fill('[data-testid="usage-time"]', '100');
    await page.click('[data-testid="reserve-button"]');
    await expect(page.locator('[data-testid="budget-exceeded-alert"]')).toBeVisible();
  });

  test("無効な文字列予算でバリデーション", async ({ page }) => {
    // SCEN-123
    await page.goto('/budget-analysis');
    await page.fill('[data-testid="budget-input"]', 'abc');
    await page.fill('[data-testid="other-field"]', 'valid-value');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="budget-validation-error"]')).toContainText('予算は数値で入力してください');
  });

  test("機器未選択で計算失敗エラー", async ({ page }) => {
    // SCEN-124
    await page.goto('/budget-analysis');
    await page.fill('[data-testid="usage-time"]', '5');
    await page.fill('[data-testid="usage-date"]', '2024-01-01');
    await page.click('[data-testid="calculate-button"]');
    await expect(page.locator('[data-testid="equipment-error"]')).toContainText('機器を選択してください');
  });

  test("過去日程設定でエラーメッセージ", async ({ page }) => {
    // SCEN-125
    await page.goto('/budget-analysis');
    await page.fill('[data-testid="start-date"]', '2023-01-01');
    await page.fill('[data-testid="end-date"]', '2022-12-31');
    await page.click('[data-testid="analyze-button"]');
    await expect(page.locator('[data-testid="date-error"]')).toContainText('開始日は終了日より前の日付を設定してください');
  });

  test("最大予算値での計算処理確認", async ({ page }) => {
    // SCEN-126
    await page.goto('/budget-analysis');
    await page.fill('[data-testid="budget-input"]', '999999999');
    await page.fill('[data-testid="analysis-period"]', '2024-01-01');
    await page.click('[data-testid="calculate-button"]');
    await expect(page.locator('[data-testid="calculation-result"]')).toBeVisible();
    await expect(page.locator('[data-testid="chart-display"]')).toBeVisible();
  });

  test("最小利用期間での料金算出", async ({ page }) => {
    // SCEN-127
    await page.goto('/budget-analysis');
    await page.selectOption('[data-testid="equipment-select"]', 'min-period-equipment');
    await page.fill('[data-testid="start-datetime"]', '2024-01-01T09:00');
    await page.fill('[data-testid="end-datetime"]', '2024-01-01T10:00');
    await page.click('[data-testid="calculate-price"]');
    await expect(page.locator('[data-testid="calculated-price"]')).toBeVisible();
    await expect(page.locator('[data-testid="usage-period"]')).toContainText('1時間');
  });

  test("最大利用期間での費用計算", async ({ page }) => {
    // SCEN-128
    await page.goto('/equipment-list');
    await page.click('[data-testid="expensive-equipment"]');
    await page.fill('[data-testid="usage-period"]', '999');
    await page.fill('[data-testid="user-count"]', '10');
    await page.check('[data-testid="all-options"]');
    await page.click('[data-testid="calculate-cost"]');
    await expect(page.locator('[data-testid="cost-breakdown"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-amount"]')).toBeVisible();
  });

  test("予算ぴったりの機器選択動作", async ({ page }) => {
    // SCEN-129
    await page.goto('/budget-analysis');
    await page.fill('[data-testid="budget-limit"]', '50000');
    await page.check('[data-testid="within-budget-filter"]');
    await page.click('[data-testid="search-button"]');
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.fill('[data-testid="adjust-time"]', '4');
    await expect(page.locator('[data-testid="total-cost"]')).toContainText('50,000');
    await page.click('[data-testid="confirm-reservation"]');
  });

  test("全割引制度同時適用での計算", async ({ page }) => {
    // SCEN-130
    await page.goto('/budget-analysis');
    await page.selectOption('[data-testid="equipment-select"]', 'discount-eligible');
    await page.check('[data-testid="student-discount"]');
    await page.check('[data-testid="longterm-discount"]');
    await page.check('[data-testid="project-discount"]');
    await page.fill('[data-testid="usage-period"]', '10');
    await page.click('[data-testid="calculate-button"]');
    await expect(page.locator('[data-testid="discount-breakdown"]')).toBeVisible();
    await expect(page.locator('[data-testid="final-price"]')).toBeVisible();
  });

  test("全追加オプション選択時の動作", async ({ page }) => {
    // SCEN-131
    await page.goto('/equipment-list');
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.fill('[data-testid="reservation-date"]', '2024-01-01');
    await page.check('[data-testid="tech-support"]');
    await page.check('[data-testid="extended-time"]');
    await page.check('[data-testid="special-reagent"]');
    await page.check('[data-testid="data-analysis"]');
    await page.click('[data-testid="confirm-reservation"]');
    await page.goto('/budget-analysis');
    await expect(page.locator('[data-testid="option-breakdown"]')).toBeVisible();
  });
});