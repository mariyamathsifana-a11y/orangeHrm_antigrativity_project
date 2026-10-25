import { Page } from "@playwright/test";

export class LoginPage {
    constructor(private page: Page) {}

    // locators
    usernameInput = 'input[name="username"]';
    passwordInput = 'input[name="password"]';
    loginButton = 'button[type="submit"]';
    dashboardHeader = 'h6.oxd-topbar-header-breadcrumb-module';
    invalidCredentialsError = '.oxd-alert-content-text';
    requiredErrorMessage = '.oxd-input-field-error-message';

    async navigate() {
        await this.page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
    }

    async login(username: string, password: string) {
        await this.page.locator(this.usernameInput).fill(username);
        await this.page.locator(this.passwordInput).fill(password);
        await this.page.locator(this.loginButton).click();
    }

    async clickLoginWithEmptyFields() {
        await this.page.locator(this.loginButton).click();
    }

    async clickLogin() {
        await this.page.locator(this.loginButton).click();
    }
}
