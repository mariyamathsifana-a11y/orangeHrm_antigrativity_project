import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login';
import { AdminPage } from '../pages/adminpage';

test.describe.serial('OrangeHRM Admin Module Tests - AdminTest', () => {
    let loginPage: LoginPage;
    let adminPage: AdminPage;
    let testUsername: string;
    const defaultPassword = 'Password@123';

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        await loginPage.navigate();
        await loginPage.login('Admin', 'admin123');
        await expect(page).toHaveURL(/.*dashboard.*/);

        adminPage = new AdminPage(page);
        await adminPage.navigateToAdmin();
    });

    test('1. Verify that the Admin page opens successfully after login', async ({ page }) => {
        await expect(page).toHaveURL(/.*admin\/viewSystemUsers.*/);
        const headerTitle = await adminPage.getHeaderTitle();
        expect(headerTitle).toContain('Admin');
    });

    test('2. Verify Admin top navigation options', async () => {
        const topNavTabs = await adminPage.getTopNavOptions();
        expect(topNavTabs.length).toBeGreaterThan(0);
        expect(topNavTabs.some(tab => tab.includes('User Management'))).toBeTruthy();
    });

    test('3. Verify that the user management table is displayed', async ({ page }) => {
        await expect(page.locator(adminPage.userManagementTable)).toBeVisible();
        const rowCount = await adminPage.getTableRowCount();
        expect(rowCount).toBeGreaterThan(0);
    });

    test('4. Search for a user using a valid username', async () => {
        await adminPage.searchByUsername('Admin');
        const count = await adminPage.getTableRowCount();
        expect(count).toBeGreaterThanOrEqual(1);
        const firstUsername = await adminPage.getFirstRowUsername();
        expect(firstUsername).toBe('Admin');
    });

    test('5. Search using an invalid username', async () => {
        await adminPage.searchByUsername('NonExistent_InvalidUser_9999');
        const count = await adminPage.getTableRowCount();
        const noRecords = await adminPage.isNoRecordsFoundVisible();
        expect(count === 0 || noRecords).toBeTruthy();
    });

    test('6. Search users by user role', async () => {
        await adminPage.searchByUserRole('Admin');
        const count = await adminPage.getTableRowCount();
        expect(count).toBeGreaterThanOrEqual(1);
        const firstRole = await adminPage.getFirstRowRole();
        expect(firstRole).toBe('Admin');
    });

    test('7. Search users by employee name with autocomplete handling', async () => {
        const empName = await adminPage.getFirstRowEmployeeName();
        const hint = (empName && empName.trim().length > 0) ? empName.trim() : 'a';

        await adminPage.searchByEmployeeName(hint);
        const count = await adminPage.getTableRowCount();
        expect(count).toBeGreaterThanOrEqual(1);
        const returnedEmpName = await adminPage.getFirstRowEmployeeName();
        expect(returnedEmpName.toLowerCase()).toContain(hint.split(' ')[0].toLowerCase());
    });

    test('8. Search users by status', async () => {
        await adminPage.searchByStatus('Enabled');
        const count = await adminPage.getTableRowCount();
        expect(count).toBeGreaterThanOrEqual(1);
        const firstStatus = await adminPage.getFirstRowStatus();
        expect(firstStatus).toBe('Enabled');
    });

    test('9. Verify that the Reset button clears the search fields', async () => {
        await adminPage.searchByUsername('Admin');
        await adminPage.clickReset();

        const usernameVal = await adminPage.getUsernameSearchInputValue();
        expect(usernameVal).toBe('');
        const userRoleText = await adminPage.getUserRoleDropdownText();
        expect(userRoleText).toContain('-- Select --');
    });

    test('10. Click Add and verify that the Add User form opens', async ({ page }) => {
        await adminPage.clickAdd();
        await expect(page).toHaveURL(/.*admin\/saveSystemUser.*/);
        await expect(page.locator(adminPage.addUserHeader)).toBeVisible();
    });

    test('11. Verify required-field validation when saving incomplete form', async ({ page }) => {
        await adminPage.clickAdd();
        await adminPage.clickSave();

        const errors = page.locator(adminPage.requiredErrorMessage);
        await expect(errors.first()).toBeVisible();
        const errorCount = await errors.count();
        expect(errorCount).toBeGreaterThanOrEqual(4);
    });

    test('12. Add a user with valid and unique test data and verify creation', async ({ page }) => {
        const empName = await adminPage.getFirstRowEmployeeName();
        const hint = (empName && empName.trim().length > 0) ? empName.trim().split(' ')[0] : 'a';
        testUsername = 'TestUser' + Math.floor(Date.now() % 10000000);
        await adminPage.clickAdd();
        await adminPage.addNewUser('ESS', hint, 'Enabled', testUsername, defaultPassword);

        await expect(page).toHaveURL(/.*admin\/viewSystemUsers.*/);
        await adminPage.searchByUsername(testUsername);
        const isPresent = await adminPage.isUserPresentInTable(testUsername);
        expect(isPresent).toBeTruthy();
    });

    async function ensureTestUser() {
        if (!testUsername) {
            const empName = await adminPage.getFirstRowEmployeeName();
            const hint = (empName && empName.trim().length > 0) ? empName.trim().split(' ')[0] : 'a';
            testUsername = 'TestUser' + Math.floor(Date.now() % 10000000);
            await adminPage.clickAdd();
            await adminPage.addNewUser('ESS', hint, 'Enabled', testUsername, defaultPassword);
        }
    }

    test('13. Search for newly created user and verify details', async () => {
        await ensureTestUser();

        await adminPage.searchByUsername(testUsername);
        const isPresent = await adminPage.isUserPresentInTable(testUsername);
        expect(isPresent).toBeTruthy();
        expect(await adminPage.getFirstRowUsername()).toBe(testUsername);
        expect(await adminPage.getFirstRowRole()).toBe('ESS');
        expect(await adminPage.getFirstRowStatus()).toBe('Enabled');
    });

    test('14. Edit user details and verify that changes are saved', async () => {
        await ensureTestUser();

        await adminPage.searchByUsername(testUsername);
        await adminPage.clickEditUser(testUsername);
        await adminPage.editUserRole('Admin');

        await adminPage.searchByUsername(testUsername);
        expect(await adminPage.isUserPresentInTable(testUsername)).toBeTruthy();
        expect(await adminPage.getFirstRowRole()).toBe('Admin');
    });

    test('15. Change user status and verify the updated status', async () => {
        await ensureTestUser();

        await adminPage.searchByUsername(testUsername);
        await adminPage.clickEditUser(testUsername);
        await adminPage.editUserStatus('Disabled');

        await adminPage.searchByUsername(testUsername);
        expect(await adminPage.isUserPresentInTable(testUsername)).toBeTruthy();
        expect(await adminPage.getFirstRowStatus()).toBe('Disabled');
    });

    test('16. Cancel delete confirmation and verify that user remains in table', async ({ page }) => {
        await ensureTestUser();

        await adminPage.searchByUsername(testUsername);
        await adminPage.clickDeleteUser(testUsername);
        await expect(page.locator(adminPage.deleteModal)).toBeVisible();
        await expect(page.locator(adminPage.deleteModal)).toContainText('Are you Sure?');

        await adminPage.cancelDelete();
        await expect(page.locator(adminPage.deleteModal)).toBeHidden();

        expect(await adminPage.isUserPresentInTable(testUsername)).toBeTruthy();
    });

    test('17. Delete test user and verify that user is removed', async () => {
        await ensureTestUser();

        await adminPage.searchByUsername(testUsername);
        await adminPage.clickDeleteUser(testUsername);
        await adminPage.confirmDelete();

        await adminPage.searchByUsername(testUsername);
        const isPresent = await adminPage.isUserPresentInTable(testUsername);
        const noRecords = await adminPage.isNoRecordsFoundVisible();
        expect(!isPresent || noRecords).toBeTruthy();
    });

    test('18. Verify pagination if multiple pages are available', async () => {
        const hasPagination = await adminPage.isPaginationVisible();
        if (hasPagination) {
            const pageCount = await adminPage.getPageCount();
            if (pageCount > 1) {
                const clicked = await adminPage.clickPageNumber(2);
                expect(clicked).toBeTruthy();
            }
        } else {
            const rowCount = await adminPage.getTableRowCount();
            expect(rowCount).toBeGreaterThan(0);
        }
    });
});
