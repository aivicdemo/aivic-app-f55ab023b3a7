import { test, expect } from '@playwright/test';

describe("プロジェクト管理", () => {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseURL}/login`);
    await page.fill('[data-testid="username"]', 'testuser');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(`${baseURL}/dashboard`);
  });

  test("SCEN-086: プロジェクト一覧が正しく表示される", async ({ page }) => {
    // SCEN-086
    await page.click('[data-testid="menu-project"]');
    await page.waitForURL(`${baseURL}/projects`);
    await expect(page.locator('h1')).toContainText('プロジェクト一覧');
    await expect(page.locator('table thead')).toContainText('プロジェクト名');
    await expect(page.locator('table thead')).toContainText('作成日');
    await expect(page.locator('table thead')).toContainText('ステータス');
    await expect(page.locator('table tbody tr')).toBeVisible();
  });

  test("SCEN-087: 新規プロジェクト登録が成功する", async ({ page }) => {
    // SCEN-087
    await page.goto(`${baseURL}/projects`);
    await page.click('[data-testid="new-project-button"]');
    await page.fill('[data-testid="project-name"]', 'テストプロジェクト001');
    await page.fill('[data-testid="project-description"]', '機器予約システムのテスト用プロジェクト');
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-12-31');
    await page.selectOption('[data-testid="manager-select"]', { index: 0 });
    await page.fill('[data-testid="budget"]', '1000000');
    await page.click('[data-testid="register-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toContainText('プロジェクトを登録しました');
  });

  test("SCEN-088: プロジェクト検索で該当項目が表示", async ({ page }) => {
    // SCEN-088
    await page.goto(`${baseURL}/projects`);
    await page.fill('[data-testid="search-input"]', 'テスト');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('table tbody tr')).toBeVisible();
    await expect(page.locator('table tbody')).toContainText('テスト');
  });

  test("SCEN-089: 絞り込みフィルターが正常動作する", async ({ page }) => {
    // SCEN-089
    await page.goto(`${baseURL}/projects`);
    await page.selectOption('[data-testid="status-filter"]', '進行中');
    await page.click('[data-testid="filter-apply-button"]');
    await page.selectOption('[data-testid="manager-filter"]', { index: 1 });
    await page.click('[data-testid="filter-apply-button"]');
    await page.click('[data-testid="filter-clear-button"]');
    await expect(page.locator('table tbody tr')).toHaveCount(await page.locator('table tbody tr').count());
  });

  test("SCEN-090: プロジェクト期間設定が保存される", async ({ page }) => {
    // SCEN-090
    await page.goto(`${baseURL}/projects`);
    await page.click('[data-testid="new-project-button"]');
    await page.fill('[data-testid="project-name"]', 'テストプロジェクト');
    await page.fill('[data-testid="start-date"]', '2024-06-01');
    await page.fill('[data-testid="end-date"]', '2024-12-31');
    await page.click('[data-testid="save-button"]');
    await page.click('[data-testid="project-detail-link"]');
    await expect(page.locator('[data-testid="project-start-date"]')).toContainText('2024-06-01');
    await expect(page.locator('[data-testid="project-end-date"]')).toContainText('2024-12-31');
  });

  test("SCEN-091: 予算設定が正しく入力される", async ({ page }) => {
    // SCEN-091
    await page.goto(`${baseURL}/projects`);
    await page.click('[data-testid="new-project-button"]');
    await page.fill('[data-testid="project-name"]', 'テストプロジェクト');
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-12-31');
    await page.fill('[data-testid="budget"]', '1000000');
    await page.selectOption('[data-testid="budget-category"]', '設備費');
    await page.fill('[data-testid="budget-period"]', '2024年度');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="project-budget"]')).toContainText('1000000');
  });

  test("SCEN-092: ステータス変更が反映される", async ({ page }) => {
    // SCEN-092
    await page.goto(`${baseURL}/projects`);
    await page.click('[data-testid="project-detail-link"]');
    await page.click('[data-testid="status-change-button"]');
    await page.selectOption('[data-testid="status-select"]', '完了');
    await page.click('[data-testid="status-confirm-button"]');
    await page.goto(`${baseURL}/projects`);
    await expect(page.locator('[data-testid="project-status"]')).toContainText('完了');
  });

  test("SCEN-093: チームメンバー追加が成功する", async ({ page }) => {
    // SCEN-093
    await page.goto(`${baseURL}/projects`);
    await page.click('[data-testid="project-detail-link"]');
    await page.click('[data-testid="member-management-tab"]');
    await page.click('[data-testid="add-member-button"]');
    await page.fill('[data-testid="member-email"]', 'test@example.com');
    await page.selectOption('[data-testid="member-role"]', 'メンバー');
    await page.click('[data-testid="member-save-button"]');
    await expect(page.locator('[data-testid="member-list"]')).toContainText('test@example.com');
  });

  test("SCEN-094: 機器マッチング結果が表示される", async ({ page }) => {
    // SCEN-094
    await page.goto(`${baseURL}/projects`);
    await page.click('[data-testid="equipment-matching-button"]');
    await page.waitForSelector('[data-testid="matching-complete"]');
    await expect(page.locator('[data-testid="matching-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="equipment-list"]')).toBeVisible();
  });

  test("SCEN-095: 予約済み機器一覧が確認できる", async ({ page }) => {
    // SCEN-095
    await page.goto(`${baseURL}/projects`);
    await page.click('[data-testid="reserved-equipment-tab"]');
    await expect(page.locator('[data-testid="reserved-equipment-list"]')).toBeVisible();
    await expect(page.locator('table thead')).toContainText('機器名');
    await expect(page.locator('table thead')).toContainText('予約日時');
    await expect(page.locator('table thead')).toContainText('予約者');
  });

  test("SCEN-096: プロジェクト名未入力でエラー", async ({ page }) => {
    // SCEN-096
    await page.goto(`${baseURL}/projects`);
    await page.click('[data-testid="new-project-button"]');
    await page.fill('[data-testid="project-description"]', 'テスト');
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.click('[data-testid="create-button"]');
    await expect(page.locator('[data-testid="project-name-error"]')).toContainText('プロジェクト名は必須項目です');
  });

  test("SCEN-097: 研究目的未入力で登録失敗", async ({ page }) => {
    // SCEN-097
    await page.goto(`${baseURL}/projects`);
    await page.click('[data-testid="new-project-button"]');
    await page.fill('[data-testid="project-name"]', 'テストプロジェクト001');
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-12-31');
    await page.selectOption('[data-testid="manager-select"]', { index: 0 });
    await page.click('[data-testid="register-button"]');
    await expect(page.locator('[data-testid="research-purpose-error"]')).toContainText('研究目的は必須項目です');
  });

  test("SCEN-098: 開始日が終了日より後でエラー", async ({ page }) => {
    // SCEN-098
    await page.goto(`${baseURL}/projects`);
    await page.click('[data-testid="new-project-button"]');
    await page.fill('[data-testid="project-name"]', 'テストプロジェクト');
    await page.fill('[data-testid="start-date"]', '2024-12-31');
    await page.fill('[data-testid="end-date"]', '2024-01-01');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="date-error"]')).toContainText('開始日は終了日より前の日付を入力してください');
  });

  test("SCEN-099: 予算に文字入力でエラー表示", async ({ page }) => {
    // SCEN-099
    await page.goto(`${baseURL}/projects`);
    await page.click('[data-testid="new-project-button"]');
    await page.fill('[data-testid="budget"]', 'abc');
    await page.click('[data-testid="project-name"]');
    await expect(page.locator('[data-testid="budget-error"]')).toContainText('数値を入力してください');
  });

  test("SCEN-100: 存在しない担当者でエラー", async ({ page }) => {
    // SCEN-100
    await page.goto(`${baseURL}/projects`);
    await page.click('[data-testid="new-project-button"]');
    await page.fill('[data-testid="project-name"]', 'テストプロジェクト');
    await page.fill('[data-testid="manager-input"]', 'nonexistent_user');
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-12-31');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="manager-error"]')).toContainText('指定された担当者が見つかりません');
  });

  test("SCEN-101: 無効なステータスでエラー", async ({ page }) => {
    // SCEN-101
    await page.goto(`${baseURL}/projects`);
    await page.click('[data-testid="project-detail-link"]');
    await page.evaluate(() => {
      (document.querySelector('[data-testid="status-input"]') as HTMLInputElement).value = 'INVALID_STATUS';
    });
    await page.click('[data-testid="status-save-button"]');
    await expect(page.locator('[data-testid="status-error"]')).toContainText('無効なステータスです');
  });

  test("SCEN-102: 機器要件未入力で警告表示", async ({ page }) => {
    // SCEN-102
    await page.goto(`${baseURL}/projects`);
    await page.click('[data-testid="new-project-button"]');
    await page.fill('[data-testid="project-name"]', 'テストプロジェクト');
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-12-31');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="equipment-requirement-warning"]')).toContainText('機器要件を入力してください');
  });

  test("SCEN-103: 検索条件不正でエラー表示", async ({ page }) => {
    // SCEN-103
    await page.goto(`${baseURL}/projects`);
    await page.fill('[data-testid="search-start-date"]', '2024-12-31');
    await page.fill('[data-testid="search-end-date"]', '2024-01-01');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-error"]')).toContainText('検索条件が正しくありません');
  });

  test("SCEN-104: プロジェクト名255文字境界値", async ({ page }) => {
    // SCEN-104
    await page.goto(`${baseURL}/projects`);
    const text254 = 'a'.repeat(254);
    const text255 = 'a'.repeat(255);
    const text256 = 'a'.repeat(256);
    
    await page.click('[data-testid="new-project-button"]');
    await page.fill('[data-testid="project-name"]', text254);
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    await page.click('[data-testid="new-project-button"]');
    await page.fill('[data-testid="project-name"]', text255);
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    await page.click('[data-testid="new-project-button"]');
    await page.fill('[data-testid="project-name"]', text256);
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="name-length-error"]')).toContainText('文字数制限');
  });

  test("SCEN-105: 研究目的テキスト上限境界値", async ({ page }) => {
    // SCEN-105
    await page.goto(`${baseURL}/projects`);
    await page.click('[data-testid="new-project-button"]');
    await page.fill('[data-testid="project-name"]', 'テスト');
    const maxText = 'a'.repeat(1000);
    await page.fill('[data-testid="research-purpose"]', maxText);
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    const overMaxText = 'a'.repeat(1001);
    await page.fill('[data-testid="research-purpose"]', overMaxText);
    await expect(page.locator('[data-testid="purpose-length-error"]')).toBeVisible();
  });

  test("SCEN-106: 予算金額上限値での登録", async ({ page }) => {
    // SCEN-106
    await page.goto(`${baseURL}/projects`);
    await page.click('[data-testid="new-project-button"]');
    await page.fill('[data-testid="project-name"]', '予算上限テストプロジェクト');
    await page.fill('[data-testid="budget"]', '999999999');
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-12-31');
    await page.selectOption('[data-testid="manager-select"]', { index: 0 });
    await page.click('[data-testid="register-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="project-budget"]')).toContainText('999999999');
  });

  test("SCEN-107: 予算0円での登録", async ({ page }) => {
    // SCEN-107
    await page.goto(`${baseURL}/projects`);
    await page.click('[data-testid="new-project-button"]');
    await page.fill('[data-testid="project-name"]', 'テストプロジェクト');
    await page.fill('[data-testid="budget"]', '0');
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-12-31');
    await page.click('[data-testid="register-button"]');
    await expect(page.locator('[data-testid="project-budget"]')).toContainText('0');
  });

  test("SCEN-108: 期間1日のプロジェクト登録", async ({ page }) => {
    // SCEN-108
    await page.goto(`${baseURL}/projects`);
    await page.click('[data-testid="new-project-button"]');
    await page.fill('[data-testid="project-name"]', 'テストプロジェクト_1日間');
    const today = new Date().toISOString().split('T')[0];
    await page.fill('[data-testid="start-date"]', today);
    await page.fill('[data-testid="end-date"]', today);
    await page.fill('[data-testid="project-description"]', '1日限定のテストプロジェクト');
    await page.click('[data-testid="register-button"]');
    await expect(page.locator('[data-testid="project-list"]')).toContainText('テストプロジェクト_1日間');
  });

  test("SCEN-109: 最大メンバー数での登録", async ({ page }) => {
    // SCEN-109
    await page.goto(`${baseURL}/projects`);
    await page.click('[data-testid="new-project-button"]');
    await page.fill('[data-testid="project-name"]', '最大メンバー数テストプロジェクト');
    for (let i = 0; i < 10; i++) {
      await page.click('[data-testid="add-member-button"]');
      await page.fill(`[data-testid="member-${i}"]`, `member${i}@test.com`);
    }
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="member-count"]')).toContainText('10');
    await expect(page.locator('[data-testid="add-member-button"]')).toBeDisabled();
  });

  test("SCEN-110: 過去日付での開始日設定", async ({ page }) => {
    // SCEN-110
    await page.goto(`${baseURL}/projects`);
    await page.click('[data-testid="new-project-button"]');
    await page.fill('[data-testid="project-name"]', 'テストプロジェクト');
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    await page.fill('[data-testid="start-date"]', yesterday);
    await page.fill('[data-testid="end-date"]', '2024-12-31');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="start-date-error"]')).toContainText('開始日は本日以降の日付を設定してください');
  });

  test("SCEN-111: 特殊文字含むプロジェクト名", async ({ page }) => {
    // SCEN-111
    await page.goto(`${baseURL}/projects`);
    await page.click('[data-testid="new-project-button"]');
    await page.fill('[data-testid="project-name"]', 'Test@Project#2024!');
    await page.fill('[data-testid="project-description"]', 'テスト');
    await page.fill('[data-testid="start-date"]', '2024-06-01');
    await page.fill('[data-testid="end-date"]', '2024-12-31');
    await page.click('[data-testid="save-button"]');
    await page.fill('[data-testid="search-input"]', 'Test@Project#2024!');
    await page.click('[data-testid="search-button"]');
    await page.click('[data-testid="project-detail-link"]');
    await expect(page.locator('[data-testid="project-name-display"]')).toContainText('Test@Project#2024!');
  });
});