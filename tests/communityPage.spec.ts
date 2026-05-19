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

        test('@regression Validate overview copy, address, market details, and key attributes', async () => {
            await communityPage.verifyOverviewAddressMarketAndAttributes(location.community);
        });

        test('@regression Validate QMI card community name matches current community', async () => {
            await communityPage.verifyQmiCardCommunityNameMatchesCurrentCommunity(location.community);
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

    /**********Primary form Validation**********/

    test.describe('Form Validation', () => {
        test('@sanity Validate primary form required field errors', async () => {
            await communityPage.validatePrimaryFormEmptyErrors();
        });

        test('@sanity Validate primary form invalid email format', async () => {
            await communityPage.validatePrimaryFormInvalidEmail();
        });

        // test('@regression @STAGE Validate primary form successful submission', async () => {
        //     await communityPage.verifyPrimaryFormSuccessSubmission();
        // });

        /**********Footer form Validation**********/

        test('@sanity Validate footer form required field errors', async () => {
            await communityPage.validateFooterFormEmptyErrors();
        });

        test('@sanity Validate footer form invalid email format', async () => {
            await communityPage.validateFooterFormInvalidEmail();
        });

        // test('@regression @STAGE Validate footer form successful submission', async () => {
        //     await communityPage.verifyFooterFormSuccessSubmission();
        // });
    });
});
