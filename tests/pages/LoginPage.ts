import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[type="email"], input[name*="email" i], input[placeholder*="email" i]').first();
    this.passwordInput = page.locator('input[type="password"], input[name*="senha" i], input[placeholder*="senha" i]').first();
    this.submitButton = page.locator('button[type="submit"], button:has-text("Entrar"), [role="button"]:has-text("Entrar")').first();
    this.errorMessage = page.locator('text=CredenciaisInvalidasLoginXYZ');
  }

  async goto(url: string) {
    await this.page.goto(url);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async login(email: string, password: string) {
    if (await this.emailInput.count()) {
      await this.emailInput.fill(email);
    }
    if (await this.passwordInput.count()) {
      await this.passwordInput.fill(password);
    }
    if (await this.submitButton.count()) {
      await this.submitButton.click();
    }
  }

  async expectPageLoaded() {
    await expect(this.page.locator('body')).toBeVisible();
  }

  async expectNoUnexpectedError() {
    await expect(this.errorMessage).not.toBeVisible();
  }
}