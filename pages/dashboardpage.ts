import { Page } from "@playwright/test";

export class DashboardPage {
    constructor(private page: Page) {}

    // Page Header & Breadcrumb Locators
    pageHeader = 'h6.oxd-topbar-header-breadcrumb-module';
    dashboardMenuLink = 'a[href*="/dashboard/index"]';
    loadingSpinner = '.oxd-loading-spinner';

    // Widget Grid & Common Widget Locators
    widgetsGrid = '.orangehrm-dashboard-grid';
    widgets = '.oxd-sheet:has(.orangehrm-dashboard-widget-header)';
    widgetNames = '.orangehrm-dashboard-widget-name p';

    // Specific Widget Locators
    timeAtWorkWidget = '.oxd-sheet:has(.orangehrm-dashboard-widget-name:has-text("Time at Work"))';
    myActionsWidget = '.oxd-sheet:has(.orangehrm-dashboard-widget-name:has-text("My Actions"))';
    quickLaunchWidget = '.oxd-sheet:has(.orangehrm-dashboard-widget-name:has-text("Quick Launch"))';
    buzzLatestPostsWidget = '.oxd-sheet:has(.orangehrm-dashboard-widget-name:has-text("Buzz Latest Posts"))';
    employeesOnLeaveTodayWidget = '.oxd-sheet:has(.orangehrm-dashboard-widget-name:has-text("Employees on Leave Today"))';
    employeeDistributionBySubUnitWidget = '.oxd-sheet:has(.orangehrm-dashboard-widget-name:has-text("Employee Distribution by Sub Unit"))';
    employeeDistributionByLocationWidget = '.oxd-sheet:has(.orangehrm-dashboard-widget-name:has-text("Employee Distribution by Location"))';

    // Navigation Locators
    adminNavLink = 'a.oxd-main-menu-item[href*="/admin/viewAdminModule"]';
    directoryNavLink = 'a.oxd-main-menu-item[href*="/directory/viewDirectory"]';

    // User Dropdown & Logout Locators
    userDropdown = '.oxd-userdropdown-tab';
    logoutLink = 'a[href*="/auth/logout"], .oxd-userdropdown-link:has-text("Logout")';
    loginButton = 'button[type="submit"]';

    // Navigation Action
    async navigateToDashboard() {
        await this.page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index');
        await this.page.waitForURL(/.*dashboard\/index.*/);
        await this.waitForSpinnerToDisappear();
        await this.page.locator(this.pageHeader).waitFor({ state: 'visible', timeout: 15000 });
    }

    async getHeaderTitle(): Promise<string> {
        return (await this.page.locator(this.pageHeader).innerText()).trim();
    }

    async getBrowserTitle(): Promise<string> {
        return await this.page.title();
    }

    async waitForSpinnerToDisappear() {
        try {
            await this.page.locator(this.loadingSpinner).first().waitFor({ state: 'detached', timeout: 5000 });
        } catch {
            // Spinner might have detached immediately
        }
    }

    // Widget Verification Methods
    async isWidgetsGridVisible(): Promise<boolean> {
        return await this.page.locator(this.widgetsGrid).isVisible();
    }

    async getWidgetCount(): Promise<number> {
        return await this.page.locator(this.widgets).count();
    }

    async getAllWidgetNames(): Promise<string[]> {
        await this.page.locator(this.widgetNames).first().waitFor({ state: 'visible', timeout: 10000 });
        return await this.page.locator(this.widgetNames).allInnerTexts();
    }

    async isTimeAtWorkVisible(): Promise<boolean> {
        return await this.page.locator(this.timeAtWorkWidget).isVisible();
    }

    async isMyActionsVisible(): Promise<boolean> {
        return await this.page.locator(this.myActionsWidget).isVisible();
    }

    async isQuickLaunchVisible(): Promise<boolean> {
        return await this.page.locator(this.quickLaunchWidget).isVisible();
    }

    async isBuzzLatestPostsVisible(): Promise<boolean> {
        return await this.page.locator(this.buzzLatestPostsWidget).isVisible();
    }

    async isEmployeesOnLeaveTodayVisible(): Promise<boolean> {
        return await this.page.locator(this.employeesOnLeaveTodayWidget).isVisible();
    }

    async isEmployeeDistributionBySubUnitVisible(): Promise<boolean> {
        return await this.page.locator(this.employeeDistributionBySubUnitWidget).isVisible();
    }

    async isEmployeeDistributionByLocationVisible(): Promise<boolean> {
        return await this.page.locator(this.employeeDistributionByLocationWidget).isVisible();
    }

    // Navigation from Dashboard
    async navigateToAdmin(): Promise<void> {
        await this.page.locator(this.adminNavLink).click();
        await this.page.waitForURL(/.*admin\/viewSystemUsers.*/);
        await this.waitForSpinnerToDisappear();
    }

    // Page Refresh Action
    async refreshDashboard(): Promise<void> {
        await this.page.reload();
        await this.page.waitForURL(/.*dashboard\/index.*/);
        await this.waitForSpinnerToDisappear();
        await this.page.locator(this.pageHeader).waitFor({ state: 'visible', timeout: 15000 });
    }

    // Logout Action
    async logout(): Promise<void> {
        await this.page.locator(this.userDropdown).click();
        const logoutBtn = this.page.locator(this.logoutLink);
        await logoutBtn.waitFor({ state: 'visible', timeout: 5000 });
        await logoutBtn.click();
        await this.page.waitForURL(/.*auth\/login.*/);
        await this.page.locator(this.loginButton).waitFor({ state: 'visible', timeout: 10000 });
    }
}
