import { Page } from "@playwright/test";

export class AdminPage {
    constructor(private page: Page) {}

    // Navigation & Header Locators
    adminMenuLink = 'a[href*="/admin/viewAdminModule"]';
    pageHeader = 'h6.oxd-topbar-header-breadcrumb-module';
    topNavTabs = 'nav.oxd-topbar-body-nav li.oxd-topbar-body-nav-tab';

    // Table Locators
    userManagementTable = '.oxd-table';
    tableRows = '.oxd-table-body .oxd-table-card';
    loadingSpinner = '.oxd-loading-spinner';
    noRecordsFoundText = 'text="No Records Found"';

    // Search Filter Locators
    usernameSearchInput = '//label[text()="Username"]/ancestor::div[contains(@class,"oxd-input-group")]//input';
    userRoleDropdown = '//label[text()="User Role"]/ancestor::div[contains(@class,"oxd-input-group")]//div[@class="oxd-select-text-input"]';
    employeeNameSearchInput = '//label[text()="Employee Name"]/ancestor::div[contains(@class,"oxd-input-group")]//input';
    statusDropdown = '//label[text()="Status"]/ancestor::div[contains(@class,"oxd-input-group")]//div[@class="oxd-select-text-input"]';
    searchButton = 'button[type="submit"]:has-text("Search")';
    resetButton = 'button.oxd-button--ghost:has-text("Reset"), button[type="reset"]';

    // Add / Edit Form Locators
    addButton = 'button:has-text("Add")';
    saveButton = 'button[type="submit"]:has-text("Save")';
    cancelButton = 'button:has-text("Cancel")';
    addUserHeader = 'h6.orangehrm-main-title:has-text("Add User")';
    editUserHeader = 'h6.orangehrm-main-title:has-text("Edit User")';

    formUserRoleDropdown = '//label[text()="User Role"]/ancestor::div[contains(@class,"oxd-input-group")]//div[@class="oxd-select-text-input"]';
    formEmployeeNameInput = '//label[text()="Employee Name"]/ancestor::div[contains(@class,"oxd-input-group")]//input';
    formStatusDropdown = '//label[text()="Status"]/ancestor::div[contains(@class,"oxd-input-group")]//div[@class="oxd-select-text-input"]';
    formUsernameInput = '//label[text()="Username"]/ancestor::div[contains(@class,"oxd-input-group")]//input';
    formPasswordInput = '//label[text()="Password"]/ancestor::div[contains(@class,"oxd-input-group")]//input[@type="password"]';
    formConfirmPasswordInput = '//label[text()="Confirm Password"]/ancestor::div[contains(@class,"oxd-input-group")]//input[@type="password"]';
    requiredErrorMessage = '.oxd-input-field-error-message';

    // Delete Confirmation Modal Locators
    deleteModal = '.oxd-dialog-sheet';
    modalConfirmDeleteBtn = '.oxd-dialog-sheet button:has-text("Delete")';
    modalCancelDeleteBtn = '.oxd-dialog-sheet button:has-text("Cancel")';

    // Pagination Locators
    paginationContainer = '.oxd-pagination';
    paginationButtons = '.oxd-pagination-page-item--page';

    // Navigation Action
    async navigateToAdmin() {
        const initialLoad = this.page.waitForResponse(
            resp => resp.url().includes('/api/v2/admin/users') && resp.status() === 200,
            { timeout: 15000 }
        ).catch(() => null);

        await this.page.locator(this.adminMenuLink).click();
        await this.page.waitForURL(/.*admin\/viewSystemUsers.*/);
        await initialLoad;
        await this.waitForSpinnerToDisappear();
        await this.page.locator(this.userManagementTable).waitFor({ state: 'visible', timeout: 15000 });
    }

    async getHeaderTitle(): Promise<string> {
        return (await this.page.locator(this.pageHeader).innerText()).trim();
    }

    async getTopNavOptions(): Promise<string[]> {
        await this.page.locator(this.topNavTabs).first().waitFor({ state: 'visible' });
        return await this.page.locator(this.topNavTabs).allInnerTexts();
    }

    async waitForSpinnerToDisappear() {
        try {
            await this.page.locator(this.loadingSpinner).waitFor({ state: 'detached', timeout: 5000 });
        } catch {
            // Spinner might have detached immediately
        }
    }

