import { test, expect } from '@playwright/test';

describe("緊急通知送信機能", () => {
  const baseUrl = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseUrl}/login`);
    await page.fill('[name="username"]', 'admin');
    await page.fill('[name="password"]', 'password');
    await page.click('[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test("全項目入力で緊急通知送信成功", async ({ page }) => {
    // SCEN-303
    await page.click('[data-testid="emergency-notification-menu"]');
    await page.fill('[name="title"]', '【緊急】機器メンテナンス実施のお知らせ');
    await page.fill('[name="content"]', '緊急通知の詳細メッセージ');
    await page.selectOption('[name="target"]', '全ユーザー');
    await page.selectOption('[name="priority"]', '高');
    await page.fill('[name="sendDateTime"]', '2024-01-01T10:00');
    await page.click('[data-testid="send-button"]');
    await page.click('[data-testid="confirm-ok"]');
    await expect(page.locator('.success-message')).toBeVisible();
  });

  test("機器故障通知で対象者自動抽出", async ({ page }) => {
    // SCEN-304
    await page.click('[data-testid="equipment-management"]');
    await page.click('[data-testid="select-equipment"]');
    await page.click('[data-testid="emergency-notification"]');
    await page.selectOption('[name="notificationType"]', '機器故障');
    await page.fill('[name="faultDetails"]', '故障内容と影響範囲');
    await page.click('[data-testid="auto-extract-targets"]');
    await expect(page.locator('.target-list')).toBeVisible();
    await page.click('[data-testid="send-button"]');
    await expect(page.locator('.success-message')).toBeVisible();
  });

  test("システム障害通知でメール送信", async ({ page }) => {
    // SCEN-305
    await page.click('[data-testid="system-management"]');
    await page.click('[data-testid="emergency-notification-settings"]');
    await page.selectOption('[name="notificationType"]', 'システム障害');
    await page.selectOption('[name="targets"]', '全ユーザー');
    await page.fill('[name="subject"]', '【緊急】システム障害のお知らせ');
    await page.fill('[name="body"]', 'システム障害の詳細情報');
    await page.click('[data-testid="send-button"]');
    await page.click('[data-testid="confirm-ok"]');
    await expect(page.locator('.success-message')).toBeVisible();
  });

  test("緊急度高で複数通知方法選択", async ({ page }) => {
    // SCEN-306
    await page.click('[data-testid="emergency-notification-menu"]');
    await page.selectOption('[name="priority"]', '高');
    await page.check('[name="method-email"]');
    await page.check('[name="method-sms"]');
    await page.check('[name="method-system"]');
    await page.fill('[name="title"]', '【緊急】機器メンテナンスのお知らせ');
    await page.fill('[name="content"]', '緊急性の高い内容');
    await page.selectOption('[name="target"]', '全ユーザー');
    await page.click('[data-testid="send-button"]');
    await page.click('[data-testid="confirm-ok"]');
    await expect(page.locator('.success-message')).toBeVisible();
  });

  test("代替機器提案付き通知送信", async ({ page }) => {
    // SCEN-307
    await page.click('[data-testid="emergency-notification-menu"]');
    await page.fill('[name="title"]', '代替機器のご提案');
    await page.fill('[name="content"]', '代替機器の詳細情報');
    await page.check('[name="suggest-alternative"]');
    await page.click('[data-testid="send-button"]');
    await expect(page.locator('.success-message')).toBeVisible();
  });

  test("添付ファイル付き緊急通知", async ({ page }) => {
    // SCEN-308
    await page.click('[data-testid="emergency-notification-menu"]');
    await page.fill('[name="subject"]', '【緊急】機器メンテナンスのお知らせ');
    await page.fill('[name="body"]', '緊急通知内容');
    await page.setInputFiles('[name="attachment"]', './test-files/maintenance.pdf');
    await expect(page.locator('.attachment-success')).toBeVisible();
    await page.selectOption('[name="target"]', '全ユーザー');
    await page.click('[data-testid="send-button"]');
    await page.click('[data-testid="confirm-send"]');
    await expect(page.locator('.success-message')).toBeVisible();
  });

  test("通知種別未選択でエラー表示", async ({ page }) => {
    // SCEN-309
    await page.click('[data-testid="emergency-notification-menu"]');
    await page.fill('[name="title"]', '緊急メンテナンスのお知らせ');
    await page.fill('[name="content"]', 'システムメンテナンスを実施します');
    await page.selectOption('[name="targets"]', '全ユーザー');
    await page.click('[data-testid="send-button"]');
    await expect(page.locator('.error-message')).toContainText('通知種別を選択してください');
  });

  test("対象機器未選択でバリデーション", async ({ page }) => {
    // SCEN-310
    await page.click('[data-testid="emergency-notification-menu"]');
    await page.fill('[name="title"]', '緊急メンテナンス通知');
    await page.fill('[name="content"]', 'システムメンテナンスのため一時停止します');
    await page.click('[data-testid="send-button"]');
    await expect(page.locator('.validation-error')).toContainText('対象機器を選択してください');
  });

  test("通知タイトル空欄でエラー", async ({ page }) => {
    // SCEN-311
    await page.click('[data-testid="emergency-notification-menu"]');
    await page.fill('[name="content"]', '適切な緊急通知メッセージ');
    await page.selectOption('[name="targets"]', '全ユーザー');
    await page.click('[data-testid="send-button"]');
    await expect(page.locator('.error-message')).toContainText('通知タイトルを入力してください');
  });

  test("詳細内容未入力でバリデーション", async ({ page }) => {
    // SCEN-312
    await page.click('[data-testid="emergency-notification-menu"]');
    await page.fill('[name="title"]', '緊急メンテナンス');
    await page.selectOption('[name="target"]', '全ユーザー');
    await page.click('[data-testid="send-button"]');
    await expect(page.locator('.validation-error')).toContainText('詳細内容は必須項目です');
  });

  test("発生日時未入力でエラー表示", async ({ page }) => {
    // SCEN-313
    await page.click('[data-testid="emergency-notification-menu"]');
    await page.click('[data-testid="new-notification"]');
    await page.fill('[name="title"]', 'システムメンテナンス');
    await page.fill('[name="content"]', '緊急メンテナンスを実施します');
    await page.click('[data-testid="send-button"]');
    await expect(page.locator('.error-message')).toContainText('発生日時を入力してください');
  });

  test("通知方法未選択でバリデーション", async ({ page }) => {
    // SCEN-314
    await page.click('[data-testid="emergency-notification-menu"]');
    await page.fill('[name="title"]', '【緊急】システムメンテナンスのお知らせ');
    await page.fill('[name="content"]', '本日21:00-23:00の間、システムメンテナンスを実施します');
    await page.selectOption('[name="targets"]', '全ユーザー');
    await page.click('[data-testid="send-button"]');
    await expect(page.locator('.validation-error')).toContainText('通知方法を1つ以上選択してください');
  });

  test("過去日時入力でエラー表示", async ({ page }) => {
    // SCEN-315
    await page.click('[data-testid="emergency-notification-menu"]');
    await page.fill('[name="title"]', '緊急メンテナンス');
    await page.fill('[name="content"]', 'システムメンテナンスのお知らせ');
    await page.fill('[name="sendDateTime"]', '2023-01-01T10:00');
    await page.click('[data-testid="send-button"]');
    await expect(page.locator('.error-message')).toContainText('送信日時は現在時刻以降を指定してください');
  });

  test("復旧予定が発生前でエラー", async ({ page }) => {
    // SCEN-316
    await page.click('[data-testid="emergency-notification-menu"]');
    await page.fill('[name="faultDateTime"]', '2024-01-01T15:00');
    await page.fill('[name="recoveryDateTime"]', '2024-01-01T14:00');
    await page.fill('[name="content"]', '通知内容');
    await page.click('[data-testid="send-button"]');
    await expect(page.locator('.validation-error')).toContainText('復旧予定時刻が機器障害発生時刻より前');
  });

  test("上限超過ファイルでアップロードエラー", async ({ page }) => {
    // SCEN-317
    await page.click('[data-testid="emergency-notification-menu"]');
    await page.fill('[name="title"]', '通知タイトル');
    await page.fill('[name="content"]', '通知内容');
    await page.setInputFiles('[name="file"]', './test-files/large-file.pdf');
    await page.click('[data-testid="upload-button"]');
    await expect(page.locator('.error-message')).toContainText('ファイルサイズ上限');
  });

  test("通知タイトル文字数上限", async ({ page }) => {
    // SCEN-318
    await page.click('[data-testid="emergency-notification-menu"]');
    await page.fill('[name="title"]', 'a'.repeat(100));
    await page.fill('[name="content"]', '適切な内容');
    await page.selectOption('[name="target"]', '全ユーザー');
    await page.click('[data-testid="send-button"]');
    await expect(page.locator('.success-message')).toBeVisible();
    await page.fill('[name="title"]', 'a'.repeat(101));
    await page.click('[data-testid="send-button"]');
    await expect(page.locator('.error-message')).toContainText('文字数上限');
  });

  test("詳細内容最大文字数入力", async ({ page }) => {
    // SCEN-319
    await page.click('[data-testid="emergency-notification-menu"]');
    await page.fill('[name="title"]', '緊急メンテナンス通知');
    await page.fill('[name="content"]', 'a'.repeat(2000));
    await expect(page.locator('.char-counter')).toContainText('2000');
    await page.fill('[name="content"]', 'a'.repeat(2001));
    await page.click('[data-testid="send-button"]');
    await expect(page.locator('.error-message')).toBeVisible();
  });

  test("添付ファイル最大サイズ", async ({ page }) => {
    // SCEN-320
    await page.click('[data-testid="emergency-notification-menu"]');
    await page.fill('[name="title"]', '緊急メンテナンス通知');
    await page.fill('[name="body"]', 'システムメンテナンスのため一時的にサービスを停止します');
    await page.setInputFiles('[name="attachment"]', './test-files/large-11mb.pdf');
    await page.click('[data-testid="send-button"]');
    await expect(page.locator('.error-message')).toContainText('添付ファイルのサイズが上限（10MB）を超えています');
  });

  test("全機器選択で大量対象者抽出", async ({ page }) => {
    // SCEN-321
    await page.click('[data-testid="emergency-notification-menu"]');
    await page.check('[data-testid="select-all-equipment"]');
    await expect(page.locator('.all-selected')).toBeVisible();
    await page.fill('[name="content"]', '緊急メンテナンスのため全機器を一時停止します');
    await page.click('[data-testid="preview-targets"]');
    await expect(page.locator('.target-count')).toContainText('1000');
    await page.click('[data-testid="send-button"]');
    await page.click('[data-testid="confirm-yes"]');
    await expect(page.locator('.success-message')).toBeVisible();
  });

  test("最小入力項目のみで送信", async ({ page }) => {
    // SCEN-322
    await page.click('[data-testid="emergency-notification-menu"]');
    await page.click('[data-testid="new-emergency-notification"]');
    await page.fill('[name="title"]', '緊急');
    await page.fill('[name="content"]', 'テスト');
    await page.selectOption('[name="target"]', '全ユーザー');
    await page.click('[data-testid="send-button"]');
    await page.click('[data-testid="confirm-ok"]');
    await expect(page.locator('.success-message')).toBeVisible();
  });

  test("緊急度最高レベルでの送信", async ({ page }) => {
    // SCEN-323
    await page.click('[data-testid="emergency-notification-management"]');
    await page.click('[data-testid="new-notification"]');
    await page.selectOption('[name="priority"]', '最高');
    await page.fill('[name="title"]', '【緊急】システム緊急メンテナンス実施');
    await page.fill('[name="body"]', '緊急事項の詳細');
    await page.selectOption('[name="target"]', '全ユーザー');
    await page.check('[name="sendImmediately"]');
    await page.click('[data-testid="send-execute"]');
    await expect(page.locator('.completion-screen')).toBeVisible();
    await page.goto(`${baseUrl}/login`);
    await page.fill('[name="username"]', 'user');
    await page.fill('[name="password"]', 'password');
    await page.click('[type="submit"]');
    await expect(page.locator('.emergency-banner.red')).toBeVisible();
  });

  test("復旧予定未定での通知送信", async ({ page }) => {
    // SCEN-324
    await page.click('[data-testid="emergency-notification-management"]');
    await page.click('[data-testid="new-emergency-notification"]');
    await page.fill('[name="title"]', '機器システム障害発生');
    await page.fill('[name="content"]', '現在システム障害により一部機器が利用できません');
    await page.selectOption('[name="recoveryTime"]', '未定');
    await page.selectOption('[name="targets"]', '全ユーザー');
    await page.click('[data-testid="preview-button"]');
    await page.click('[data-testid="send-button"]');
    await page.click('[data-testid="confirm-yes"]');
    await expect(page.locator('.completion-message')).toBeVisible();
    await page.goto(`${baseUrl}/login`);
    await page.fill('[name="username"]', 'user');
    await page.fill('[name="password"]', 'password');
    await page.click('[type="submit"]');
    await expect(page.locator('.emergency-banner')).toContainText('復旧予定：未定');
  });
});