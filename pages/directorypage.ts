import { Page } from "@playwright/test";

export class DirectoryPage {
    constructor(private page: Page) {}

    // Navigation & Header Locators
    directoryMenuLink = 'a[href*="/directory/viewDirectory"]';
    pageHeader = 'h6.oxd-topbar-header-breadcrumb-module';
    loadingSpinner = '.oxd-loading-spinner';

    // Search Filter Locators
    employeeNameSearchInput = '//label[text()="Employee Name"]/ancestor::div[contains(@class,"oxd-input-group")]//input';
    jobTitleDropdown = '//label[text()="Job Title"]/ancestor::div[contains(@class,"oxd-input-group")]//div[@class="oxd-select-text-input"]';
    locationDropdown = '//label[text()="Location"]/ancestor::div[contains(@class,"oxd-input-group")]//div[@class="oxd-select-text-input"]';
    searchButton = 'button[type="submit"]:has-text("Search")';
    resetButton = 'button.oxd-button--ghost:has-text("Reset"), button[type="reset"]';

    // Directory Cards & Results Locators
    directoryContainer = '.orangehrm-container';
    directoryCards = '.orangehrm-directory-card';
    cardHeaderName = 'p.orangehrm-directory-card-header';
    cardSubtitleJobTitle = 'p.orangehrm-directory-card-subtitle';
    cardBody = '.orangehrm-directory-card-body';
    cardProfilePicture = '.orangehrm-profile-picture-img';
    recordCountBadge = '.orangehrm-horizontal-padding span.oxd-text--span';
    noRecordsFoundText = 'text="No Records Found"';
    invalidErrorMessage = '.oxd-input-field-error-message, .oxd-input-group__message';

    // Navigation Action
    async navigateToDirectory() {
        const initialLoad = this.page.waitForResponse(
            resp => resp.url().includes('/api/v2/directory/employees') && resp.status() === 200,
            { timeout: 15000 }
        ).catch(() => null);

        await this.page.locator(this.directoryMenuLink).click();
        await this.page.waitForURL(/.*directory\/viewDirectory.*/);
        await initialLoad;
        await this.waitForSpinnerToDisappear();
        await this.page.locator(this.directoryContainer).waitFor({ state: 'visible', timeout: 15000 });
    }

    async getHeaderTitle(): Promise<string> {
        return (await this.page.locator(this.pageHeader).innerText()).trim();
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

    // Card Actions & Getters
    async isCardGridVisible(): Promise<boolean> {
        return await this.page.locator(this.directoryContainer).isVisible();
    }

    async getCardCount(): Promise<number> {
        await this.waitForSpinnerToDisappear();
        return await this.page.locator(this.directoryCards).count();
    }

    async getFirstCardName(): Promise<string> {
        await this.waitForSpinnerToDisappear();
        const firstCard = this.page.locator(this.directoryCards).first();
        return (await firstCard.locator(this.cardHeaderName).innerText()).trim();
    }

    async getFirstCardJobTitle(): Promise<string> {
        await this.waitForSpinnerToDisappear();
        const firstCard = this.page.locator(this.directoryCards).first();
        const subtitle = firstCard.locator(this.cardSubtitleJobTitle);
        if (await subtitle.isVisible()) {
            return (await subtitle.innerText()).trim();
        }
        return '';
    }

    async isFirstCardImageVisible(): Promise<boolean> {
        await this.waitForSpinnerToDisappear();
        const firstCard = this.page.locator(this.directoryCards).first();
        return await firstCard.locator(this.cardProfilePicture).isVisible();
    }

    async clickFirstCard() {
        await this.waitForSpinnerToDisappear();
        await this.page.locator(this.directoryCards).first().click();
    }

    // Search Actions
    async searchByEmployeeName(hint: string) {
        await this.fillEmployeeName(this.employeeNameSearchInput, hint);
        await this.clickSearch();
    }

    async searchByJobTitle(jobTitle: string) {
        await this.selectDropdownOption(this.jobTitleDropdown, jobTitle);
        await this.clickSearch();
    }

    async searchByLocation(location: string) {
        await this.selectDropdownOption(this.locationDropdown, location);
        await this.clickSearch();
    }

    async searchWithMultipleFilters(jobTitle: string, location: string) {
        await this.selectDropdownOption(this.jobTitleDropdown, jobTitle);
        await this.selectDropdownOption(this.locationDropdown, location);
        await this.clickSearch();
    }

    async enterEmployeeNameWithoutSelect(name: string) {
        const input = this.page.locator(this.employeeNameSearchInput);
        await input.fill(name);
    }

    async clickSearch() {
        const searchPromise = this.page.waitForResponse(
            resp => resp.url().includes('/api/v2/directory/employees') && resp.status() === 200,
            { timeout: 10000 }
        ).catch(() => null);

        await this.page.locator(this.searchButton).click();
        await searchPromise;
        await this.waitForSpinnerToDisappear();
    }

    async clickReset() {
        const resetPromise = this.page.waitForResponse(
            resp => resp.url().includes('/api/v2/directory/employees') && resp.status() === 200,
            { timeout: 10000 }
        ).catch(() => null);

        await this.page.locator(this.resetButton).click();
        await resetPromise;
        await this.waitForSpinnerToDisappear();
    }

    // Value Checkers
    async getEmployeeSearchInputValue(): Promise<string> {
        return await this.page.locator(this.employeeNameSearchInput).inputValue();
    }

    async getJobTitleDropdownText(): Promise<string> {
        return (await this.page.locator(this.jobTitleDropdown).innerText()).trim();
    }

    async getLocationDropdownText(): Promise<string> {
        return (await this.page.locator(this.locationDropdown).innerText()).trim();
    }

    async isNoRecordsFoundVisible(): Promise<boolean> {
        return await this.page.locator(this.noRecordsFoundText).first().isVisible();
    }

    async isInvalidErrorMessageVisible(): Promise<boolean> {
        return await this.page.locator(this.invalidErrorMessage).first().isVisible();
    }

    async getRecordCountText(): Promise<string> {
        await this.waitForSpinnerToDisappear();
        const badge = this.page.locator(this.recordCountBadge).first();
        if (await badge.isVisible()) {
            return (await badge.innerText()).trim();
        }
        return '';
    }

    async refreshPage() {
        await this.page.reload();
        await this.page.waitForURL(/.*directory\/viewDirectory.*/);
        await this.waitForSpinnerToDisappear();
        await this.page.locator(this.directoryContainer).waitFor({ state: 'visible', timeout: 15000 });
    }
}