    // Dropdown & Autocomplete Helpers
    async selectDropdownOption(triggerSelector: string, optionText: string) {
        await this.page.locator(triggerSelector).click();
        const option = this.page.locator(`div[role="listbox"] div[role="option"]:has-text("${optionText}")`).first();
        await option.waitFor({ state: 'visible', timeout: 10000 });
        await option.click();
    }

    async fillEmployeeName(inputSelector: string, hint: string) {
        const input = this.page.locator(inputSelector);
        await input.fill('');
        await input.pressSequentially(hint, { delay: 100 });

        const options = this.page.locator('div[role="listbox"] div[role="option"], div[role="listbox"] .oxd-autocomplete-option')
            .filter({ hasNotText: 'Searching' });

        try {
            await options.first().waitFor({ state: 'visible', timeout: 15000 });
        } catch {
            await input.fill('');
            await input.pressSequentially(hint, { delay: 150 });
            await options.first().waitFor({ state: 'visible', timeout: 15000 });
        }

        const firstWord = hint.split(' ')[0];
        const matchingOption = options.filter({ hasText: firstWord }).first();
        if ((await matchingOption.count()) > 0) {
            await matchingOption.click();
        } else {
            await options.first().click();
        }
    }

    // Table Actions
    async isTableVisible(): Promise<boolean> {
        return await this.page.locator(this.userManagementTable).isVisible();
    }

    async getTableRowCount(): Promise<number> {
        await this.waitForSpinnerToDisappear();
        return await this.page.locator(this.tableRows).count();
    }

    getUserRow(username: string) {
        return this.page.locator(this.tableRows).filter({ hasText: username });
    }

    async isUserPresentInTable(username: string): Promise<boolean> {
        await this.waitForSpinnerToDisappear();
        return (await this.getUserRow(username).count()) > 0;
    }

    async getFirstRowUsername(): Promise<string> {
        await this.waitForSpinnerToDisappear();
        return (await this.page.locator(this.tableRows).first().locator('.oxd-table-cell').nth(1).innerText()).trim();
    }

    async getFirstRowRole(): Promise<string> {
        await this.waitForSpinnerToDisappear();
        return (await this.page.locator(this.tableRows).first().locator('.oxd-table-cell').nth(2).innerText()).trim();
    }

    async getFirstRowEmployeeName(): Promise<string> {
        await this.waitForSpinnerToDisappear();
        return (await this.page.locator(this.tableRows).first().locator('.oxd-table-cell').nth(3).innerText()).trim();
    }

    async getFirstRowStatus(): Promise<string> {
        await this.waitForSpinnerToDisappear();
        return (await this.page.locator(this.tableRows).first().locator('.oxd-table-cell').nth(4).innerText()).trim();
    }

    // Search Actions
    async searchByUsername(username: string) {
        await this.page.locator(this.usernameSearchInput).fill(username);
        const searchPromise = this.page.waitForResponse(
            resp => resp.url().includes('/api/v2/admin/users') && resp.url().toLowerCase().includes('username=') && resp.status() === 200,
            { timeout: 10000 }
        ).catch(() => null);

        await this.page.locator(this.searchButton).click();
        await searchPromise;
        await this.waitForSpinnerToDisappear();
    }

    async searchByUserRole(role: string) {
        await this.selectDropdownOption(this.userRoleDropdown, role);
        const searchPromise = this.page.waitForResponse(
            resp => resp.url().includes('/api/v2/admin/users') && resp.url().includes('userRoleId=') && resp.status() === 200,
            { timeout: 10000 }
        ).catch(() => null);

        await this.page.locator(this.searchButton).click();
        await searchPromise;
        await this.waitForSpinnerToDisappear();
    }

    async searchByEmployeeName(hint: string) {
        await this.fillEmployeeName(this.employeeNameSearchInput, hint);
        const searchPromise = this.page.waitForResponse(
            resp => resp.url().includes('/api/v2/admin/users') && resp.url().includes('empNumber=') && resp.status() === 200,
            { timeout: 10000 }
        ).catch(() => null);

        await this.page.locator(this.searchButton).click();
        await searchPromise;
        await this.waitForSpinnerToDisappear();
    }

    async searchByStatus(status: string) {
        await this.selectDropdownOption(this.statusDropdown, status);
        const searchPromise = this.page.waitForResponse(
            resp => resp.url().includes('/api/v2/admin/users') && resp.url().includes('status=') && resp.status() === 200,
            { timeout: 10000 }
        ).catch(() => null);

        await this.page.locator(this.searchButton).click();
        await searchPromise;
        await this.waitForSpinnerToDisappear();
    }

