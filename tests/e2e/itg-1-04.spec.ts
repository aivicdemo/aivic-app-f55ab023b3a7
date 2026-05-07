import { test, expect } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

describe("プロジェクト管理", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseURL}/login`);
    await page.fill('[name="username"]', 'testuser');
    await page.fill('[name="password"]', 'password');
    await page.click('[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('プロジェクト一覧が正しく表示される', async ({ page }) => {
    // SCEN-086
    await page.click('text=プロジェクト管理');
    await page.waitForURL('**/projects');
    await expect(page.locator('h1')).toContainText('プロジェクト一覧');
    await expect(page.locator('table thead')).toContainText('プロジェクト名');
    await expect(page.locator('table thead')).toContainText('作成日');
    await expect(page.locator('table thead')).toContainText('ステータス');
    await expect(page.locator('table tbody tr')).toHaveCount({ min: 1 });
  });

  test('新規プロジェクト登録が成功する', async ({ page }) => {
    // SCEN-087
    await page.click('text=プロジェクト管理');
    await page.click('text=新規プロジェクト登録');
    await page.fill('[name="name"]', 'テストプロジェクト001');
    await page.fill('[name="description"]', '機器予約システムのテスト用プロジェクト');
    await page.fill('[name="startDate"]', '2024-01-01');
    await page.fill('[name="endDate"]', '2024-12-31');
    await page.selectOption('[name="manager"]', { index: 0 });
    await page.fill('[name="budget"]', '1000000');
    await page.click('text=登録');
    await expect(page.locator('text=プロジェクトを登録しました')).toBeVisible();
  });

  test('プロジェクト検索で該当項目が表示', async ({ page }) => {
    // SCEN-088
    await page.click('text=プロジェクト管理');
    await page.fill('[name="search"]', 'テストプロジェクト');
    await page.click('text=検索');
    await expect(page.locator('table tbody tr')).toHaveCount({ min: 1 });
    await expect(page.locator('table tbody')).toContainText('テストプロジェクト');
  });

  test('絞り込みフィルターが正常動作する', async ({ page }) => {
    // SCEN-089
    await page.click('text=プロジェクト管理');
    await page.selectOption('[name="statusFilter"]', '進行中');
    await page.click('text=フィルター適用');
    await page.selectOption('[name="managerFilter"]', { index: 1 });
    await page.click('text=フィルター適用');
    await page.click('text=フィルタークリア');
    await expect(page.locator('table tbody tr')).toHaveCount({ min: 1 });
  });

  test('プロジェクト期間設定が保存される', async ({ page }) => {
    // SCEN-090
    await page.click('text=プロジェクト管理');
    await page.click('text=新規プロジェクト作成');
    await page.fill('[name="name"]', 'テストプロジェクト');
    await page.fill('[name="startDate"]', '2024-02-01');
    await page.fill('[name="endDate"]', '2024-03-31');
    await page.click('text=保存');
    await page.click('text=テストプロジェクト');
    await expect(page.locator('[data-testid="startDate"]')).toContainText('2024-02-01');
    await expect(page.locator('[data-testid="endDate"]')).toContainText('2024-03-31');
  });

  test('予算設定が正しく入力される', async ({ page }) => {
    // SCEN-091
    await page.click('text=プロジェクト管理');
    await page.click('text=新規プロジェクト作成');
    await page.fill('[name="name"]', 'テストプロジェクト');
    await page.fill('[name="startDate"]', '2024-01-01');
    await page.fill('[name="endDate"]', '2024-12-31');
    await page.fill('[name="budget"]', '1000000');
    await page.selectOption('[name="budgetCategory"]', '設備費');
    await page.fill('[name="budgetPeriod"]', '12ヶ月');
    await page.click('text=保存');
    await expect(page.locator('text=予算設定が保存されました')).toBeVisible();
  });

  test('ステータス変更が反映される', async ({ page }) => {
    // SCEN-092
    await page.click('text=プロジェクト管理');
    await page.click('table tbody tr:first-child');
    await page.click('text=ステータス変更');
    await page.selectOption('[name="status"]', '完了');
    await page.click('text=変更確定');
    await page.goBack();
    await expect(page.locator('table tbody tr:first-child')).toContainText('完了');
  });

  test('チームメンバー追加が成功する', async ({ page }) => {
    // SCEN-093
    await page.click('text=プロジェクト管理');
    await page.click('table tbody tr:first-child');
    await page.click('text=メンバー管理');
    await page.click('text=メンバー追加');
    await page.fill('[name="userId"]', 'user123');
    await page.selectOption('[name="role"]', 'メンバー');
    await page.click('text=追加');
    await expect(page.locator('text=メンバーが追加されました')).toBeVisible();
    await expect(page.locator('text=user123')).toBeVisible();
  });

  test('機器マッチング結果が表示される', async ({ page }) => {
    // SCEN-094
    await page.click('text=プロジェクト管理');
    await page.click('text=機器マッチング');
    await page.waitForSelector('[data-testid="matching-results"]');
    await expect(page.locator('[data-testid="matching-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="equipment-list"]')).toHaveCount({ min: 1 });
  });

  test('予約済み機器一覧が確認できる', async ({ page }) => {
    // SCEN-095
    await page.click('text=プロジェクト管理');
    await page.click('text=予約済み機器一覧');
    await page.waitForSelector('[data-testid="reserved-equipment-list"]');
    await expect(page.locator('table thead')).toContainText('機器名');
    await expect(page.locator('table thead')).toContainText('予約日時');
    await expect(page.locator('table thead')).toContainText('予約者');
    await expect(page.locator('table tbody tr')).toHaveCount({ min: 0 });
  });

  test('プロジェクト名未入力でエラー', async ({ page }) => {
    // SCEN-096
    await page.click('text=プロジェクト管理');
    await page.click('text=新規プロジェクト作成');
    await page.fill('[name="description"]', 'テスト説明');
    await page.fill('[name="startDate"]', '2024-01-01');
    await page.click('text=作成');
    await expect(page.locator('text=プロジェクト名は必須項目です')).toBeVisible();
  });

  test('研究目的未入力で登録失敗', async ({ page }) => {
    // SCEN-097
    await page.click('text=プロジェクト管理');
    await page.click('text=新規プロジェクト作成');
    await page.fill('[name="name"]', 'テストプロジェクト001');
    await page.fill('[name="startDate"]', '2024-01-01');
    await page.fill('[name="endDate"]', '2024-12-31');
    await page.selectOption('[name="manager"]', { index: 0 });
    await page.click('text=登録');
    await expect(page.locator('text=研究目的は必須項目です')).toBeVisible();
  });

  test('開始日が終了日より後でエラー', async ({ page }) => {
    // SCEN-098
    await page.click('text=プロジェクト管理');
    await page.click('text=新規プロジェクト作成');
    await page.fill('[name="name"]', 'テストプロジェクト');
    await page.fill('[name="startDate"]', '2024-12-31');
    await page.fill('[name="endDate"]', '2024-01-01');
    await page.click('text=保存');
    await expect(page.locator('text=開始日は終了日より前の日付を入力してください')).toBeVisible();
  });

  test('予算に文字入力でエラー表示', async ({ page }) => {
    // SCEN-099
    await page.click('text=プロジェクト管理');
    await page.click('text=新規プロジェクト作成');
    await page.fill('[name="budget"]', 'abc');
    await page.click('[name="name"]');
    await expect(page.locator('text=数値を入力してください')).toBeVisible();
  });

  test('存在しない担当者でエラー', async ({ page }) => {
    // SCEN-100
    await page.click('text=プロジェクト管理');
    await page.click('text=新規プロジェクト作成');
    await page.fill('[name="name"]', 'テストプロジェクト');
    await page.fill('[name="manager"]', 'nonexistent_user');
    await page.fill('[name="startDate"]', '2024-01-01');
    await page.fill('[name="endDate"]', '2024-12-31');
    await page.click('text=保存');
    await expect(page.locator('text=指定された担当者が見つかりません')).toBeVisible();
  });

  test('無効なステータスでエラー', async ({ page }) => {
    // SCEN-101
    await page.click('text=プロジェクト管理');
    await page.click('table tbody tr:first-child');
    await page.click('text=ステータス変更');
    await page.evaluate(() => {
      const select = document.querySelector('[name="status"]') as HTMLSelectElement;
      const option = document.createElement('option');
      option.value = 'INVALID_STATUS';
      option.text = 'Invalid';
      select.add(option);
      select.value = 'INVALID_STATUS';
    });
    await page.click('text=保存');
    await expect(page.locator('text=無効なステータスです')).toBeVisible();
  });

  test('機器要件未入力で警告表示', async ({ page }) => {
    // SCEN-102
    await page.click('text=プロジェクト管理');
    await page.click('text=新規プロジェクト作成');
    await page.fill('[name="name"]', 'テストプロジェクト');
    await page.fill('[name="startDate"]', '2024-01-01');
    await page.fill('[name="endDate"]', '2024-12-31');
    await page.click('text=保存');
    await expect(page.locator('text=機器要件を入力してください')).toBeVisible();
  });

  test('検索条件不正でエラー表示', async ({ page }) => {
    // SCEN-103
    await page.click('text=プロジェクト管理');
    await page.fill('[name="startDate"]', '2024-12-31');
    await page.fill('[name="endDate"]', '2024-01-01');
    await page.click('text=検索');
    await expect(page.locator('text=検索条件が正しくありません')).toBeVisible();
  });

  test('プロジェクト名255文字境界値', async ({ page }) => {
    // SCEN-104
    const name254 = 'a'.repeat(254);
    const name255 = 'a'.repeat(255);
    const name256 = 'a'.repeat(256);
    
    await page.click('text=プロジェクト管理');
    await page.click('text=新規プロジェクト作成');
    await page.fill('[name="name"]', name254);
    await page.click('text=保存');
    await expect(page.locator('text=保存されました')).toBeVisible();
    
    await page.click('text=新規プロジェクト作成');
    await page.fill('[name="name"]', name255);
    await page.click('text=保存');
    await expect(page.locator('text=保存されました')).toBeVisible();
    
    await page.click('text=新規プロジェクト作成');
    await page.fill('[name="name"]', name256);
    await page.click('text=保存');
    await expect(page.locator('text=文字数制限エラー')).toBeVisible();
  });

  test('研究目的テキスト上限境界値', async ({ page }) => {
    // SCEN-105
    const maxText = 'a'.repeat(1000);
    const overText = 'a'.repeat(1001);
    
    await page.click('text=プロジェクト管理');
    await page.click('text=新規プロジェクト作成');
    await page.fill('[name="name"]', 'テストプロジェクト');
    await page.fill('[name="purpose"]', maxText);
    await page.click('text=保存');
    await expect(page.locator('text=保存されました')).toBeVisible();
    
    await page.click('text=新規プロジェクト作成');
    await page.fill('[name="purpose"]', overText);
    await page.click('text=保存');
    await expect(page.locator('text=文字数制限')).toBeVisible();
  });

  test('予算金額上限値での登録', async ({ page }) => {
    // SCEN-106
    await page.click('text=プロジェクト管理');
    await page.click('text=新規プロジェクト作成');
    await page.fill('[name="name"]', '予算上限テストプロジェクト');
    await page.fill('[name="budget"]', '999999999');
    await page.fill('[name="startDate"]', '2024-01-01');
    await page.fill('[name="endDate"]', '2024-12-31');
    await page.selectOption('[name="manager"]', { index: 0 });
    await page.click('text=登録');
    await expect(page.locator('text=予算上限テストプロジェクト')).toBeVisible();
  });

  test('予算0円での登録', async ({ page }) => {
    // SCEN-107
    await page.click('text=プロジェクト管理');
    await page.click('text=新規プロジェクト作成');
    await page.fill('[name="name"]', 'テストプロジェクト');
    await page.fill('[name="budget"]', '0');
    await page.fill('[name="startDate"]', '2024-01-01');
    await page.fill('[name="endDate"]', '2024-12-31');
    await page.click('text=登録');
    await expect(page.locator('text=0円')).toBeVisible();
  });

  test('期間1日のプロジェクト登録', async ({ page }) => {
    // SCEN-108
    const today = new Date().toISOString().split('T')[0];
    await page.click('text=プロジェクト管理');
    await page.click('text=新規プロジェクト作成');
    await page.fill('[name="name"]', 'テストプロジェクト_1日間');
    await page.fill('[name="startDate"]', today);
    await page.fill('[name="endDate"]', today);
    await page.fill('[name="description"]', '1日限定のテストプロジェクト');
    await page.click('text=登録');
    await expect(page.locator('text=テストプロジェクト_1日間')).toBeVisible();
  });

  test('最大メンバー数での登録', async ({ page }) => {
    // SCEN-109
    await page.click('text=プロジェクト管理');
    await page.click('text=新規プロジェクト作成');
    await page.fill('[name="name"]', '最大メンバー数テストプロジェクト');
    await page.fill('[name="description"]', 'テスト説明');
    for (let i = 0; i < 10; i++) {
      await page.click('text=メンバー追加');
      await page.fill(`[name="member${i}"]`, `user${i}`);
    }
    await page.click('text=保存');
    await expect(page.locator('text=最大メンバー数に達しました')).toBeVisible();
  });

  test('過去日付での開始日設定', async ({ page }) => {
    // SCEN-110
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const pastDate = yesterday.toISOString().split('T')[0];
    
    await page.click('text=プロジェクト管理');
    await page.click('text=新規プロジェクト作成');
    await page.fill('[name="name"]', 'テストプロジェクト');
    await page.fill('[name="startDate"]', pastDate);
    await page.fill('[name="endDate"]', '2024-12-31');
    await page.click('text=保存');
    await expect(page.locator('text=開始日は本日以降の日付を設定してください')).toBeVisible();
  });

  test('特殊文字含むプロジェクト名', async ({ page }) => {
    // SCEN-111
    await page.click('text=プロジェクト管理');
    await page.click('text=新規プロジェクト作成');
    await page.fill('[name="name"]', 'Test@Project#2024!');
    await page.fill('[name="description"]', 'テスト説明');
    await page.fill('[name="startDate"]', '2024-01-01');
    await page.fill('[name="endDate"]', '2024-12-31');
    await page.click('text=保存');
    await page.fill('[name="search"]', 'Test@Project#2024!');
    await page.click('text=検索');
    await expect(page.locator('text=Test@Project#2024!')).toBeVisible();
  });
});