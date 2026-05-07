import { test, expect } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

describe("機器検索・選定", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseURL}/login`);
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/dashboard');
  });

  test("研究分野選択で機器検索実行", async ({ page }) => {
    // SCEN-028
    await page.goto(`${baseURL}/equipment-search`);
    await page.click('[data-testid="research-field-dropdown"]');
    await expect(page.locator('[data-testid="research-field-options"]')).toBeVisible();
    await page.click('[data-testid="research-field-biology"]');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="search-results"]');
    await expect(page.locator('[data-testid="equipment-list"]')).toBeVisible();
  });

  test("複数カテゴリ選択で絞り込み検索", async ({ page }) => {
    // SCEN-029
    await page.goto(`${baseURL}/equipment-search`);
    await page.check('[data-testid="category-microscope"]');
    await page.check('[data-testid="category-analyzer"]');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="search-results"]');
    await expect(page.locator('[data-testid="equipment-item"]')).toBeVisible();
  });

  test("測定項目入力で機器一覧表示", async ({ page }) => {
    // SCEN-030
    await page.goto(`${baseURL}/equipment-search`);
    await page.fill('[data-testid="measurement-item"]', '分子量測定');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="search-results"]');
    await expect(page.locator('[data-testid="equipment-info"]')).toBeVisible();
  });

  test("サンプル種別選択で検索結果更新", async ({ page }) => {
    // SCEN-031
    await page.goto(`${baseURL}/equipment-search`);
    await page.selectOption('[data-testid="sample-type"]', '生体試料');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="search-results"]');
    await page.selectOption('[data-testid="sample-type"]', '化学試料');
    await page.waitForSelector('[data-testid="search-results-updated"]');
    await expect(page.locator('[data-testid="equipment-list"]')).toBeVisible();
  });

  test("測定精度要件入力で適合機器表示", async ({ page }) => {
    // SCEN-032
    await page.goto(`${baseURL}/equipment-search`);
    await page.fill('[data-testid="measurement-accuracy"]', '±0.1%');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="search-results"]');
    await expect(page.locator('[data-testid="equipment-accuracy-spec"]')).toBeVisible();
  });

  test("利用希望日時選択で空き状況確認", async ({ page }) => {
    // SCEN-033
    await page.goto(`${baseURL}/equipment-search`);
    await page.click('[data-testid="search-button"]');
    await page.click('[data-testid="equipment-item"]:first-of-type');
    await page.click('[data-testid="reserve-button"]');
    await page.fill('[data-testid="date-picker"]', '2024-12-31');
    await page.selectOption('[data-testid="time-slot"]', '10:00');
    await page.click('[data-testid="check-availability"]');
    await expect(page.locator('[data-testid="availability-status"]')).toBeVisible();
  });

  test("利用時間長スライダーで検索", async ({ page }) => {
    // SCEN-034
    await page.goto(`${baseURL}/equipment-search`);
    await page.locator('[data-testid="duration-slider"]').fill('2');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="search-results"]');
    await expect(page.locator('[data-testid="duration-limit"]')).toBeVisible();
  });

  test("予算上限設定で機器フィルタリング", async ({ page }) => {
    // SCEN-035
    await page.goto(`${baseURL}/equipment-search`);
    await page.fill('[data-testid="budget-limit"]', '50000');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="search-results"]');
    await page.fill('[data-testid="budget-limit"]', '30000');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="equipment-price"]')).toBeVisible();
  });

  test("所在地選択で近隣機器表示", async ({ page }) => {
    // SCEN-036
    await page.goto(`${baseURL}/equipment-search`);
    await page.selectOption('[data-testid="location"]', '東京都');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="search-results"]');
    await expect(page.locator('[data-testid="equipment-location"]')).toBeVisible();
  });

  test("キーワード検索で機器抽出", async ({ page }) => {
    // SCEN-037
    await page.goto(`${baseURL}/equipment-search`);
    await page.fill('[data-testid="keyword-search"]', '顕微鏡');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="search-results"]');
    await expect(page.locator('[data-testid="equipment-name"]')).toContainText('顕微鏡');
  });

  test("詳細検索展開で条件項目表示", async ({ page }) => {
    // SCEN-038
    await page.goto(`${baseURL}/equipment-search`);
    await page.click('[data-testid="advanced-search-button"]');
    await expect(page.locator('[data-testid="advanced-search-area"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-conditions"]')).toBeVisible();
  });

  test("全条件組み合わせ検索実行", async ({ page }) => {
    // SCEN-039
    await page.goto(`${baseURL}/equipment-search`);
    await page.fill('[data-testid="keyword-search"]', '分析');
    await page.selectOption('[data-testid="research-field"]', '化学');
    await page.check('[data-testid="category-analyzer"]');
    await page.fill('[data-testid="budget-limit"]', '100000');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test("研究分野未選択で検索実行", async ({ page }) => {
    // SCEN-040
    await page.goto(`${baseURL}/equipment-search`);
    await page.fill('[data-testid="equipment-name"]', 'テスト機器');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('研究分野を選択してください');
  });

  test("カテゴリ未選択で検索エラー", async ({ page }) => {
    // SCEN-041
    await page.goto(`${baseURL}/equipment-search`);
    await page.fill('[data-testid="keyword-search"]', 'テスト');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('カテゴリを選択してください');
  });

  test("測定項目空欄で検索実行", async ({ page }) => {
    // SCEN-042
    await page.goto(`${baseURL}/equipment-search`);
    await page.check('[data-testid="category-analyzer"]');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('測定項目は必須入力です');
  });

  test("サンプル種別未選択で検索", async ({ page }) => {
    // SCEN-043
    await page.goto(`${baseURL}/equipment-search`);
    await page.fill('[data-testid="equipment-name"]', 'テスト機器');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('サンプル種別を選択してください');
  });

  test("測定精度要件無効値入力", async ({ page }) => {
    // SCEN-044
    await page.goto(`${baseURL}/equipment-search`);
    await page.fill('[data-testid="measurement-accuracy"]', '-0.01');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await page.fill('[data-testid="measurement-accuracy"]', 'abc');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="measurement-accuracy"]')).toHaveClass(/error/);
  });

  test("利用日時過去日選択エラー", async ({ page }) => {
    // SCEN-045
    await page.goto(`${baseURL}/equipment-search`);
    await page.click('[data-testid="search-button"]');
    await page.click('[data-testid="equipment-item"]:first-of-type');
    await page.click('[data-testid="reserve-button"]');
    await page.fill('[data-testid="date-picker"]', '2020-01-01');
    await page.click('[data-testid="confirm-reservation"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('過去の日付は選択できません');
  });

  test("利用時間長異常値設定", async ({ page }) => {
    // SCEN-046
    await page.goto(`${baseURL}/equipment-search`);
    await page.fill('[data-testid="duration-input"]', '-5');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await page.fill('[data-testid="duration-input"]', '99999');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test("予算上限負の値入力エラー", async ({ page }) => {
    // SCEN-047
    await page.goto(`${baseURL}/equipment-search`);
    await page.fill('[data-testid="budget-limit"]', '-10000');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('予算上限は正の値を入力してください');
  });

  test("所在地未選択で検索実行", async ({ page }) => {
    // SCEN-048
    await page.goto(`${baseURL}/equipment-search`);
    await page.fill('[data-testid="equipment-name"]', 'テスト機器');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('所在地を選択してください');
  });

  test("特殊文字キーワード検索エラー", async ({ page }) => {
    // SCEN-049
    await page.goto(`${baseURL}/equipment-search`);
    await page.fill('[data-testid="keyword-search"]', '<script>');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page).not.toHaveURL(/.*script.*/);
  });

  test("検索条件全項目空欄実行", async ({ page }) => {
    // SCEN-050
    await page.goto(`${baseURL}/equipment-search`);
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('検索条件を入力してください');
  });

  test("測定項目最大文字数入力", async ({ page }) => {
    // SCEN-051
    await page.goto(`${baseURL}/equipment-search`);
    const maxText = 'a'.repeat(255);
    await page.fill('[data-testid="measurement-item"]', maxText);
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test("測定精度要件境界値入力", async ({ page }) => {
    // SCEN-052
    await page.goto(`${baseURL}/equipment-search`);
    await page.fill('[data-testid="accuracy-min"]', '0.001');
    await page.fill('[data-testid="accuracy-max"]', '999.999');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await page.fill('[data-testid="accuracy-min"]', '-1');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test("利用日時最遠未来日選択", async ({ page }) => {
    // SCEN-053
    await page.goto(`${baseURL}/equipment-search`);
    await page.fill('[data-testid="date-picker"]', '2025-12-31');
    await page.selectOption('[data-testid="time-slot"]', '10:00');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"], [data-testid="no-results"]')).toBeVisible();
  });

  test("利用時間長最大値設定", async ({ page }) => {
    // SCEN-054
    await page.goto(`${baseURL}/equipment-search`);
    await page.fill('[data-testid="duration-input"]', '999');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await page.fill('[data-testid="duration-input"]', '9999');
    await page.blur('[data-testid="duration-input"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test("予算上限最大値入力", async ({ page }) => {
    // SCEN-055
    await page.goto(`${baseURL}/equipment-search`);
    await page.fill('[data-testid="budget-limit"]', '999999999');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test("キーワード最大文字数検索", async ({ page }) => {
    // SCEN-056
    await page.goto(`${baseURL}/equipment-search`);
    const maxKeyword = 'a'.repeat(255);
    await page.fill('[data-testid="keyword-search"]', maxKeyword);
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    const overMaxKeyword = 'a'.repeat(256);
    await page.fill('[data-testid="keyword-search"]', overMaxKeyword);
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test("全カテゴリ同時選択検索", async ({ page }) => {
    // SCEN-057
    await page.goto(`${baseURL}/equipment-search`);
    await page.check('[data-testid="category-microscope"]');
    await page.check('[data-testid="category-analyzer"]');
    await page.check('[data-testid="category-measuring"]');
    await page.click('[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="search-results"]');
    await expect(page.locator('[data-testid="equipment-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="pagination"]')).toBeVisible();
  });

  test("利用時間長最小値設定", async ({ page }) => {
    // SCEN-058
    await page.goto(`${baseURL}/equipment-search`);
    await page.fill('[data-testid="duration-input"]', '15');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await page.fill('[data-testid="duration-input"]', '10');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test("予算上限最小値入力", async ({ page }) => {
    // SCEN-059
    await page.goto(`${baseURL}/equipment-search`);
    await page.fill('[data-testid="budget-limit"]', '1');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });
});