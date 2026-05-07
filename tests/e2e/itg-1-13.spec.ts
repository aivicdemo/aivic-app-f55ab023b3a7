import { test, expect } from '@playwright/test';
const { describe } = test;

describe("緊急通知送信機能", () => {
  const baseUrl = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

  test.beforeEach(async ({ page }) => {
    // テスト前の共通処理
    await page.goto(baseUrl);
  });

  test("管理者が緊急通知を送信できる", async ({ page }) => {
    // 管理者としてログイン
    await page.fill('[data-testid="username"]', 'admin');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-button"]');

    // 緊急通知画面に遷移
    await page.click('[data-testid="emergency-notification"]');
    
    // 通知内容を入力
    await page.fill('[data-testid="notification-title"]', '緊急メンテナンス通知');
    await page.fill('[data-testid="notification-message"]', 'システムメンテナンスのため一時停止します');
    
    // 送信ボタンをクリック
    await page.click('[data-testid="send-notification"]');
    
    // 送信完了メッセージを確認
    await expect(page.locator('[data-testid="success-message"]')).toContainText('緊急通知を送信しました');
  });

  test("通知履歴が正しく表示される", async ({ page }) => {
    // 管理者としてログイン
    await page.fill('[data-testid="username"]', 'admin');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-button"]');

    // 通知履歴画面に遷移
    await page.click('[data-testid="notification-history"]');
    
    // 履歴一覧が表示されることを確認
    await expect(page.locator('[data-testid="notification-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="notification-item"]').first()).toBeVisible();
  });
});