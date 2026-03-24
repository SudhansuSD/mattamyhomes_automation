import { test } from '@playwright/test';
import { CommunityPage } from '../pages/CommunityPage';
import { getLocationConfig } from '../config/locations';

const location = getLocationConfig();

test.describe(`Community Detail - ${location.community}`, () => {
    let communityPage: CommunityPage;

    /* ==========================================================
       Setup
    ========================================================== */
    test.beforeEach(async ({ page }) => {
        communityPage = new CommunityPage(page);

        await test.step('Navigate & search community', async () => {
            await communityPage.navigate();
            await communityPage.searchByCommunity(location.community);
            await communityPage.verifySearchByCommunity(location.community);
        });
    });

    /* ==========================================================
       UI VALIDATION
    ========================================================== */
    test.describe('UI Validation', () => {
        test('@regression Validate community core sections', async () => {
            await communityPage.verifyCoreSections();
        });
    });

    /* ==========================================================
       NAVIGATION VALIDATION
    ========================================================== */
    test.describe('Navigation Validation', () => {
        test('@regression Validate all navigation links', async () => {
            await communityPage.verifyAllNavigationLinks();
        });

        test('@regression Validate available homes navigation', async () => {
            await communityPage.verifyAvailableHomesNavigation();
        });

        test('@regression Validate plans navigation', async () => {
            await communityPage.verifyPlansNavigation();
        });
    });

    /* ==========================================================
       FORM VALIDATION
    ========================================================== */
    test.describe('Form Validation', () => {
        test.beforeEach(async () => {
            await communityPage.viewForm();
        });

        test('@sanity Validate required field errors', async () => {
            await communityPage.validateEmptyFormErrors();
        });

        test('@sanity Validate invalid email format', async () => {
            await communityPage.validateInvalidEmail();
        });

        // Enable only for stage env if needed
        // test('@regression @STAGE Validate successful form submission', async () => {
        //   await communityPage.verifySuccessFormSubmission();
        // });
    });
});