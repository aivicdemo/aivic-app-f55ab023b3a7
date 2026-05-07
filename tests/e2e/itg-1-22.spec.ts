import { test, expect } from '@playwright/test';

describe("AI機器提案機能", () => {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseURL}/login`);
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${baseURL}/dashboard`);
  });

  test('SCEN-182: 研究目的入力でAI提案実行成功', async ({ page }) => {
    // SCEN-182
    await page.goto(`${baseURL}/ai-proposal`);
    await page.fill('[name="researchPurpose"]', 'タンパク質の構造解析');
    await page.click('button[data-testid="ai-proposal-execute"]');
    await page.waitForSelector('[data-testid="proposal-results"]');
    await expect(page.locator('[data-testid="proposal-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="equipment-item"]').first()).toContainText('機器名');
    await expect(page.locator('[data-testid="error-message"]')).not.toBeVisible();
  });

  test('SCEN-183: 実験内容詳細入力で機器候補表示', async ({ page }) => {
    // SCEN-183
    await page.goto(`${baseURL}/ai-proposal`);
    await page.fill('[name="experimentDetails"]', 'タンパク質の構造解析実験');
    await page.click('button[data-testid="equipment-proposal"]');
    await page.waitForSelector('[data-testid="equipment-candidates"]');
    await expect(page.locator('[data-testid="equipment-candidates"]')).toBeVisible();
    await expect(page.locator('[data-testid="equipment-info"]').first()).toContainText('機器名');
    await expect(page.locator('[data-testid="availability-info"]').first()).toBeVisible();
  });

  test('SCEN-184: 測定要件選択で適合機器絞込', async ({ page }) => {
    // SCEN-184
    await page.goto(`${baseURL}/ai-proposal`);
    await page.selectOption('[name="measurementTarget"]', 'タンパク質');
    await page.selectOption('[name="measurementMethod"]', '分光分析');
    await page.selectOption('[name="measurementPrecision"]', '高精度');
    await page.fill('[name="sampleSize"]', '1ml以下');
    await page.click('button[data-testid="search-equipment"]');
    await page.waitForSelector('[data-testid="search-results"]');
    await expect(page.locator('[data-testid="equipment-match"]').first()).toContainText('適合度');
  });

  test('SCEN-185: 技術仕様条件設定で提案更新', async ({ page }) => {
    // SCEN-185
    await page.goto(`${baseURL}/ai-proposal`);
    await page.click('[data-testid="tech-specs-section"]');
    await page.fill('[name="performance"]', '高性能');
    await page.fill('[name="function"]', '自動分析');
    await page.fill('[name="precision"]', '±0.1%');
    await page.click('button[data-testid="apply-conditions"]');
    await page.waitForSelector('[data-testid="updated-proposals"]');
    await expect(page.locator('[data-testid="updated-proposals"]')).toBeVisible();
  });

  test('SCEN-186: 予算範囲スライダーで価格絞込', async ({ page }) => {
    // SCEN-186
    await page.goto(`${baseURL}/ai-proposal`);
    await expect(page.locator('[data-testid="budget-slider"]')).toBeVisible();
    await page.locator('[data-testid="budget-min"]').fill('500000');
    await page.locator('[data-testid="budget-max"]').fill('2000000');
    await page.click('button[data-testid="apply-price-filter"]');
    await page.waitForSelector('[data-testid="filtered-results"]');
    await expect(page.locator('[data-testid="equipment-price"]').first()).toContainText('円');
  });

  test('SCEN-187: 利用期間指定で空き状況確認', async ({ page }) => {
    // SCEN-187
    await page.goto(`${baseURL}/ai-proposal`);
    await page.fill('[name="startDate"]', '2024-01-15');
    await page.fill('[name="endDate"]', '2024-01-20');
    await page.click('button[data-testid="check-availability"]');
    await page.waitForSelector('[data-testid="availability-results"]');
    await expect(page.locator('[data-testid="availability-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="time-slot"]').first()).toBeVisible();
  });

  test('SCEN-188: 機器適合度スコア正常表示', async ({ page }) => {
    // SCEN-188
    await page.goto(`${baseURL}/ai-proposal`);
    await page.fill('[name="researchPurpose"]', 'サンプル研究');
    await page.fill('[name="experimentContent"]', 'サンプル実験');
    await page.click('button[data-testid="get-proposals"]');
    await page.waitForSelector('[data-testid="equipment-list"]');
    await expect(page.locator('[data-testid="compatibility-score"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="equipment-list"] > div').first()).toContainText('100');
  });

  test('SCEN-189: 機器仕様比較テーブル表示', async ({ page }) => {
    // SCEN-189
    await page.goto(`${baseURL}/ai-proposal`);
    await page.fill('[name="researchPurpose"]', '比較テスト');
    await page.click('button[data-testid="get-proposals"]');
    await page.waitForSelector('[data-testid="equipment-list"]');
    await page.check('[data-testid="equipment-checkbox"]:nth-of-type(1)');
    await page.check('[data-testid="equipment-checkbox"]:nth-of-type(2)');
    await page.click('button[data-testid="compare-specs"]');
    await expect(page.locator('[data-testid="comparison-table"]')).toBeVisible();
  });

  test('SCEN-190: 稼働状況・空き状況表示', async ({ page }) => {
    // SCEN-190
    await page.goto(`${baseURL}/ai-proposal`);
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.click('button[data-testid="show-status"]');
    await page.waitForSelector('[data-testid="operation-status"]');
    await expect(page.locator('[data-testid="operation-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="availability-schedule"]')).toBeVisible();
  });

  test('SCEN-191: 料金見積もり正常計算表示', async ({ page }) => {
    // SCEN-191
    await page.goto(`${baseURL}/ai-proposal`);
    await page.fill('[name="researchPurpose"]', 'テスト研究');
    await page.fill('[name="budgetRange"]', '1000000');
    await page.fill('[name="startDate"]', '2024-01-15');
    await page.fill('[name="endDate"]', '2024-01-20');
    await page.click('button[data-testid="get-proposals"]');
    await page.waitForSelector('[data-testid="equipment-list"]');
    await page.click('[data-testid="equipment-item"]:first-child');
    await page.click('button[data-testid="show-estimate"]');
    await expect(page.locator('[data-testid="cost-breakdown"]')).toBeVisible();
  });

  test('SCEN-192: 研究目的未入力でエラー表示', async ({ page }) => {
    // SCEN-192
    await page.goto(`${baseURL}/ai-proposal`);
    await page.fill('[name="researchField"]', 'バイオテクノロジー');
    await page.fill('[name="budget"]', '1000000');
    await page.click('button[data-testid="get-proposals"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('研究目的');
  });

  test('SCEN-193: 実験内容空欄で送信エラー', async ({ page }) => {
    // SCEN-193
    await page.goto(`${baseURL}/ai-proposal`);
    await page.fill('[name="researchField"]', 'バイオテクノロジー');
    await page.fill('[name="budget"]', '1000000');
    await page.click('button[data-testid="submit-proposal"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('実験内容');
  });

  test('SCEN-194: 測定要件未選択でエラー', async ({ page }) => {
    // SCEN-194
    await page.goto(`${baseURL}/ai-proposal`);
    await page.click('button[data-testid="execute-proposal"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('測定要件');
  });

  test('SCEN-195: 予算範囲0円でエラー表示', async ({ page }) => {
    // SCEN-195
    await page.goto(`${baseURL}/ai-proposal`);
    await page.fill('[name="budget"]', '0');
    await page.fill('[name="researchField"]', 'バイオテクノロジー');
    await page.fill('[name="equipmentType"]', '分析機器');
    await page.click('button[data-testid="get-proposal"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('予算範囲');
  });

  test('SCEN-196: 利用期間未設定でエラー', async ({ page }) => {
    // SCEN-196
    await page.goto(`${baseURL}/ai-proposal`);
    await page.fill('[name="researchPurpose"]', 'テスト研究');
    await page.fill('[name="conditions"]', 'テスト条件');
    await page.click('button[data-testid="execute-proposal"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('利用期間');
  });

  test('SCEN-197: AI提案実行でサーバーエラー', async ({ page }) => {
    // SCEN-197
    await page.route('**/api/ai-proposal', route => route.abort());
    await page.goto(`${baseURL}/ai-proposal`);
    await page.fill('[name="researchPurpose"]', 'テスト研究');
    await page.fill('[name="conditions"]', 'テスト条件');
    await page.click('button[data-testid="execute-ai-proposal"]');
    await expect(page.locator('[data-testid="server-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="server-error"]')).toContainText('サーバーエラー');
  });

  test('SCEN-198: 機器データ取得失敗エラー', async ({ page }) => {
    // SCEN-198
    await page.route('**/api/equipment-data', route => route.abort());
    await page.goto(`${baseURL}/ai-proposal`);
    await page.fill('[name="researchConditions"]', 'テスト条件');
    await page.fill('[name="requirements"]', 'テスト要件');
    await page.click('button[data-testid="start-proposal"]');
    await expect(page.locator('[data-testid="data-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });

  test('SCEN-199: 研究目的1文字入力', async ({ page }) => {
    // SCEN-199
    await page.goto(`${baseURL}/ai-proposal`);
    await page.fill('[name="researchPurpose"]', 'A');
    await page.click('button[data-testid="execute-proposal"]');
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="validation-error"]')).toContainText('2文字以上');
  });

  test('SCEN-200: 研究目的最大文字数入力', async ({ page }) => {
    // SCEN-200
    await page.goto(`${baseURL}/ai-proposal`);
    const maxText = 'A'.repeat(1000);
    const overMaxText = 'A'.repeat(1001);
    await page.fill('[name="researchPurpose"]', maxText);
    await page.click('button[data-testid="execute-proposal"]');
    await page.fill('[name="researchPurpose"]', overMaxText);
    await page.click('button[data-testid="execute-proposal"]');
    await expect(page.locator('[data-testid="length-error"]')).toBeVisible();
  });

  test('SCEN-201: 実験内容1文字入力', async ({ page }) => {
    // SCEN-201
    await page.goto(`${baseURL}/ai-proposal`);
    await page.fill('[name="experimentContent"]', 'a');
    await page.click('button[data-testid="execute-proposal"]');
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="validation-error"]')).toContainText('文字数が不足');
  });

  test('SCEN-202: 実験内容最大文字数入力', async ({ page }) => {
    // SCEN-202
    await page.goto(`${baseURL}/ai-proposal`);
    const maxContent = 'テスト実験内容'.repeat(200);
    await page.fill('[name="experimentContent"]', maxContent);
    await expect(page.locator('[name="experimentContent"]')).toHaveValue(maxContent);
    await page.click('button[data-testid="execute-proposal"]');
    await expect(page.locator('[data-testid="proposal-results"]')).toBeVisible();
  });

  test('SCEN-203: 予算範囲最小値設定', async ({ page }) => {
    // SCEN-203
    await page.goto(`${baseURL}/ai-proposal`);
    await page.fill('[name="budgetMin"]', '1');
    await page.fill('[name="budgetMax"]', '1000000');
    await page.fill('[name="researchField"]', 'バイオテクノロジー');
    await page.fill('[name="equipmentCategory"]', '分析機器');
    await page.click('button[data-testid="execute-proposal"]');
    await expect(page.locator('[data-testid="proposal-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="equipment-price"]').first()).toContainText('円');
  });

  test('SCEN-204: 予算範囲最大値設定', async ({ page }) => {
    // SCEN-204
    await page.goto(`${baseURL}/ai-proposal`);
    await page.fill('[name="budget"]', '999999999');
    await page.fill('[name="researchField"]', 'バイオテクノロジー');
    await page.fill('[name="equipmentType"]', '分析機器');
    await page.click('button[data-testid="execute-proposal"]');
    await page.waitForSelector('[data-testid="proposal-results"]');
    await expect(page.locator('[data-testid="proposal-results"]')).toBeVisible();
  });

  test('SCEN-205: 利用期間当日指定', async ({ page }) => {
    // SCEN-205
    await page.goto(`${baseURL}/ai-proposal`);
    const today = new Date().toISOString().split('T')[0];
    await page.fill('[name="startDate"]', today);
    await page.fill('[name="endDate"]', today);
    await page.fill('[name="researchField"]', 'バイオテクノロジー');
    await page.fill('[name="budget"]', '1000000');
    await page.click('button[data-testid="execute-proposal"]');
    await expect(page.locator('[data-testid="same-day-availability"]')).toBeVisible();
  });

  test('SCEN-206: 利用期間最大期間指定', async ({ page }) => {
    // SCEN-206
    await page.goto(`${baseURL}/ai-proposal`);
    await page.fill('[name="researchPurpose"]', 'テスト研究');
    await page.fill('[name="startDate"]', '2024-01-01');
    await page.fill('[name="endDate"]', '2024-12-31');
    await page.click('button[data-testid="search-equipment"]');
    await page.fill('[name="endDate"]', '2025-01-02');
    await page.click('button[data-testid="search-equipment"]');
    await expect(page.locator('[data-testid="period-error"]')).toBeVisible();
  });
});