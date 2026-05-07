import { test, expect } from '@playwright/test';

describe("研究内容入力画面", () => {
  const baseUrl = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseUrl}/login`);
    await page.fill('[data-testid="username"]', 'testuser');
    await page.fill('[data-testid="password"]', 'testpass');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/dashboard');
  });

  test('SCEN-157: 全項目入力で機器候補検索成功', async ({ page }) => {
    // SCEN-157
    await page.goto(`${baseUrl}/research-input`);
    await page.selectOption('[data-testid="research-field"]', '物理学');
    await page.fill('[data-testid="research-theme"]', '量子力学実験');
    await page.fill('[data-testid="experiment-detail"]', '量子もつれの測定実験');
    await page.selectOption('[data-testid="equipment-type"]', '測定機器');
    await page.fill('[data-testid="period-start"]', '2024-04-01');
    await page.fill('[data-testid="period-end"]', '2024-04-30');
    await page.selectOption('[data-testid="priority"]', '高');
    await page.fill('[data-testid="other-requirements"]', '温度制御必須');
    await page.click('[data-testid="search-equipment"]');
    await expect(page.locator('[data-testid="equipment-list"]')).toBeVisible();
  });

  test('SCEN-158: 必須項目のみで機器候補検索成功', async ({ page }) => {
    // SCEN-158
    await page.goto(`${baseUrl}/research-input`);
    await page.selectOption('[data-testid="research-field"]', '化学');
    await page.fill('[data-testid="research-purpose"]', '化合物分析');
    await page.fill('[data-testid="start-date"]', '2024-04-01');
    await page.fill('[data-testid="end-date"]', '2024-04-10');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="equipment-candidates"]')).toBeVisible();
  });

  test('SCEN-159: 複数測定項目選択で検索成功', async ({ page }) => {
    // SCEN-159
    await page.goto(`${baseUrl}/research-input`);
    await page.check('[data-testid="measurement-temperature"]');
    await page.check('[data-testid="measurement-pressure"]');
    await page.check('[data-testid="measurement-vibration"]');
    await page.fill('[data-testid="research-theme"]', '複合測定実験');
    await page.fill('[data-testid="experiment-period"]', '2024-04-01 to 2024-04-15');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test('SCEN-160: 長期利用期間設定で検索成功', async ({ page }) => {
    // SCEN-160
    await page.goto(`${baseUrl}/research-input`);
    await page.fill('[data-testid="research-info"]', '長期研究プロジェクト');
    await page.fill('[data-testid="start-date"]', '2024-04-01');
    await page.fill('[data-testid="end-date"]', '2024-12-31');
    await page.fill('[data-testid="project-title"]', '年間測定プロジェクト');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="equipment-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).not.toBeVisible();
  });

  test('SCEN-161: 高予算設定で検索成功', async ({ page }) => {
    // SCEN-161
    await page.goto(`${baseUrl}/research-input`);
    await page.fill('[data-testid="research-title"]', '高精度測定研究');
    await page.fill('[data-testid="research-overview"]', '最新機器を使用した測定');
    await page.fill('[data-testid="budget"]', '1500000');
    await page.fill('[data-testid="research-period"]', '2024-04-01 to 2024-06-30');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="equipment-results"]')).toBeVisible();
  });

  test('SCEN-162: 特殊要件記載で検索成功', async ({ page }) => {
    // SCEN-162
    await page.goto(`${baseUrl}/research-input`);
    await page.fill('[data-testid="research-basic-info"]', '特殊環境測定');
    await page.fill('[data-testid="special-requirements"]', '低温環境、特殊アタッチメント必須');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="equipment-search-results"]')).toBeVisible();
  });

  test('SCEN-163: プロジェクト名未入力でエラー', async ({ page }) => {
    // SCEN-163
    await page.goto(`${baseUrl}/research-input`);
    await page.fill('[data-testid="research-content"]', '実験内容');
    await page.fill('[data-testid="research-period"]', '2024-04-01 to 2024-04-30');
    await page.click('[data-testid="confirm-button"]');
    await expect(page.locator('[data-testid="error-project-name"]')).toBeVisible();
    await expect(page.url()).toContain('research-input');
  });

  test('SCEN-164: 研究目的未選択でエラー', async ({ page }) => {
    // SCEN-164
    await page.goto(`${baseUrl}/research-input`);
    await page.fill('[data-testid="research-title"]', '研究タイトル');
    await page.fill('[data-testid="research-detail"]', '詳細な研究内容');
    await page.fill('[data-testid="other-items"]', 'その他の項目');
    await page.click('[data-testid="next-button"]');
    await expect(page.locator('[data-testid="error-research-purpose"]')).toBeVisible();
  });

  test('SCEN-165: 実験内容未入力でエラー', async ({ page }) => {
    // SCEN-165
    await page.goto(`${baseUrl}/research-input`);
    await page.fill('[data-testid="researcher-name"]', '研究者名');
    await page.fill('[data-testid="reservation-datetime"]', '2024-04-01T10:00');
    await page.click('[data-testid="reserve-button"]');
    await expect(page.locator('[data-testid="error-experiment-content"]')).toBeVisible();
  });

  test('SCEN-166: 測定項目未選択でエラー', async ({ page }) => {
    // SCEN-166
    await page.goto(`${baseUrl}/research-input`);
    await page.fill('[data-testid="research-title"]', 'テスト研究');
    await page.fill('[data-testid="research-overview"]', '測定項目未選択のテスト');
    await page.click('[data-testid="next-button"]');
    await expect(page.locator('[data-testid="error-measurement-items"]')).toBeVisible();
  });

  test('SCEN-167: 利用期間未設定でエラー', async ({ page }) => {
    // SCEN-167
    await page.goto(`${baseUrl}/research-input`);
    await page.fill('[data-testid="research-detail"]', '研究詳細情報');
    await page.click('[data-testid="reservation-confirm"]');
    await expect(page.locator('[data-testid="error-usage-period"]')).toBeVisible();
    await expect(page.url()).toContain('research-input');
  });

  test('SCEN-168: 利用時間帯未選択でエラー', async ({ page }) => {
    // SCEN-168
    await page.goto(`${baseUrl}/research-input`);
    await page.fill('[data-testid="research-title"]', '研究タイトル');
    await page.fill('[data-testid="research-purpose"]', '研究目的');
    await page.click('[data-testid="reservation-confirm"]');
    await expect(page.locator('[data-testid="error-time-slot"]')).toBeVisible();
    await expect(page.url()).toContain('research-input');
  });

  test('SCEN-169: 無効な文字入力でエラー', async ({ page }) => {
    // SCEN-169
    await page.goto(`${baseUrl}/research-input`);
    await page.fill('[data-testid="research-content"]', '<script>alert("test")</script>');
    await page.fill('[data-testid="required-field"]', '有効な値');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="error-invalid-characters"]')).toBeVisible();
    await expect(page.url()).toContain('research-input');
  });

  test('SCEN-170: 負の数値入力でエラー', async ({ page }) => {
    // SCEN-170
    await page.goto(`${baseUrl}/research-input`);
    await page.fill('[data-testid="numeric-field"]', '-10');
    await page.fill('[data-testid="required-field"]', '適切な値');
    await page.click('[data-testid="register-button"]');
    await expect(page.locator('[data-testid="error-negative-number"]')).toBeVisible();
  });

  test('SCEN-171: 過去日付選択でエラー', async ({ page }) => {
    // SCEN-171
    await page.goto(`${baseUrl}/research-input`);
    await page.fill('[data-testid="research-basic-info"]', '基本情報');
    await page.fill('[data-testid="start-date"]', '2023-12-01');
    await page.fill('[data-testid="other-required-fields"]', '他の必須項目');
    await page.click('[data-testid="confirm-button"]');
    await expect(page.locator('[data-testid="error-past-date"]')).toBeVisible();
  });

  test('SCEN-172: プロジェクト名文字数上限', async ({ page }) => {
    // SCEN-172
    await page.goto(`${baseUrl}/research-input`);
    const maxLengthText = 'a'.repeat(100);
    const overLimitText = 'a'.repeat(101);
    await page.fill('[data-testid="project-name"]', maxLengthText);
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="error-message"]')).not.toBeVisible();
    await page.fill('[data-testid="project-name"]', overLimitText);
    await expect(page.locator('[data-testid="error-length-limit"]')).toBeVisible();
  });

  test('SCEN-173: 実験内容文字数上限', async ({ page }) => {
    // SCEN-173
    await page.goto(`${baseUrl}/research-input`);
    const maxText = 'x'.repeat(1000);
    const overText = 'x'.repeat(1001);
    await page.fill('[data-testid="experiment-content"]', maxText);
    await page.fill('[data-testid="experiment-content"]', overText);
    await expect(page.locator('[data-testid="error-character-limit"]')).toBeVisible();
  });

  test('SCEN-174: 測定対象物質文字数上限', async ({ page }) => {
    // SCEN-174
    await page.goto(`${baseUrl}/research-input`);
    const maxText = 'substance'.repeat(50);
    const overText = 'substance'.repeat(51);
    await page.fill('[data-testid="measurement-substance"]', maxText);
    await page.click('[data-testid="save-button"]');
    await page.fill('[data-testid="measurement-substance"]', overText);
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
  });

  test('SCEN-175: 測定精度最大値入力', async ({ page }) => {
    // SCEN-175
    await page.goto(`${baseUrl}/research-input`);
    await page.fill('[data-testid="measurement-precision"]', '999999999');
    await page.fill('[data-testid="required-field-1"]', '必須項目1');
    await page.fill('[data-testid="required-field-2"]', '必須項目2');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="error-message"]')).not.toBeVisible();
  });

  test('SCEN-176: サンプル数最大値入力', async ({ page }) => {
    // SCEN-176
    await page.goto(`${baseUrl}/research-input`);
    await page.fill('[data-testid="sample-count"]', '999999');
    await page.fill('[data-testid="other-required"]', '他の必須項目');
    await page.click('[data-testid="confirm-button"]');
    await expect(page.locator('[data-testid="error-message"]')).not.toBeVisible();
  });

  test('SCEN-177: 予算上限最大値入力', async ({ page }) => {
    // SCEN-177
    await page.goto(`${baseUrl}/research-input`);
    await page.fill('[data-testid="budget-limit"]', '999999999');
    await page.fill('[data-testid="project-info"]', 'プロジェクト情報');
    await page.click('[data-testid="confirm-input"]');
    await expect(page.locator('[data-testid="error-message"]')).not.toBeVisible();
  });

  test('SCEN-178: 特殊要件文字数上限', async ({ page }) => {
    // SCEN-178
    await page.goto(`${baseUrl}/research-input`);
    const maxText = 'requirement'.repeat(200);
    const overText = 'requirement'.repeat(201);
    await page.fill('[data-testid="special-requirements"]', maxText);
    await page.fill('[data-testid="special-requirements"]', overText);
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="error-character-limit"]')).toBeVisible();
  });

  test('SCEN-179: 利用期間最長設定', async ({ page }) => {
    // SCEN-179
    await page.goto(`${baseUrl}/research-input`);
    await page.fill('[data-testid="start-date"]', '2024-04-01');
    await page.fill('[data-testid="end-date"]', '2025-04-01');
    await page.fill('[data-testid="research-content-required"]', '研究内容');
    await page.click('[data-testid="confirm-button"]');
    await expect(page.locator('[data-testid="error-message"]')).not.toBeVisible();
  });

  test('SCEN-180: 当日日付選択', async ({ page }) => {
    // SCEN-180
    await page.goto(`${baseUrl}/research-input`);
    const today = new Date().toISOString().split('T')[0];
    await page.click('[data-testid="date-field"]');
    await page.fill('[data-testid="date-field"]', today);
    await page.fill('[data-testid="other-required"]', 'その他必要項目');
    await page.click('[data-testid="confirm-button"]');
    await expect(page.locator('[data-testid="error-message"]')).not.toBeVisible();
  });

  test('SCEN-181: 全測定項目選択', async ({ page }) => {
    // SCEN-181
    await page.goto(`${baseUrl}/research-input`);
    await page.click('[data-testid="select-all-measurements"]');
    await expect(page.locator('[data-testid="measurement-count"]')).toBeVisible();
    await page.fill('[data-testid="research-purpose"]', '全項目測定研究');
    await page.click('[data-testid="next-button"]');
    await expect(page.url()).not.toContain('research-input');
  });
});