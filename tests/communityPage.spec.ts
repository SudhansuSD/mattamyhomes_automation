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
        test('TC-01 | @smoke @regression | Validate community core sections', async () => {
            await communityPage.verifyCoreSections();
        });

        test('TC-02 | @regression | Validate overview copy, address, market details, and key attributes', async () => {
            await communityPage.verifyOverviewAddressMarketAndAttributes(location.community);
        });

        test('TC-03 | @regression | Validate QMI card community name matches current community', async () => {
            await communityPage.verifyQmiCardCommunityNameMatchesCurrentCommunity(location.community);
        });
    });

    /* ==========================================================
       NAVIGATION VALIDATION
    ========================================================== */
    test.describe('Navigation Validation', () => {
        test('TC-01 | @regression | Validate all navigation links', async () => {
            await communityPage.verifyAllNavigationLinks();
        });

        test('TC-02 | @regression | Validate available homes navigation', async () => {
            await communityPage.verifyAvailableHomesNavigation();
        });

        test('TC-03 | @regression | Validate plans navigation', async () => {
            await communityPage.verifyPlansNavigation();
        });
    });

    /* ==========================================================
       FORM VALIDATION
    ========================================================== */

    test.describe('Lead Form', () => {
        test.describe('Get Information Form Validation', () => {
            test('TC-01 | @regression | Validate Get Information CTA opens community sideModalForm', async () => {
                await communityPage.verifyGetInformationCtaOpensLeadForm();
            });

            test('TC-02 | @smoke @regression | Validate community sideModalForm fields', async () => {
                await communityPage.verifySideModalFormFields();
            });

            test('TC-03 | @regression | Validate community sideModalForm required field errors', async () => {
                await communityPage.validateSideModalFormRequiredErrors();
            });

            test('TC-04 | @regression | Validate community sideModalForm invalid email format', async () => {
                await communityPage.validateSideModalFormInvalidEmail();
            });

            test.describe('Get Information form submission', () => {
                test.skip(
                    envName === 'PROD',
                    'Skipping Get Information form lead submission on PROD environment.'
                );

                test('TC-01 | @regression @STAGE | Validate community sideModalForm successful submission', async () => {
                    await communityPage.verifySideModalFormSuccessSubmission();
                });
            });
        });

        test.describe('Primary Form Validation', () => {
            test('TC-01 | @regression | Validate primary form required field errors', async () => {
                await communityPage.validatePrimaryFormEmptyErrors();
            });

            test('TC-02 | @regression | Validate primary form invalid email format', async () => {
                await communityPage.validatePrimaryFormInvalidEmail();
            });

            test.describe('Primary form submission', () => {
                test.skip(
                    envName === 'PROD',
                    'Skipping primary form lead submission on PROD environment.'
                );

                test('TC-01 | @regression @STAGE | Validate primary form successful submission', async () => {
                    await communityPage.verifyPrimaryFormSuccessSubmission();
                });
            });
        });

        test.describe('Footer Form Validation', () => {
            test('TC-01 | @regression | Validate footer form required field errors', async () => {
                await communityPage.validateFooterFormEmptyErrors();
            });

            test('TC-02 | @regression | Validate footer form invalid email format', async () => {
                await communityPage.validateFooterFormInvalidEmail();
            });

            test.describe('Footer form submission', () => {
                test.skip(
                    envName === 'PROD',
                    'Skipping footer form lead submission on PROD environment.'
                );

                test('TC-01 | @regression @STAGE | Validate footer form successful submission', async () => {
                    await communityPage.verifyFooterFormSuccessSubmission();
                });
            });
        });
    });

    test.describe('Media Validation', () => {
        test('TC-01 | @regression | Validate community page image and video URLs return 200', async () => {
            await communityPage.validateImageAndVideoUrlsReturn200('Community page');
        });
    });
});
