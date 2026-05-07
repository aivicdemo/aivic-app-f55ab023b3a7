import { test, expect } from '@playwright/test';

describe('機器検索画面', () => {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseURL}/login`);
    await page.fill('[data-testid="username"]', 'testuser');
    await page.fill('[data-testid="password"]', 'testpass');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/dashboard');
  });

  test('SCEN-252: 機器名での基本検索ができる', async ({ page }) => {
    // SCEN-252
    await page.goto(`${baseURL}/equipment/search`);
    await page.fill('[data-testid="equipment-name-input"]', '顕微鏡');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="equipment-item"]')).toContainText('顕微鏡');
  });

  test('SCEN-253: 型番での機器検索が正常動作', async ({ page }) => {
    // SCEN-253
    await page.goto(`${baseURL}/equipment/search`);
    await page.selectOption('[data-testid="search-type"]', 'model');
    await page.fill('[data-testid="model-input"]', 'ABC-123');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="equipment-item"]')).toContainText('ABC-123');
    await expect(page.locator('[data-testid="equipment-details"]')).toBeVisible();
  });

  test('SCEN-254: カテゴリ選択で絞り込める', async ({ page }) => {
    // SCEN-254
    await page.goto(`${baseURL}/equipment/search`);
    await page.selectOption('[data-testid="category-select"]', '顕微鏡');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="equipment-item"]')).toContainText('顕微鏡');
    await page.selectOption('[data-testid="category-select"]', '分析装置');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="equipment-item"]')).toContainText('分析装置');
  });

  test('SCEN-255: 測定項目フィルタが適用される', async ({ page }) => {
    // SCEN-255
    await page.goto(`${baseURL}/equipment/search`);
    await page.selectOption('[data-testid="measurement-filter"]', '質量分析');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="equipment-item"]')).toContainText('質量分析');
  });

  test('SCEN-256: 利用日時指定で検索できる', async ({ page }) => {
    // SCEN-256
    await page.goto(`${baseURL}/equipment/search`);
    await page.fill('[data-testid="start-date"]', '2024-02-01');
    await page.fill('[data-testid="start-time"]', '09:00');
    await page.fill('[data-testid="end-date"]', '2024-02-01');
    await page.fill('[data-testid="end-time"]', '17:00');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="available-equipment"]')).toBeVisible();
  });

  test('SCEN-257: 料金範囲スライダーで絞込可能', async ({ page }) => {
    // SCEN-257
    await page.goto(`${baseURL}/equipment/search`);
    await page.fill('[data-testid="price-min"]', '1000');
    await page.fill('[data-testid="price-max"]', '5000');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="equipment-item"]')).toBeVisible();
  });

  test('SCEN-258: 設置場所での機器検索ができる', async ({ page }) => {
    // SCEN-258
    await page.goto(`${baseURL}/equipment/search`);
    await page.fill('[data-testid="location-input"]', 'A棟3階');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="equipment-item"]')).toContainText('A棟3階');
  });

  test('SCEN-259: 詳細検索条件が展開される', async ({ page }) => {
    // SCEN-259
    await page.goto(`${baseURL}/equipment/search`);
    await page.click('[data-testid="advanced-search-toggle"]');
    await expect(page.locator('[data-testid="advanced-search-form"]')).toBeVisible();
    await expect(page.locator('[data-testid="category-filter"]')).toBeVisible();
    await expect(page.locator('[data-testid="specification-filter"]')).toBeVisible();
  });

  test('SCEN-260: 複数条件での組み合わせ検索', async ({ page }) => {
    // SCEN-260
    await page.goto(`${baseURL}/equipment/search`);
    await page.selectOption('[data-testid="category-select"]', '顕微鏡');
    await page.fill('[data-testid="start-date"]', '2024-01-15');
    await page.fill('[data-testid="end-date"]', '2024-01-20');
    await page.selectOption('[data-testid="location-select"]', '東京本部');
    await page.check('[data-testid="morning-time"]');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test('SCEN-261: 検索条件がクリアされる', async ({ page }) => {
    // SCEN-261
    await page.goto(`${baseURL}/equipment/search`);
    await page.fill('[data-testid="equipment-name-input"]', '顕微鏡');
    await page.selectOption('[data-testid="category-select"]', '光学機器');
    await page.fill('[data-testid="start-date"]', '2024-01-15');
    await page.fill('[data-testid="end-date"]', '2024-01-20');
    await page.click('[data-testid="search-button"]');
    await page.click('[data-testid="clear-button"]');
    await expect(page.locator('[data-testid="equipment-name-input"]')).toHaveValue('');
  });

  test('SCEN-262: 機器一覧が適切に表示される', async ({ page }) => {
    // SCEN-262
    await page.goto(`${baseURL}/equipment/search`);
    await expect(page.locator('[data-testid="equipment-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="equipment-item"]')).toBeVisible();
    await expect(page.locator('[data-testid="equipment-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="equipment-model"]')).toBeVisible();
  });

  test('SCEN-263: 稼働状況が正しく表示', async ({ page }) => {
    // SCEN-263
    await page.goto(`${baseURL}/equipment/search`);
    await expect(page.locator('[data-testid="equipment-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="status-running"]')).toContainText('稼働中');
    await expect(page.locator('[data-testid="status-stopped"]')).toContainText('停止中');
    await expect(page.locator('[data-testid="status-maintenance"]')).toContainText('メンテナンス中');
  });

  test('SCEN-264: 存在しない機器名での検索', async ({ page }) => {
    // SCEN-264
    await page.goto(`${baseURL}/equipment/search`);
    await page.fill('[data-testid="equipment-name-input"]', '存在しない機器XYZ123');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="no-results-message"]')).toContainText('該当する機器が見つかりません');
  });

  test('SCEN-265: 無効な型番入力でエラー', async ({ page }) => {
    // SCEN-265
    await page.goto(`${baseURL}/equipment/search`);
    await page.selectOption('[data-testid="search-type"]', 'model');
    await page.fill('[data-testid="model-input"]', '!!!@@@###$$$%%%^^^&&&***');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('SCEN-266: 過去日時指定でエラー表示', async ({ page }) => {
    // SCEN-266
    await page.goto(`${baseURL}/equipment/search`);
    await page.fill('[data-testid="start-date"]', '2020-01-01');
    await page.fill('[data-testid="start-time"]', '09:00');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('過去の日時は指定できません');
  });

  test('SCEN-267: システムエラー時の検索失敗', async ({ page }) => {
    // SCEN-267
    await page.route('**/api/equipment/search', route => route.abort());
    await page.goto(`${baseURL}/equipment/search`);
    await page.fill('[data-testid="equipment-name-input"]', '顕微鏡');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="system-error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });

  test('SCEN-268: ネットワーク断でエラー処理', async ({ page }) => {
    // SCEN-268
    await page.route('**/*', route => route.abort());
    await page.goto(`${baseURL}/equipment/search`);
    await page.fill('[data-testid="equipment-name-input"]', '顕微鏡');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="network-error-message"]')).toContainText('ネットワークエラーが発生しました');
    await page.unroute('**/*');
    await page.reload();
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test('SCEN-269: 空の検索条件での実行', async ({ page }) => {
    // SCEN-269
    await page.goto(`${baseURL}/equipment/search`);
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="all-equipment-list"]')).toBeVisible();
  });

  test('SCEN-270: 最大文字数での機器名検索', async ({ page }) => {
    // SCEN-270
    await page.goto(`${baseURL}/equipment/search`);
    const longName = 'a'.repeat(255);
    await page.fill('[data-testid="equipment-name-input"]', longName);
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test('SCEN-271: 特殊文字入力でのバリデーション', async ({ page }) => {
    // SCEN-271
    await page.goto(`${baseURL}/equipment/search`);
    await page.fill('[data-testid="equipment-name-input"]', '!@#$%^&*()[]{}|\\:;"\'<>,.?/~`');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="validation-message"]')).toBeVisible();
  });

  test('SCEN-272: 全カテゴリ未選択での検索', async ({ page }) => {
    // SCEN-272
    await page.goto(`${baseURL}/equipment/search`);
    await page.selectOption('[data-testid="category-select"]', '');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="all-equipment-list"]')).toBeVisible();
  });

  test('SCEN-273: 料金範囲の最小値設定', async ({ page }) => {
    // SCEN-273
    await page.goto(`${baseURL}/equipment/search`);
    await page.fill('[data-testid="price-min"]', '0');
    await page.fill('[data-testid="price-max"]', '10000');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await page.fill('[data-testid="price-min"]', '-100');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="validation-message"]')).toBeVisible();
  });

  test('SCEN-274: 料金範囲の最大値設定', async ({ page }) => {
    // SCEN-274
    await page.goto(`${baseURL}/equipment/search`);
    await page.fill('[data-testid="price-max"]', '9999999999');
    await page.click('[data-testid="search-button"]');
    await page.fill('[data-testid="price-max"]', '-1000');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="validation-message"]')).toBeVisible();
  });

  test('SCEN-275: 全拠点未選択での検索実行', async ({ page }) => {
    // SCEN-275
    await page.goto(`${baseURL}/equipment/search`);
    await page.uncheck('[data-testid="location-all"]');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="location-error-message"]')).toContainText('拠点を選択してください');
  });

  test('SCEN-276: 検索結果0件時の表示', async ({ page }) => {
    // SCEN-276
    await page.goto(`${baseURL}/equipment/search`);
    await page.fill('[data-testid="equipment-name-input"]', '存在しない機器XYZ');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="no-results-message"]')).toContainText('該当する機器が見つかりませんでした');
  });

  test('SCEN-277: 大量検索結果のページング', async ({ page }) => {
    // SCEN-277
    await page.goto(`${baseURL}/equipment/search`);
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="pagination"]')).toBeVisible();
    await page.click('[data-testid="next-page"]');
    await page.click('[data-testid="prev-page"]');
    await page.click('[data-testid="page-10"]');
    await page.selectOption('[data-testid="items-per-page"]', '50');
    await expect(page.locator('[data-testid="pagination"]')).toBeVisible();
  });
});