    async clickReset() {
        const resetPromise = this.page.waitForResponse(
            resp => resp.url().includes('/api/v2/admin/users') && resp.status() === 200,
            { timeout: 10000 }
        ).catch(() => null);

        await this.page.locator(this.resetButton).click();
        await resetPromise;
        await this.waitForSpinnerToDisappear();
    }

    async getUsernameSearchInputValue(): Promise<string> {
        return await this.page.locator(this.usernameSearchInput).inputValue();
    }

    async getUserRoleDropdownText(): Promise<string> {
        return (await this.page.locator(this.userRoleDropdown).innerText()).trim();
    }

    async isNoRecordsFoundVisible(): Promise<boolean> {
        return await this.page.locator(this.noRecordsFoundText).first().isVisible();
    }

    // Add / Edit Actions
    async clickAdd() {
        await this.page.locator(this.addButton).click();
        await this.page.waitForURL(/.*admin\/saveSystemUser.*/);
        await this.page.locator(this.addUserHeader).waitFor({ state: 'visible' });
    }

    async clickSave() {
        await this.page.locator(this.saveButton).click();
    }

    async addNewUser(role: string, empNameHint: string, status: string, username: string, password: string) {
        await this.selectDropdownOption(this.formUserRoleDropdown, role);
        await this.fillEmployeeName(this.formEmployeeNameInput, empNameHint);
        await this.selectDropdownOption(this.formStatusDropdown, status);
        await this.page.locator(this.formUsernameInput).fill(username);
        await this.page.locator(this.formPasswordInput).fill(password);
        await this.page.locator(this.formConfirmPasswordInput).fill(password);
        await this.clickSave();
        await this.page.waitForURL(/.*admin\/viewSystemUsers.*/, { timeout: 20000 });
        await this.waitForSpinnerToDisappear();
        await this.page.locator(this.userManagementTable).waitFor({ state: 'visible', timeout: 15000 });
    }

    async clickEditUser(username: string) {
        const row = this.getUserRow(username);
        await row.locator('i.bi-pencil-fill').first().click();
        await this.page.locator(this.editUserHeader).waitFor({ state: 'visible' });
    }

    async editUserRole(newRole: string) {
        await this.selectDropdownOption(this.formUserRoleDropdown, newRole);
        await this.clickSave();
        await this.page.waitForURL(/.*admin\/viewSystemUsers.*/, { timeout: 20000 });
        await this.waitForSpinnerToDisappear();
        await this.page.locator(this.userManagementTable).waitFor({ state: 'visible', timeout: 15000 });
    }

    async editUserStatus(newStatus: string) {
        await this.selectDropdownOption(this.formStatusDropdown, newStatus);
        await this.clickSave();
        await this.page.waitForURL(/.*admin\/viewSystemUsers.*/, { timeout: 20000 });
        await this.waitForSpinnerToDisappear();
        await this.page.locator(this.userManagementTable).waitFor({ state: 'visible', timeout: 15000 });
    }

    // Delete Actions
    async clickDeleteUser(username: string) {
        const row = this.getUserRow(username);
        await row.locator('i.bi-trash').first().click();
        await this.page.locator(this.deleteModal).waitFor({ state: 'visible' });
    }

    async confirmDelete() {
        const deletePromise = this.page.waitForResponse(
            resp => resp.url().includes('/api/v2/admin/users') && resp.status() === 200,
            { timeout: 10000 }
        ).catch(() => null);

        await this.page.locator(this.modalConfirmDeleteBtn).click();
        await deletePromise;
        await this.waitForSpinnerToDisappear();
    }

    async cancelDelete() {
        await this.page.locator(this.modalCancelDeleteBtn).click();
        await this.page.locator(this.deleteModal).waitFor({ state: 'hidden' });
    }

    // Pagination Actions
    async isPaginationVisible(): Promise<boolean> {
        return await this.page.locator(this.paginationContainer).isVisible();
    }

    async getPageCount(): Promise<number> {
        return await this.page.locator(this.paginationButtons).count();
    }

    async clickPageNumber(pageIndex: number): Promise<boolean> {
        const pageBtn = this.page.locator(this.paginationButtons).nth(pageIndex - 1);
        if (await pageBtn.isVisible()) {
            await pageBtn.click();
            await this.waitForSpinnerToDisappear();
            return true;
        }
        return false;
    }
}
