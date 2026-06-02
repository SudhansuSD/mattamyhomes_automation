import { test } from '@playwright/test';
import { getEnvConfig } from '../config/environments/envConfig';
import { getLocationConfig } from '../config/locations/locationConfig';
import { CommunityPage } from '../pages/CommunityPage';

const location = getLocationConfig();
const { envName } = getEnvConfig();

test.describe(`Community Detail - ${location.community}`, () => {
    let communityPage: CommunityPage;

    /* ==========================================================
       Setup
    ========================================================== */
    test.beforeEach(async ({ page }) => {
        communityPage = new CommunityPage(page);

        await test.step('Navigate & search community', async () => {
            await communityPage.searchAndValidateByValue('community', location.community);
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

    test.describe('Form Validation', () => {
        
        /**********Modal form Validation**********/

        test('@sanity Validate Get Information CTA opens community lead form', async () => {
            await communityPage.verifyGetInformationCtaOpensLeadForm();
        });

        test('@sanity Validate Get Information form required field errors', async () => {
            await communityPage.validateGetInformationFormEmptyErrors();
        });

        test('@sanity Validate Get Information form invalid email format', async () => {
            await communityPage.validateGetInformationFormInvalidEmail();
        });

        // test('@regression @STAGE Validate Get Information form successful submission', async () => {
        //     test.skip(envName === 'PROD', 'Skipping Get Information form lead submission on PROD environment.');
        //     await communityPage.verifyGetInformationFormSuccessSubmission();
        // });

        /**********Primary form Validation**********/

        test('@sanity Validate primary form required field errors', async () => {
            await communityPage.validatePrimaryFormEmptyErrors();
        });

        test('@sanity Validate primary form invalid email format', async () => {
            await communityPage.validatePrimaryFormInvalidEmail();
        });

        // test('@regression @STAGE Validate primary form successful submission', async () => {
        //     test.skip(envName === 'PROD', 'Skipping primary form lead submission on PROD environment.');
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
        //     test.skip(envName === 'PROD', 'Skipping footer form lead submission on PROD environment.');
        //     await communityPage.verifyFooterFormSuccessSubmission();
        // });
    });
});
