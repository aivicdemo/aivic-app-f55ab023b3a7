import { test, expect } from '@playwright/test';

describe("機器検索・選定", () => {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseURL}/login`);
    await page.fill('[data-testid="username"]', 'testuser');
    await page.fill('[data-testid="password"]', 'testpass');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(`${baseURL}/dashboard`);
  });

  test('SCEN-028: 研究分野選択で機器検索実行', async ({ page }) => {
    // SCEN-028
    await page.goto(`${baseURL}/equipment-search`);
    await page.click('[data-testid="research-field-dropdown"]');
    await expect(page.locator('[data-testid="research-field-list"]')).toBeVisible();
    await page.click('[data-testid="research-field-biology"]');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="equipment-item"]').first()).toContainText('生物学');
  });

  test('SCEN-029: 複数カテゴリ選択で絞り込み検索', async ({ page }) => {
    // SCEN-029
    await page.goto(`${baseURL}/equipment-search`);
    await page.check('[data-testid="category-microscope"]');
    await page.check('[data-testid="category-analyzer"]');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="equipment-item"]')).toContainText(/顕微鏡|分析装置/);
  });

  test('SCEN-030: 測定項目入力で機器一覧表示', async ({ page }) => {
    // SCEN-030
    await page.goto(`${baseURL}/equipment-search`);
    await page.fill('[data-testid="measurement-item"]', '分子量測定');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="equipment-name"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="equipment-status"]').first()).toBeVisible();
  });

  test('SCEN-031: サンプル種別選択で検索結果更新', async ({ page }) => {
    // SCEN-031
    await page.goto(`${baseURL}/equipment-search`);
    await page.selectOption('[data-testid="sample-type-dropdown"]', '生体試料');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await page.selectOption('[data-testid="sample-type-dropdown"]', '化学試料');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test('SCEN-032: 測定精度要件入力で適合機器表示', async ({ page }) => {
    // SCEN-032
    await page.goto(`${baseURL}/equipment-search`);
    await page.fill('[data-testid="measurement-precision"]', '±0.1%');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await page.click('[data-testid="equipment-item"]').first();
    await expect(page.locator('[data-testid="precision-spec"]')).toContainText('±0.1%');
  });

  test('SCEN-033: 利用希望日時選択で空き状況確認', async ({ page }) => {
    // SCEN-033
    await page.goto(`${baseURL}/equipment-search`);
    await page.click('[data-testid="search-button"]');
    await page.click('[data-testid="equipment-item"]').first();
    await page.click('[data-testid="reserve-button"]');
    await page.fill('[data-testid="desired-date"]', '2024-12-31');
    await page.selectOption('[data-testid="desired-time"]', '09:00');
    await page.click('[data-testid="check-availability"]');
    await expect(page.locator('[data-testid="availability-status"]')).toBeVisible();
  });

  test('SCEN-034: 利用時間長スライダーで検索', async ({ page }) => {
    // SCEN-034
    await page.goto(`${baseURL}/equipment-search`);
    await page.locator('[data-testid="duration-slider-min"]').fill('2');
    await page.locator('[data-testid="duration-slider-max"]').fill('6');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await page.click('[data-testid="equipment-item"]').first();
    await expect(page.locator('[data-testid="duration-limit"]')).toContainText(/2.*6/);
  });

  test('SCEN-035: 予算上限設定で機器フィルタリング', async ({ page }) => {
    // SCEN-035
    await page.goto(`${baseURL}/equipment-search`);
    await page.fill('[data-testid="budget-limit"]', '50000');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await page.fill('[data-testid="budget-limit"]', '30000');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test('SCEN-036: 所在地選択で近隣機器表示', async ({ page }) => {
    // SCEN-036
    await page.goto(`${baseURL}/equipment-search`);
    await page.selectOption('[data-testid="location-filter"]', '東京都');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="equipment-location"]').first()).toContainText('東京都');
  });

  test('SCEN-037: キーワード検索で機器抽出', async ({ page }) => {
    // SCEN-037
    await page.goto(`${baseURL}/equipment-search`);
    await page.fill('[data-testid="keyword-search"]', '顕微鏡');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="equipment-item"]').first()).toContainText('顕微鏡');
  });

  test('SCEN-038: 詳細検索展開で条件項目表示', async ({ page }) => {
    // SCEN-038
    await page.goto(`${baseURL}/equipment-search`);
    await page.click('[data-testid="advanced-search-button"]');
    await expect(page.locator('[data-testid="advanced-search-area"]')).toBeVisible();
    await expect(page.locator('[data-testid="category-filter"]')).toBeVisible();
    await expect(page.locator('[data-testid="datetime-filter"]')).toBeVisible();
    await expect(page.locator('[data-testid="location-filter"]')).toBeVisible();
  });

  test('SCEN-039: 全条件組み合わせ検索実行', async ({ page }) => {
    // SCEN-039
    await page.goto(`${baseURL}/equipment-search`);
    await page.selectOption('[data-testid="research-field-dropdown"]', '生物学');
    await page.check('[data-testid="category-microscope"]');
    await page.fill('[data-testid="measurement-item"]', '細胞観察');
    await page.fill('[data-testid="budget-limit"]', '10000');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test('SCEN-040: 研究分野未選択で検索実行', async ({ page }) => {
    // SCEN-040
    await page.goto(`${baseURL}/equipment-search`);
    await page.fill('[data-testid="keyword-search"]', 'テスト機器');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('研究分野を選択してください');
  });

  test('SCEN-041: カテゴリ未選択で検索エラー', async ({ page }) => {
    // SCEN-041
    await page.goto(`${baseURL}/equipment-search`);
    await page.fill('[data-testid="keyword-search"]', 'テスト');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('カテゴリを選択してください');
  });

  test('SCEN-042: 測定項目空欄で検索実行', async ({ page }) => {
    // SCEN-042
    await page.goto(`${baseURL}/equipment-search`);
    await page.selectOption('[data-testid="category-dropdown"]', '顕微鏡');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('測定項目は必須入力です');
  });

  test('SCEN-043: サンプル種別未選択で検索', async ({ page }) => {
    // SCEN-043
    await page.goto(`${baseURL}/equipment-search`);
    await page.fill('[data-testid="keyword-search"]', 'テスト機器');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('サンプル種別を選択してください');
  });

  test('SCEN-044: 測定精度要件無効値入力', async ({ page }) => {
    // SCEN-044
    await page.goto(`${baseURL}/equipment-search`);
    await page.fill('[data-testid="measurement-precision"]', '-0.01');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('無効な測定精度値です');
    await page.fill('[data-testid="measurement-precision"]', 'abc');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('無効な測定精度値です');
  });

  test('SCEN-045: 利用日時過去日選択エラー', async ({ page }) => {
    // SCEN-045
    await page.goto(`${baseURL}/equipment-search`);
    await page.click('[data-testid="search-button"]');
    await page.click('[data-testid="equipment-item"]').first();
    await page.click('[data-testid="reserve-button"]');
    await page.fill('[data-testid="start-date"]', '2020-01-01');
    await page.click('[data-testid="confirm-reservation"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('過去の日付は選択できません');
  });

  test('SCEN-046: 利用時間長異常値設定', async ({ page }) => {
    // SCEN-046
    await page.goto(`${baseURL}/equipment-search`);
    await page.fill('[data-testid="duration-input"]', '-5');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('利用時間長は正の値を入力してください');
    await page.fill('[data-testid="duration-input"]', '99999');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('利用時間長が上限を超えています');
  });

  test('SCEN-047: 予算上限負の値入力エラー', async ({ page }) => {
    // SCEN-047
    await page.goto(`${baseURL}/equipment-search`);
    await page.fill('[data-testid="budget-limit"]', '-10000');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('予算上限は正の値を入力してください');
  });

  test('SCEN-048: 所在地未選択で検索実行', async ({ page }) => {
    // SCEN-048
    await page.goto(`${baseURL}/equipment-search`);
    await page.fill('[data-testid="keyword-search"]', 'テスト機器');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('所在地を選択してください');
  });

  test('SCEN-049: 特殊文字キーワード検索エラー', async ({ page }) => {
    // SCEN-049
    await page.goto(`${baseURL}/equipment-search`);
    await page.fill('[data-testid="keyword-search"]', '<script>alert("test")</script>');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('無効な文字が含まれています');
    await expect(page.locator('script')).toHaveCount(0);
  });

  test('SCEN-050: 検索条件全項目空欄実行', async ({ page }) => {
    // SCEN-050
    await page.goto(`${baseURL}/equipment-search`);
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('検索条件を入力してください');
  });

  test('SCEN-051: 測定項目最大文字数入力', async ({ page }) => {
    // SCEN-051
    await page.goto(`${baseURL}/equipment-search`);
    const maxText = 'a'.repeat(255);
    await page.fill('[data-testid="measurement-item"]', maxText);
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test('SCEN-052: 測定精度要件境界値入力', async ({ page }) => {
    // SCEN-052
    await page.goto(`${baseURL}/equipment-search`);
    await page.fill('[data-testid="precision-min"]', '0.001');
    await page.fill('[data-testid="precision-max"]', '999.999');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await page.fill('[data-testid="precision-min"]', '-1');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('SCEN-053: 利用日時最遠未来日選択', async ({ page }) => {
    // SCEN-053
    await page.goto(`${baseURL}/equipment-search`);
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    await page.fill('[data-testid="desired-date"]', futureDate.toISOString().split('T')[0]);
    await page.selectOption('[data-testid="desired-time"]', '09:00');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"], [data-testid="no-results"]')).toBeVisible();
  });

  test('SCEN-054: 利用時間長最大値設定', async ({ page }) => {
    // SCEN-054
    await page.goto(`${baseURL}/equipment-search`);
    await page.fill('[data-testid="duration-input"]', '999');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await page.fill('[data-testid="duration-input"]', '9999');
    await page.blur('[data-testid="duration-input"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('上限を超えています');
  });

  test('SCEN-055: 予算上限最大値入力', async ({ page }) => {
    // SCEN-055
    await page.goto(`${baseURL}/equipment-search`);
    await page.fill('[data-testid="budget-limit"]', '999999999');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test('SCEN-056: キーワード最大文字数検索', async ({ page }) => {
    // SCEN-056
    await page.goto(`${baseURL}/equipment-search`);
    const maxKeyword = 'test'.repeat(63) + 'abc'; // 255文字
    await page.fill('[data-testid="keyword-search"]', maxKeyword);
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-test