import { test } from '@playwright/test';
import { CommunityPage } from '../pages/CommunityPage';
import { getLocationConfig } from '../config/locations';

const location = getLocationConfig();

test.describe(`Community Detail - ${location.community}`, () => {

    let communityPage: CommunityPage;

    /* ==========================================================
       Common Setup
    ========================================================== */

    test.beforeEach(async ({ page }) => {

        communityPage = new CommunityPage(page);

        await test.step('Navigate to Community detail page', async () => {
            await communityPage.navigate();
            await communityPage.searchByCommunity(location.community);
            await communityPage.verifySearchByCommunity(location.community);
        });

    });

    /* ==========================================================
       UI VALIDATION
    ========================================================== */

    test('@regression Validate community core sections', async () => {

        await test.step('Verify core sections visibility', async () => {
            await communityPage.verifyCoreSections();
        });

    });

    /* ==========================================================
       NAVIGATION VALIDATION
    ========================================================== */

    test('@regression Validate all navigation links', async () => {

        await test.step('Verify all anchor links are valid', async () => {
            await communityPage.verifyAllNavigationLinks();
        });

    });

    test('@regression Validate available homes navigation', async () => {

        await test.step('Verify navigation to Quick Move-In page', async () => {
            await communityPage.verifyAvailableHomesNavigation();
        });

    });

    test('@regression Validate plans navigation', async () => {

        await test.step('Verify navigation to Plan page', async () => {
            await communityPage.verifyPlansNavigation();
        });

    });

    /* ==========================================================
       FORM VALIDATION (NO SUBMISSION)
    ========================================================== */

    test('@sanity Validate form required field errors', async () => {

        await test.step('Scroll to form', async () => {
            await communityPage.viewForm();
        });

        await test.step('Validate empty form required errors', async () => {
            await communityPage.validateEmptyFormErrors();
        });

    });

    test('@sanity Validate invalid email format', async () => {

        await test.step('Scroll to form', async () => {
            await communityPage.viewForm();
        });

        await test.step('Validate invalid email error message', async () => {
            await communityPage.validateInvalidEmail();
        });

    });
    // test('@regression @STAGE Validate successful form submission', async () => {

    //     await test.step('Scroll to form', async () => {
    //         await communityPage.viewForm();
    //     });

    //     await test.step('Fill out and submit form', async () => {
    //         await communityPage.verifySuccessFormSubmission();
    //     });
    //  });

});