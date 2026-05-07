import { test, expect } from '@playwright/test';

describe("AI機器提案機能", () => {
  const baseUrl = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseUrl}/login`);
    await page.fill('[data-testid="username"]', 'testuser');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/dashboard');
  });

  test('SCEN-182: 研究目的入力でAI提案実行成功', async ({ page }) => {
    // SCEN-182
    await page.goto(`${baseUrl}/ai-suggestion`);
    await page.fill('[data-testid="research-purpose"]', 'タンパク質の構造解析');
    await page.click('[data-testid="ai-suggestion-button"]');
    await page.waitForSelector('[data-testid="suggestion-results"]');
    await expect(page.locator('[data-testid="suggestion-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="equipment-name"]')).toBeVisible();
  });

  test('SCEN-183: 実験内容詳細入力で機器候補表示', async ({ page }) => {
    // SCEN-183
    await page.goto(`${baseUrl}/ai-suggestion`);
    await page.fill('[data-testid="experiment-detail"]', 'タンパク質の構造解析実験');
    await page.click('[data-testid="suggest-equipment-button"]');
    await page.waitForSelector('[data-testid="equipment-candidates"]');
    await expect(page.locator('[data-testid="equipment-candidates"]')).toBeVisible();
    await expect(page.locator('[data-testid="equipment-spec"]')).toBeVisible();
  });

  test('SCEN-184: 測定要件選択で適合機器絞込', async ({ page }) => {
    // SCEN-184
    await page.goto(`${baseUrl}/ai-suggestion`);
    await page.selectOption('[data-testid="measurement-target"]', 'protein');
    await page.selectOption('[data-testid="measurement-method"]', 'spectroscopy');
    await page.selectOption('[data-testid="measurement-accuracy"]', 'high');
    await page.fill('[data-testid="sample-size"]', '1ml');
    await page.click('[data-testid="search-equipment-button"]');
    await expect(page.locator('[data-testid="filtered-equipment"]')).toBeVisible();
  });

  test('SCEN-185: 技術仕様条件設定で提案更新', async ({ page }) => {
    // SCEN-185
    await page.goto(`${baseUrl}/ai-suggestion`);
    await page.click('[data-testid="tech-spec-section"]');
    await page.fill('[data-testid="performance-spec"]', '高性能');
    await page.fill('[data-testid="accuracy-spec"]', '99.9%');
    await page.click('[data-testid="apply-spec-button"]');
    await expect(page.locator('[data-testid="updated-suggestions"]')).toBeVisible();
  });

  test('SCEN-186: 予算範囲スライダーで価格絞込', async ({ page }) => {
    // SCEN-186
    await page.goto(`${baseUrl}/ai-suggestion`);
    await page.locator('[data-testid="budget-slider-min"]').fill('500000');
    await page.locator('[data-testid="budget-slider-max"]').fill('2000000');
    await page.click('[data-testid="price-filter-button"]');
    await page.waitForSelector('[data-testid="filtered-equipment"]');
    await expect(page.locator('[data-testid="equipment-price"]').first()).toContainText('500,000');
  });

  test('SCEN-187: 利用期間指定で空き状況確認', async ({ page }) => {
    // SCEN-187
    await page.goto(`${baseUrl}/ai-suggestion`);
    await page.fill('[data-testid="start-date"]', '2024-01-15');
    await page.fill('[data-testid="end-date"]', '2024-01-20');
    await page.click('[data-testid="check-availability-button"]');
    await page.waitForSelector('[data-testid="availability-results"]');
    await expect(page.locator('[data-testid="available-equipment"]')).toBeVisible();
  });

  test('SCEN-188: 機器適合度スコア正常表示', async ({ page }) => {
    // SCEN-188
    await page.goto(`${baseUrl}/ai-suggestion`);
    await page.fill('[data-testid="research-purpose"]', 'データ分析');
    await page.click('[data-testid="get-suggestions-button"]');
    await page.waitForSelector('[data-testid="compatibility-score"]');
    const score = await page.locator('[data-testid="compatibility-score"]').first().textContent();
    expect(parseInt(score || '0')).toBeGreaterThanOrEqual(0);
    expect(parseInt(score || '0')).toBeLessThanOrEqual(100);
  });

  test('SCEN-189: 機器仕様比較テーブル表示', async ({ page }) => {
    // SCEN-189
    await page.goto(`${baseUrl}/ai-suggestion`);
    await page.fill('[data-testid="research-purpose"]', '分析実験');
    await page.click('[data-testid="get-suggestions-button"]');
    await page.waitForSelector('[data-testid="equipment-list"]');
    await page.check('[data-testid="equipment-checkbox"]:nth-of-type(1)');
    await page.check('[data-testid="equipment-checkbox"]:nth-of-type(2)');
    await page.click('[data-testid="compare-button"]');
    await expect(page.locator('[data-testid="comparison-table"]')).toBeVisible();
  });

  test('SCEN-190: 稼働状況・空き状況表示', async ({ page }) => {
    // SCEN-190
    await page.goto(`${baseUrl}/ai-suggestion`);
    await page.click('[data-testid="equipment-item"]').first();
    await page.click('[data-testid="status-button"]');
    await expect(page.locator('[data-testid="operating-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="availability-schedule"]')).toBeVisible();
  });

  test('SCEN-191: 料金見積もり正常計算表示', async ({ page }) => {
    // SCEN-191
    await page.goto(`${baseUrl}/ai-suggestion`);
    await page.fill('[data-testid="research-purpose"]', '実験研究');
    await page.fill('[data-testid="budget-range"]', '1000000');
    await page.fill('[data-testid="usage-period"]', '7');
    await page.click('[data-testid="get-suggestions-button"]');
    await page.click('[data-testid="equipment-item"]').first();
    await page.click('[data-testid="estimate-button"]');
    await expect(page.locator('[data-testid="cost-estimate"]')).toBeVisible();
  });

  test('SCEN-192: 研究目的未入力でエラー表示', async ({ page }) => {
    // SCEN-192
    await page.goto(`${baseUrl}/ai-suggestion`);
    await page.fill('[data-testid="research-field"]', '生物学');
    await page.fill('[data-testid="budget"]', '500000');
    await page.click('[data-testid="get-suggestions-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('研究目的');
  });

  test('SCEN-193: 実験内容空欄で送信エラー', async ({ page }) => {
    // SCEN-193
    await page.goto(`${baseUrl}/ai-suggestion`);
    await page.fill('[data-testid="research-field"]', '化学');
    await page.fill('[data-testid="budget"]', '300000');
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('実験内容');
  });

  test('SCEN-194: 測定要件未選択でエラー', async ({ page }) => {
    // SCEN-194
    await page.goto(`${baseUrl}/ai-suggestion`);
    await page.click('[data-testid="suggest-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('測定要件');
  });

  test('SCEN-195: 予算範囲0円でエラー表示', async ({ page }) => {
    // SCEN-195
    await page.goto(`${baseUrl}/ai-suggestion`);
    await page.fill('[data-testid="budget-input"]', '0');
    await page.fill('[data-testid="research-field"]', '物理学');
    await page.click('[data-testid="get-suggestions-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('予算');
  });

  test('SCEN-196: 利用期間未設定でエラー', async ({ page }) => {
    // SCEN-196
    await page.goto(`${baseUrl}/ai-suggestion`);
    await page.fill('[data-testid="research-purpose"]', '研究実験');
    await page.click('[data-testid="execute-suggestion-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('利用期間');
  });

  test('SCEN-197: AI提案実行でサーバーエラー', async ({ page }) => {
    // SCEN-197
    await page.route('**/api/ai-suggestion', route => route.abort());
    await page.goto(`${baseUrl}/ai-suggestion`);
    await page.fill('[data-testid="research-purpose"]', '分析研究');
    await page.click('[data-testid="execute-ai-button"]');
    await expect(page.locator('[data-testid="server-error"]')).toBeVisible();
  });

  test('SCEN-198: 機器データ取得失敗エラー', async ({ page }) => {
    // SCEN-198
    await page.route('**/api/equipment-data', route => route.abort());
    await page.goto(`${baseUrl}/ai-suggestion`);
    await page.fill('[data-testid="research-conditions"]', '実験条件');
    await page.click('[data-testid="start-suggestion-button"]');
    await expect(page.locator('[data-testid="data-error"]')).toBeVisible();
  });

  test('SCEN-199: 研究目的1文字入力', async ({ page }) => {
    // SCEN-199
    await page.goto(`${baseUrl}/ai-suggestion`);
    await page.fill('[data-testid="research-purpose"]', 'A');
    await page.click('[data-testid="suggest-button"]');
    await expect(page.locator('[data-testid="validation-error"]')).toContainText('2文字以上');
  });

  test('SCEN-200: 研究目的最大文字数入力', async ({ page }) => {
    // SCEN-200
    await page.goto(`${baseUrl}/ai-suggestion`);
    const maxText = 'A'.repeat(1000);
    const overMaxText = 'A'.repeat(1001);
    await page.fill('[data-testid="research-purpose"]', maxText);
    await page.click('[data-testid="suggest-button"]');
    await expect(page.locator('[data-testid="error-message"]')).not.toBeVisible();
    await page.fill('[data-testid="research-purpose"]', overMaxText);
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
  });

  test('SCEN-201: 実験内容1文字入力', async ({ page }) => {
    // SCEN-201
    await page.goto(`${baseUrl}/ai-suggestion`);
    await page.fill('[data-testid="experiment-content"]', 'a');
    await page.click('[data-testid="execute-button"]');
    await expect(page.locator('[data-testid="validation-error"]')).toContainText('文字数が不足');
  });

  test('SCEN-202: 実験内容最大文字数入力', async ({ page }) => {
    // SCEN-202
    await page.goto(`${baseUrl}/ai-suggestion`);
    const maxText = 'experiment content '.repeat(50);
    await page.fill('[data-testid="experiment-content"]', maxText);
    await page.click('[data-testid="execute-button"]');
    await expect(page.locator('[data-testid="suggestion-results"]')).toBeVisible();
  });

  test('SCEN-203: 予算範囲最小値設定', async ({ page }) => {
    // SCEN-203
    await page.goto(`${baseUrl}/ai-suggestion`);
    await page.fill('[data-testid="budget-min"]', '1');
    await page.fill('[data-testid="budget-max"]', '1000000');
    await page.fill('[data-testid="research-field"]', '工学');
    await page.click('[data-testid="execute-suggestion-button"]');
    await expect(page.locator('[data-testid="suggestion-results"]')).toBeVisible();
  });

  test('SCEN-204: 予算範囲最大値設定', async ({ page }) => {
    // SCEN-204
    await page.goto(`${baseUrl}/ai-suggestion`);
    await page.fill('[data-testid="budget-input"]', '999999999');
    await page.fill('[data-testid="research-field"]', '医学');
    await page.click('[data-testid="execute-button"]');
    await expect(page.locator('[data-testid="equipment-suggestions"]')).toBeVisible();
  });

  test('SCEN-205: 利用期間当日指定', async ({ page }) => {
    // SCEN-205
    await page.goto(`${baseUrl}/ai-suggestion`);
    const today = new Date().toISOString().split('T')[0];
    await page.fill('[data-testid="start-date"]', today);
    await page.fill('[data-testid="end-date"]', today);
    await page.fill('[data-testid="research-field"]', '化学');
    await page.click('[data-testid="execute-button"]');
    await expect(page.locator('[data-testid="available-today"]')).toBeVisible();
  });

  test('SCEN-206: 利用期間最大期間指定', async ({ page }) => {
    // SCEN-206
    await page.goto(`${baseUrl}/ai-suggestion`);
    await page.fill('[data-testid="research-purpose"]', '長期研究');
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-12-31');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="equipment-list"]')).toBeVisible();
    await page.fill('[data-testid="end-date"]', '2025-01-02');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="period-error"]')).toBeVisible();
  });
});