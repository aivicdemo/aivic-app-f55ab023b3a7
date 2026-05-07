import { test, expect } from '@playwright/test';

describe("研究内容入力画面", () => {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseURL}/login`);
    await page.fill('#username', 'testuser');
    await page.fill('#password', 'password123');
    await page.click('#login-button');
    await page.waitForURL(/dashboard/);
  });

  test("全項目入力で機器候補検索成功", async ({ page }) => {
    // SCEN-157
    await page.goto(`${baseURL}/research-content`);
    await page.selectOption('#research-field', 'physics');
    await page.fill('#research-theme', 'レーザー測定実験');
    await page.fill('#experiment-details', '高精度レーザー測定による材料物性評価');
    await page.selectOption('#equipment-type', 'laser');
    await page.fill('#start-date', '2024-04-01');
    await page.fill('#end-date', '2024-04-30');
    await page.selectOption('#priority', 'high');
    await page.fill('#other-requirements', '特殊フィルター使用');
    await page.click('#search-equipment-button');
    await expect(page.locator('.equipment-list')).toBeVisible();
    await expect(page.locator('.equipment-item')).toContainText('機器名');
  });

  test("必須項目のみで機器候補検索成功", async ({ page }) => {
    // SCEN-158
    await page.goto(`${baseURL}/research-content`);
    await page.selectOption('#research-field', 'chemistry');
    await page.fill('#research-purpose', '化学反応分析');
    await page.fill('#start-date', '2024-04-01');
    await page.fill('#end-date', '2024-04-15');
    await page.click('#search-equipment-button');
    await expect(page.locator('.equipment-list')).toBeVisible();
    await expect(page.locator('.equipment-item')).toContainText('空き状況');
  });

  test("複数測定項目選択で検索成功", async ({ page }) => {
    // SCEN-159
    await page.goto(`${baseURL}/research-content`);
    await page.check('#measurement-temperature');
    await page.check('#measurement-pressure');
    await page.check('#measurement-vibration');
    await page.fill('#research-theme', '多項目測定実験');
    await page.fill('#start-date', '2024-04-01');
    await page.fill('#end-date', '2024-04-10');
    await page.click('#search-button');
    await expect(page.locator('.equipment-list')).toBeVisible();
  });

  test("長期利用期間設定で検索成功", async ({ page }) => {
    // SCEN-160
    await page.goto(`${baseURL}/research-content`);
    await page.fill('#research-theme', '長期観察実験');
    await page.fill('#start-date', '2024-04-01');
    await page.fill('#end-date', '2024-12-31');
    await page.selectOption('#research-field', 'biology');
    await page.click('#search-button');
    await expect(page.locator('.equipment-list')).toBeVisible();
    await expect(page.locator('.error-message')).not.toBeVisible();
  });

  test("高予算設定で検索成功", async ({ page }) => {
    // SCEN-161
    await page.goto(`${baseURL}/research-content`);
    await page.fill('#research-title', '高精度分析研究');
    await page.fill('#research-overview', '最新機器を使用した分析');
    await page.fill('#budget', '1000000');
    await page.selectOption('#research-field', 'engineering');
    await page.fill('#start-date', '2024-04-01');
    await page.fill('#end-date', '2024-06-30');
    await page.click('#search-button');
    await expect(page.locator('.equipment-list')).toBeVisible();
  });

  test("特殊要件記載で検索成功", async ({ page }) => {
    // SCEN-162
    await page.goto(`${baseURL}/research-content`);
    await page.fill('#research-title', '特殊条件実験');
    await page.selectOption('#research-field', 'physics');
    await page.fill('#start-date', '2024-04-01');
    await page.fill('#end-date', '2024-04-30');
    await page.fill('#special-requirements', '温度制御20℃±1℃、専用アタッチメント必要');
    await page.click('#search-button');
    await expect(page.locator('.equipment-list')).toBeVisible();
  });

  test("プロジェクト名未入力でエラー", async ({ page }) => {
    // SCEN-163
    await page.goto(`${baseURL}/research-content`);
    await page.fill('#research-content', '研究内容詳細');
    await page.fill('#start-date', '2024-04-01');
    await page.fill('#end-date', '2024-04-30');
    await page.click('#confirm-button');
    await expect(page.locator('.error-message')).toContainText('プロジェクト名は必須です');
  });

  test("研究目的未選択でエラー", async ({ page }) => {
    // SCEN-164
    await page.goto(`${baseURL}/research-content`);
    await page.fill('#research-title', 'テスト研究');
    await page.fill('#research-details', '研究の詳細内容');
    await page.fill('#start-date', '2024-04-01');
    await page.click('#confirm-button');
    await expect(page.locator('.error-message')).toContainText('研究目的を選択してください');
  });

  test("実験内容未入力でエラー", async ({ page }) => {
    // SCEN-165
    await page.goto(`${baseURL}/research-content`);
    await page.fill('#researcher-name', 'テスト研究者');
    await page.fill('#reservation-date', '2024-04-01');
    await page.click('#reserve-button');
    await expect(page.locator('.error-message')).toContainText('実験内容は必須です');
  });

  test("測定項目未選択でエラー", async ({ page }) => {
    // SCEN-166
    await page.goto(`${baseURL}/research-content`);
    await page.fill('#research-title', 'テスト研究');
    await page.fill('#research-overview', '測定項目未選択のテスト');
    await page.click('#next-button');
    await expect(page.locator('.error-message')).toContainText('測定項目を選択してください');
  });

  test("利用期間未設定でエラー", async ({ page }) => {
    // SCEN-167
    await page.goto(`${baseURL}/research-content`);
    await page.fill('#research-title', 'テスト研究');
    await page.fill('#research-details', '研究詳細情報');
    await page.click('#confirm-button');
    await expect(page.locator('.error-message')).toContainText('利用期間を設定してください');
  });

  test("利用時間帯未選択でエラー", async ({ page }) => {
    // SCEN-168
    await page.goto(`${baseURL}/research-content`);
    await page.fill('#research-title', 'テスト研究');
    await page.fill('#research-purpose', '研究目的');
    await page.fill('#start-date', '2024-04-01');
    await page.click('#confirm-button');
    await expect(page.locator('.error-message')).toContainText('利用時間帯を選択してください');
  });

  test("無効な文字入力でエラー", async ({ page }) => {
    // SCEN-169
    await page.goto(`${baseURL}/research-content`);
    await page.fill('#research-content', '<script>alert("test")</script>');
    await page.fill('#research-title', '有効なタイトル');
    await page.fill('#start-date', '2024-04-01');
    await page.click('#save-button');
    await expect(page.locator('.error-message')).toContainText('無効な文字が含まれています');
  });

  test("負の数値入力でエラー", async ({ page }) => {
    // SCEN-170
    await page.goto(`${baseURL}/research-content`);
    await page.fill('#budget', '-10');
    await page.fill('#research-title', 'テスト研究');
    await page.fill('#start-date', '2024-04-01');
    await page.click('#save-button');
    await expect(page.locator('.error-message')).toContainText('正の数値を入力してください');
  });

  test("過去日付選択でエラー", async ({ page }) => {
    // SCEN-171
    await page.goto(`${baseURL}/research-content`);
    await page.fill('#research-title', 'テスト研究');
    await page.fill('#start-date', '2023-01-01');
    await page.fill('#end-date', '2024-04-30');
    await page.click('#confirm-button');
    await expect(page.locator('.error-message')).toContainText('利用開始日は今日以降の日付を選択してください');
  });

  test("プロジェクト名文字数上限", async ({ page }) => {
    // SCEN-172
    await page.goto(`${baseURL}/research-content`);
    const maxLength = 'a'.repeat(100);
    const overLength = 'a'.repeat(101);
    await page.fill('#project-name', maxLength);
    await page.fill('#start-date', '2024-04-01');
    await page.click('#save-button');
    await expect(page.locator('.error-message')).not.toBeVisible();
    await page.fill('#project-name', overLength);
    await page.click('#save-button');
    await expect(page.locator('.error-message')).toContainText('文字数制限を超えています');
  });

  test("実験内容文字数上限", async ({ page }) => {
    // SCEN-173
    await page.goto(`${baseURL}/research-content`);
    const maxContent = 'a'.repeat(1000);
    const overContent = 'a'.repeat(1001);
    await page.fill('#experiment-content', maxContent);
    await expect(page.locator('#experiment-content')).toHaveValue(maxContent);
    await page.fill('#experiment-content', overContent);
    await expect(page.locator('.error-message')).toBeVisible();
  });

  test("測定対象物質文字数上限", async ({ page }) => {
    // SCEN-174
    await page.goto(`${baseURL}/research-content`);
    const maxLength = 'a'.repeat(200);
    const overLength = 'a'.repeat(201);
    await page.fill('#measurement-target', maxLength);
    await page.click('#save-button');
    await expect(page.locator('.error-message')).not.toBeVisible();
    await page.fill('#measurement-target', overLength);
    await expect(page.locator('.error-message')).toContainText('文字数制限');
  });

  test("測定精度最大値入力", async ({ page }) => {
    // SCEN-175
    await page.goto(`${baseURL}/research-content`);
    await page.fill('#measurement-precision', '999999999');
    await page.fill('#research-title', 'テスト研究');
    await page.fill('#start-date', '2024-04-01');
    await page.click('#save-button');
    await expect(page.locator('.error-message')).not.toBeVisible();
  });

  test("サンプル数最大値入力", async ({ page }) => {
    // SCEN-176
    await page.goto(`${baseURL}/research-content`);
    await page.fill('#sample-count', '9999');
    await page.fill('#research-title', 'テスト研究');
    await page.fill('#start-date', '2024-04-01');
    await page.click('#confirm-button');
    await expect(page.locator('.error-message')).not.toBeVisible();
  });

  test("予算上限最大値入力", async ({ page }) => {
    // SCEN-177
    await page.goto(`${baseURL}/research-content`);
    await page.fill('#budget-limit', '999999999');
    await page.fill('#research-title', 'テスト研究');
    await page.fill('#start-date', '2024-04-01');
    await page.click('#confirm-button');
    await expect(page.locator('.error-message')).not.toBeVisible();
  });

  test("特殊要件文字数上限", async ({ page }) => {
    // SCEN-178
    await page.goto(`${baseURL}/research-content`);
    const maxLength = 'a'.repeat(500);
    const overLength = 'a'.repeat(501);
    await page.fill('#special-requirements', maxLength);
    await page.click('#save-button');
    await expect(page.locator('.error-message')).not.toBeVisible();
    await page.fill('#special-requirements', overLength);
    await expect(page.locator('.error-message')).toBeVisible();
  });

  test("利用期間最長設定", async ({ page }) => {
    // SCEN-179
    await page.goto(`${baseURL}/research-content`);
    await page.fill('#start-date', '2024-04-01');
    await page.fill('#end-date', '2025-04-01');
    await page.fill('#research-title', 'テスト研究');
    await page.click('#confirm-button');
    await expect(page.locator('.error-message')).not.toBeVisible();
  });

  test("当日日付選択", async ({ page }) => {
    // SCEN-180
    await page.goto(`${baseURL}/research-content`);
    const today = new Date().toISOString().split('T')[0];
    await page.fill('#start-date', today);
    await page.fill('#research-title', 'テスト研究');
    await page.click('#confirm-button');
    await expect(page.locator('.error-message')).not.toBeVisible();
  });

  test("全測定項目選択", async ({ page }) => {
    // SCEN-181
    await page.goto(`${baseURL}/research-content`);
    await page.click('#select-all-measurements');
    await expect(page.locator('#measurement-temperature')).toBeChecked();
    await expect(page.locator('#measurement-pressure')).toBeChecked();
    await expect(page.locator('#measurement-vibration')).toBeChecked();
    await page.fill('#research-purpose', '全項目測定実験');
    await page.click('#next-button');
    await expect(page.locator('.error-message')).not.toBeVisible();
  });
});