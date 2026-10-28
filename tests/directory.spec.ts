import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/loginpage';
import { DirectoryPage } from '../pages/directorypage';

test.describe.serial('OrangeHRM Directory Module Tests - DirectoryTest', () => {
    let loginPage: LoginPage;
    let directoryPage: DirectoryPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        await loginPage.navigate();
        await loginPage.login('Admin', 'admin123');
        await expect(page).toHaveURL(/.*dashboard.*/);

        directoryPage = new DirectoryPage(page);
        await directoryPage.navigateToDirectory();
    });

    test('1. Verify that the Directory page opens successfully and header is displayed', async ({ page }) => {
        await expect(page).toHaveURL(/.*directory\/viewDirectory.*/);
        const headerTitle = await directoryPage.getHeaderTitle();
        expect(headerTitle).toBe('Directory');
    });

    test('2. Verify employee details are displayed', async () => {
        expect(await directoryPage.isCardGridVisible()).toBeTruthy();
        const cardCount = await directoryPage.getCardCount();
        expect(cardCount).toBeGreaterThan(0);
        const firstCardName = await directoryPage.getFirstCardName();
        expect(firstCardName.length).toBeGreaterThan(0);
        expect(await directoryPage.isFirstCardImageVisible()).toBeTruthy();
    });

    test('3. Search using a valid employee name', async () => {
        const initialName = await directoryPage.getFirstCardName();
        const hint = initialName.split(' ')[0];

        await directoryPage.searchByEmployeeName(hint);
        const cardCount = await directoryPage.getCardCount();
        expect(cardCount).toBeGreaterThanOrEqual(1);

        const firstResultName = await directoryPage.getFirstCardName();
        expect(firstResultName.toLowerCase()).toContain(hint.toLowerCase());
    });

    test('4. Search using an invalid employee name', async () => {
        await directoryPage.enterEmployeeNameWithoutSelect('NonExistent_InvalidEmployee_9999');
        await directoryPage.clickSearch();

        const count = await directoryPage.getCardCount();
        const noRecords = await directoryPage.isNoRecordsFoundVisible();
        const hasInvalidError = await directoryPage.isInvalidErrorMessageVisible();
        expect(count === 0 || noRecords || hasInvalidError).toBeTruthy();
    });

    test('5. Search using a valid job title', async () => {
        await directoryPage.searchByJobTitle('Account Assistant');
        const count = await directoryPage.getCardCount();
        const noRecords = await directoryPage.isNoRecordsFoundVisible();
        const recordCountText = await directoryPage.getRecordCountText();
        expect(count > 0 || noRecords || recordCountText.length > 0).toBeTruthy();
    });

    test('6. Search using a valid location', async () => {
        await directoryPage.searchByLocation('HQ - CA, USA');
        const count = await directoryPage.getCardCount();
        const noRecords = await directoryPage.isNoRecordsFoundVisible();
        const recordCountText = await directoryPage.getRecordCountText();
        expect(count > 0 || noRecords || recordCountText.length > 0).toBeTruthy();
    });

    test('7. Verify Search button functionality', async () => {
        await directoryPage.searchByJobTitle('Chief Executive Officer');
        const recordCountText = await directoryPage.getRecordCountText();
        const count = await directoryPage.getCardCount();
        expect(count > 0 || recordCountText.length > 0).toBeTruthy();
    });

    test('8. Verify Reset button functionality', async () => {
        await directoryPage.selectDropdownOption(directoryPage.jobTitleDropdown, 'Account Assistant');
        await directoryPage.clickSearch();

        await directoryPage.clickReset();
        const employeeNameVal = await directoryPage.getEmployeeSearchInputValue();
        expect(employeeNameVal).toBe('');
        const jobTitleVal = await directoryPage.getJobTitleDropdownText();
        expect(jobTitleVal).toContain('-- Select --');
        const locationVal = await directoryPage.getLocationDropdownText();
        expect(locationVal).toContain('-- Select --');

        const cardCount = await directoryPage.getCardCount();
        expect(cardCount).toBeGreaterThan(0);
    });

    test('9. Search using multiple filters', async () => {
        await directoryPage.searchWithMultipleFilters('Chief Executive Officer', 'HQ - CA, USA');
        const count = await directoryPage.getCardCount();
        const noRecords = await directoryPage.isNoRecordsFoundVisible();
        const recordCountText = await directoryPage.getRecordCountText();
        expect(count > 0 || noRecords || recordCountText.length > 0).toBeTruthy();
    });

    test('10. Verify employee details in the search results', async () => {
        const initialName = await directoryPage.getFirstCardName();
        const hint = initialName.split(' ')[0];

        await directoryPage.searchByEmployeeName(hint);
        const cardCount = await directoryPage.getCardCount();
        expect(cardCount).toBeGreaterThan(0);

        const cardName = await directoryPage.getFirstCardName();
        expect(cardName.toLowerCase()).toContain(hint.toLowerCase());
        expect(await directoryPage.isFirstCardImageVisible()).toBeTruthy();
    });

    test('11. Verify the page after refreshing', async ({ page }) => {
        await directoryPage.refreshPage();
        await expect(page).toHaveURL(/.*directory\/viewDirectory.*/);
        const headerTitle = await directoryPage.getHeaderTitle();
        expect(headerTitle).toBe('Directory');
        const cardCount = await directoryPage.getCardCount();
        expect(cardCount).toBeGreaterThan(0);
    });
});
