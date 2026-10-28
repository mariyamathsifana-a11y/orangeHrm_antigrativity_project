import { Page } from '@playwright/test';

export class LoginPage {
    constructor(private page: Page) {}

    // Locators
    username = 'input[name="username"]';
    password = 'input[name="password"]';
    loginButton = 'button[type="submit"]';
    dashboardHeader = 'h6.oxd-topbar-header-breadcrumb-module';
    invalidCredentialsError = '.oxd-alert-content-text';
    requiredErrorMessage = '.oxd-input-field-error-message';

    // Navigation
    async navigate() {
        await this.page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login', { waitUntil: 'domcontentloaded' });
    }

    // Reusable methods
    async enterUsername(value: string) {
        await this.page.locator(this.username).fill(value);
    }

    async enterPassword(value: string) {
        await this.page.locator(this.password).fill(value);
    }

    async clickLogin() {
        await this.page.locator(this.loginButton).click();
    }

    async clickLoginWithEmptyFields() {
        await this.clickLogin();
    }

    async login(username: string, password: string) {
        await this.enterUsername(username);
        await this.enterPassword(password);
        await this.clickLogin();
    }
}
