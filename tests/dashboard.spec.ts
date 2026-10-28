import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/loginpage';
import { DashboardPage } from '../pages/dashboardpage';

test.describe.serial('OrangeHRM Dashboard Module Tests - DashboardTest', () => {
    let loginPage: LoginPage;
    let dashboardPage: DashboardPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        await loginPage.navigate();
        await loginPage.login('Admin', 'admin123');
        await expect(page).toHaveURL(/.*dashboard.*/);

        dashboardPage = new DashboardPage(page);
        await dashboardPage.waitForPageLoaded();
    });

    test('1. Verify that the Dashboard page opens successfully and header is displayed', async ({ page }) => {
        await expect(page).toHaveURL(/.*dashboard\/index.*/);
        const headerTitle = await dashboardPage.getHeaderTitle();
        expect(headerTitle).toBe('Dashboard');
    });

    test('2. Verify browser title for Dashboard page', async () => {
        const title = await dashboardPage.getBrowserTitle();
        expect(title).toBe('OrangeHRM');
    });

    test('3. Verify user profile dropdown is visible and displays user name', async () => {
        const isDropdownVisible = await dashboardPage.isUserDropdownVisible();
        expect(isDropdownVisible).toBeTruthy();

        const username = await dashboardPage.getUserDropdownName();
        expect(username.length).toBeGreaterThan(0);
    });

    test('4. Verify that the dashboard widgets grid is displayed', async () => {
        const isGridVisible = await dashboardPage.isWidgetsGridVisible();
        expect(isGridVisible).toBeTruthy();
    });

    test('5. Verify total count of dashboard widgets displayed', async () => {
        const widgetCount = await dashboardPage.getWidgetCount();
        expect(widgetCount).toBeGreaterThan(0);
        expect(widgetCount).toBeGreaterThanOrEqual(5);
    });

    test('6. Verify all dashboard widget titles are present', async () => {
        const widgetNames = await dashboardPage.getAllWidgetNames();
        expect(widgetNames.length).toBeGreaterThan(0);

        const expectedWidgets = [
            'Time at Work',
            'My Actions',
            'Quick Launch',
            'Buzz Latest Posts',
            'Employees on Leave Today',
            'Employee Distribution by Sub Unit',
            'Employee Distribution by Location',
        ];

        for (const expected of expectedWidgets) {
            const isFound = widgetNames.some(name => name.toLowerCase().includes(expected.toLowerCase()));
            expect(isFound, `Expected widget "${expected}" to be present`).toBeTruthy();
        }
    });

    test('7. Verify Time at Work widget is visible', async () => {
        const isVisible = await dashboardPage.isTimeAtWorkVisible();
        expect(isVisible).toBeTruthy();
    });

    test('8. Verify My Actions widget is visible', async () => {
        const isVisible = await dashboardPage.isMyActionsVisible();
        expect(isVisible).toBeTruthy();
    });

    test('9. Verify Quick Launch widget is visible', async () => {
        const isVisible = await dashboardPage.isQuickLaunchVisible();
        expect(isVisible).toBeTruthy();
    });

    test('10. Verify Buzz Latest Posts widget is visible', async () => {
        const isVisible = await dashboardPage.isBuzzLatestPostsVisible();
        expect(isVisible).toBeTruthy();
    });

    test('11. Verify Employees on Leave Today widget is visible', async () => {
        const isVisible = await dashboardPage.isEmployeesOnLeaveTodayVisible();
        expect(isVisible).toBeTruthy();
    });

    test('12. Verify Employee Distribution by Sub Unit widget is visible', async () => {
        const isVisible = await dashboardPage.isEmployeeDistributionBySubUnitVisible();
        expect(isVisible).toBeTruthy();
    });

    test('13. Verify Employee Distribution by Location widget is visible', async () => {
        const isVisible = await dashboardPage.isEmployeeDistributionByLocationVisible();
        expect(isVisible).toBeTruthy();
    });

    test('14. Verify Dashboard page reloads successfully and widgets remain visible', async ({ page }) => {
        await dashboardPage.refreshDashboard();
        await expect(page).toHaveURL(/.*dashboard\/index.*/);
        const headerTitle = await dashboardPage.getHeaderTitle();
        expect(headerTitle).toBe('Dashboard');

        const widgetCount = await dashboardPage.getWidgetCount();
        expect(widgetCount).toBeGreaterThan(0);
    });

    test('15. Verify navigation from Dashboard to Admin module', async ({ page }) => {
        await dashboardPage.navigateToAdmin();
        await expect(page).toHaveURL(/.*admin\/viewSystemUsers.*/);
    });

    test('16. Verify navigation from Dashboard to Directory module', async ({ page }) => {
        await dashboardPage.navigateToDirectory();
        await expect(page).toHaveURL(/.*directory\/viewDirectory.*/);
    });

    test('17. Verify user logout functionality from Dashboard', async ({ page }) => {
        await dashboardPage.logout();
        await expect(page).toHaveURL(/.*auth\/login.*/);
        await expect(page.locator(dashboardPage.loginButton)).toBeVisible();
    });
});
