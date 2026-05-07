import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

describe("緊急通知送信機能", () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[name="username"]', 'admin');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test("全項目入力で緊急通知送信成功", async ({ page }) => {
    // SCEN-303
    await page.click('text=緊急通知送信');
    await page.fill('[name="title"]', '【緊急】機器メンテナンス実施のお知らせ');
    await page.fill('[name="content"]', '緊急通知の詳細メッセージです');
    await page.selectOption('[name="target"]', '全ユーザー');
    await page.selectOption('[name="priority"]', '高');
    await page.fill('[name="scheduledDateTime"]', '2024-01-01T12:00');
    await page.click('button:has-text("送信")');
    await page.click('button:has-text("OK")');
    await expect(page.locator('text=送信完了')).toBeVisible();
  });

  test("機器故障通知で対象者自動抽出", async ({ page }) => {
    // SCEN-304
    await page.click('text=機器管理');
    await page.click('[data-testid="equipment-select"]');
    await page.click('text=緊急通知送信');
    await page.selectOption('[name="notificationType"]', '機器故障');
    await page.fill('[name="faultContent"]', '故障内容と影響範囲');
    await page.click('button:has-text("対象者自動抽出")');
    await page.click('button:has-text("送信")');
    await expect(page.locator('text=送信完了')).toBeVisible();
  });

  test("システム障害通知でメール送信", async ({ page }) => {
    // SCEN-305
    await page.click('text=システム管理');
    await page.click('text=緊急通知機能');
    await page.selectOption('[name="notificationType"]', 'システム障害');
    await page.selectOption('[name="target"]', '全ユーザー');
    await page.fill('[name="subject"]', '【緊急】システム障害のお知らせ');
    await page.fill('[name="body"]', 'システム障害の詳細情報');
    await page.click('button:has-text("送信")');
    await page.click('button:has-text("OK")');
    await expect(page.locator('text=送信完了')).toBeVisible();
  });

  test("緊急度高で複数通知方法選択", async ({ page }) => {
    // SCEN-306
    await page.click('text=緊急通知');
    await page.selectOption('[name="priority"]', '高');
    await page.check('[name="notificationMethod"][value="メール"]');
    await page.check('[name="notificationMethod"][value="SMS"]');
    await page.check('[name="notificationMethod"][value="システム内通知"]');
    await page.fill('[name="title"]', '【緊急】機器メンテナンスのお知らせ');
    await page.fill('[name="content"]', '緊急性の高い内容');
    await page.selectOption('[name="target"]', '全ユーザー');
    await page.click('button:has-text("送信")');
    await page.click('button:has-text("OK")');
    await expect(page.locator('text=送信完了')).toBeVisible();
  });

  test("代替機器提案付き通知送信", async ({ page }) => {
    // SCEN-307
    await page.click('text=緊急通知送信');
    await page.fill('[name="title"]', '機器故障による代替機器のご案内');
    await page.fill('[name="content"]', '代替機器をご提案します');
    await page.check('[name="includeAlternative"]');
    await page.selectOption('[name="target"]', '全ユーザー');
    await page.click('button:has-text("送信")');
    await expect(page.locator('text=送信完了')).toBeVisible();
  });

  test("添付ファイル付き緊急通知", async ({ page }) => {
    // SCEN-308
    await page.click('text=緊急通知送信');
    await page.fill('[name="subject"]', '【緊急】機器メンテナンスのお知らせ');
    await page.fill('[name="body"]', '緊急通知内容');
    await page.setInputFiles('[name="attachment"]', 'maintenance.pdf');
    await page.selectOption('[name="target"]', '全ユーザー');
    await page.click('button:has-text("送信")');
    await page.click('text=送信する');
    await expect(page.locator('text=送信完了')).toBeVisible();
  });

  test("通知種別未選択でエラー表示", async ({ page }) => {
    // SCEN-309
    await page.click('text=緊急通知送信');
    await page.fill('[name="title"]', '緊急メンテナンスのお知らせ');
    await page.fill('[name="content"]', 'システムメンテナンスを実施します');
    await page.selectOption('[name="target"]', '全ユーザー');
    await page.click('button:has-text("送信")');
    await expect(page.locator('text=通知種別を選択してください')).toBeVisible();
  });

  test("対象機器未選択でバリデーション", async ({ page }) => {
    // SCEN-310
    await page.click('text=緊急通知送信');
    await page.fill('[name="title"]', '緊急メンテナンス通知');
    await page.fill('[name="content"]', 'システムメンテナンスのため一時停止します');
    await page.click('button:has-text("送信")');
    await expect(page.locator('text=対象機器を選択してください')).toBeVisible();
  });

  test("通知タイトル空欄でエラー", async ({ page }) => {
    // SCEN-311
    await page.click('text=緊急通知送信');
    await page.fill('[name="content"]', '適切な緊急通知メッセージ');
    await page.selectOption('[name="target"]', '全ユーザー');
    await page.click('button:has-text("送信")');
    await expect(page.locator('text=通知タイトルを入力してください')).toBeVisible();
  });

  test("詳細内容未入力でバリデーション", async ({ page }) => {
    // SCEN-312
    await page.click('text=緊急通知送信');
    await page.fill('[name="title"]', '緊急メンテナンス');
    await page.selectOption('[name="target"]', '全ユーザー');
    await page.click('button:has-text("送信")');
    await expect(page.locator('text=詳細内容は必須項目です')).toBeVisible();
  });

  test("発生日時未入力でエラー表示", async ({ page }) => {
    // SCEN-313
    await page.click('text=緊急通知');
    await page.click('text=新規通知作成');
    await page.fill('[name="title"]', 'システムメンテナンス');
    await page.fill('[name="content"]', '緊急メンテナンスを実施します');
    await page.click('button:has-text("送信")');
    await expect(page.locator('text=発生日時を入力してください')).toBeVisible();
  });

  test("通知方法未選択でバリデーション", async ({ page }) => {
    // SCEN-314
    await page.click('text=緊急通知送信');
    await page.fill('[name="title"]', '【緊急】システムメンテナンスのお知らせ');
    await page.fill('[name="content"]', '本日21:00-23:00の間、システムメンテナンスを実施します');
    await page.selectOption('[name="target"]', '全ユーザー');
    await page.click('button:has-text("送信")');
    await expect(page.locator('text=通知方法を1つ以上選択してください')).toBeVisible();
  });

  test("過去日時入力でエラー表示", async ({ page }) => {
    // SCEN-315
    await page.click('text=緊急通知送信');
    await page.fill('[name="title"]', '緊急メンテナンス');
    await page.fill('[name="content"]', 'システムメンテナンスのお知らせ');
    await page.fill('[name="scheduledDateTime"]', '2020-01-01T12:00');
    await page.click('button:has-text("送信")');
    await expect(page.locator('text=送信日時は現在時刻以降を指定してください')).toBeVisible();
  });

  test("復旧予定が発生前でエラー", async ({ page }) => {
    // SCEN-316
    await page.click('text=緊急通知送信');
    await page.fill('[name="occurrenceTime"]', '2024-01-01T12:00');
    await page.fill('[name="recoveryTime"]', '2024-01-01T11:00');
    await page.fill('[name="content"]', '通知内容');
    await page.click('button:has-text("送信")');
    await expect(page.locator('text=復旧予定時刻が発生時刻より前に設定されています')).toBeVisible();
  });

  test("上限超過ファイルでアップロードエラー", async ({ page }) => {
    // SCEN-317
    await page.click('text=緊急通知送信');
    await page.fill('[name="title"]', 'テスト通知');
    await page.fill('[name="content"]', 'テスト内容');
    await page.setInputFiles('[name="file"]', 'large_file_11mb.pdf');
    await page.click('button:has-text("アップロード")');
    await expect(page.locator('text=ファイルサイズ上限超過')).toBeVisible();
  });

  test("通知タイトル文字数上限", async ({ page }) => {
    // SCEN-318
    await page.click('text=緊急通知送信');
    const maxLengthTitle = 'a'.repeat(100);
    await page.fill('[name="title"]', maxLengthTitle);
    await page.fill('[name="content"]', '適切な内容');
    await page.selectOption('[name="target"]', '全ユーザー');
    await page.click('button:has-text("送信")');
    await expect(page.locator('text=送信完了')).toBeVisible();
    
    const overLengthTitle = 'a'.repeat(101);
    await page.fill('[name="title"]', overLengthTitle);
    await page.click('button:has-text("送信")');
    await expect(page.locator('text=文字数上限を超えています')).toBeVisible();
  });

  test("詳細内容最大文字数入力", async ({ page }) => {
    // SCEN-319
    await page.click('text=緊急通知送信');
    await page.fill('[name="title"]', '緊急メンテナンス通知');
    const maxContent = 'a'.repeat(2000);
    await page.fill('[name="content"]', maxContent);
    await expect(page.locator('text=2000')).toBeVisible();
    
    const overContent = 'a'.repeat(2001);
    await page.fill('[name="content"]', overContent);
    await page.click('button:has-text("送信")');
    await expect(page.locator('text=文字数制限')).toBeVisible();
  });

  test("添付ファイル最大サイズ", async ({ page }) => {
    // SCEN-320
    await page.click('text=緊急通知送信');
    await page.fill('[name="title"]', '緊急メンテナンス通知');
    await page.fill('[name="body"]', 'システムメンテナンスのため一時的にサービスを停止します');
    await page.setInputFiles('[name="attachment"]', 'large_file_11mb.pdf');
    await page.click('button:has-text("送信")');
    await expect(page.locator('text=添付ファイルのサイズが上限（10MB）を超えています')).toBeVisible();
  });

  test("全機器選択で大量対象者抽出", async ({ page }) => {
    // SCEN-321
    await page.click('text=緊急通知送信');
    await page.check('[name="selectAllEquipment"]');
    await page.fill('[name="content"]', '緊急メンテナンスのため全機器を一時停止します');
    await page.click('button:has-text("対象者プレビュー")');
    await expect(page.locator('text=1000人以上')).toBeVisible();
    await page.click('button:has-text("送信")');
    await page.click('button:has-text("はい")');
    await expect(page.locator('text=送信完了')).toBeVisible();
  });

  test("最小入力項目のみで送信", async ({ page }) => {
    // SCEN-322
    await page.click('text=緊急通知');
    await page.click('text=新規緊急通知');
    await page.fill('[name="title"]', '緊急');
    await page.fill('[name="content"]', 'テスト');
    await page.selectOption('[name="target"]', '全ユーザー');
    await page.click('button:has-text("送信")');
    await page.click('button:has-text("OK")');
    await expect(page.locator('text=送信完了')).toBeVisible();
  });

  test("緊急度最高レベルでの送信", async ({ page }) => {
    // SCEN-323
    await page.click('text=緊急通知管理');
    await page.click('text=新規通知作成');
    await page.selectOption('[name="priority"]', '最高');
    await page.fill('[name="title"]', '【緊急】システム緊急メンテナンス実施');
    await page.fill('[name="body"]', '緊急事項の詳細');
    await page.selectOption('[name="target"]', '全ユーザー');
    await page.check('[name="sendImmediately"]');
    await page.click('button:has-text("送信実行")');
    await expect(page.locator('text=送信完了')).toBeVisible();
    
    await page.goto(`${BASE_URL}/logout`);
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[name="username"]', 'user');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page.locator('.emergency-banner').first()).toBeVisible();
  });

  test("復旧予定未定での通知送信", async ({ page }) => {
    // SCEN-324
    await page.click('text=緊急通知管理');
    await page.click('text=新規緊急通知作成');
    await page.fill('[name="title"]', '機器システム障害発生');
    await page.fill('[name="content"]', '現在システム障害により一部機器が利用できません');
    await page.selectOption('[name="recoverySchedule"]', '未定');
    await page.selectOption('[name="target"]', '全ユーザー');
    await page.click('button:has-text("プレビュー")');
    await page.click('button:has-text("送信")');
    await page.click('button:has-text("はい")');
    await expect(page.locator('text=通知送信完了')).toBeVisible();
    
    await page.goto(`${BASE_URL}/logout`);
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[name="username"]', 'user');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=復旧予定：未定')).toBeVisible();
  });

});