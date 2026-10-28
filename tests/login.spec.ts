import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/loginpage';

test.describe('OrangeHRM Login Tests - LoginTest', () => {
    let loginPage: LoginPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        await loginPage.navigate();
    });

    test('emptycredentials: Verify validation errors when logging in with empty fields', async ({ page }) => {
        await loginPage.clickLoginWithEmptyFields();

        const requiredErrors = page.locator(loginPage.requiredErrorMessage);
        await expect(requiredErrors).toHaveCount(2);
        await expect(requiredErrors.first()).toBeVisible();
        await expect(requiredErrors.first()).toHaveText('Required');
        await expect(requiredErrors.last()).toBeVisible();
        await expect(requiredErrors.last()).toHaveText('Required');
    });

    test('invalidcredentials: Verify error message when logging in with invalid credentials', async ({ page }) => {
        await loginPage.enterUsername('inavlid');
        await loginPage.enterPassword('123v');
        await loginPage.clickLogin();

        const errorAlert = page.locator(loginPage.invalidCredentialsError);
        await expect(errorAlert).toBeVisible();
        await expect(errorAlert).toContainText('Invalid credentials');
    });

    test('validcredentials: Verify successful login and redirection to dashboard', async ({ page }) => {
        await loginPage.enterUsername('Admin');
        await loginPage.enterPassword('admin123');
        await loginPage.clickLogin();

        await expect(page).toHaveURL(/.*dashboard.*/);
        await expect(page.locator(loginPage.dashboardHeader)).toBeVisible();
    });
});
