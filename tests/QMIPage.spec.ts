/**
 * ENV=STAGE COUNTRY=USA npx playwright test tests/qmiPage.spec.ts
 * QMI Detail Page Tests
 * @file tests/qmiPage.spec.ts
 */

import { test } from '@playwright/test';
import { QMIPage } from '../pages/QMIPage';
import { getLocationConfig } from '../config/locations';

const location = getLocationConfig();

test.describe(`QMI Detail Page Tests - ${location.country}`, () => {

    let qmiPage: QMIPage;

    /* -------------------------------------------------------
       Common Setup
    -------------------------------------------------------- */

    test.beforeEach(async ({ page }) => {
        qmiPage = new QMIPage(page);

        await test.step('Navigate to QMI detail page', async () => {
            await qmiPage.navigate();
            await qmiPage.searchByQMI(location.qmiAddress);
            await qmiPage.verifySearchByQMI(location.qmiAddress);
            await qmiPage.verifyPageLoaded();
        });
    });

    /* -------------------------------------------------------
       UI & Functionality Validation
    -------------------------------------------------------- */

    test('@regression Validate QMI Detail page UI and functionality', async () => {

        await test.step('Verify image gallery functionality', async () => {
            await qmiPage.verifyGallery();
        });

        await test.step('Verify floor plan section', async () => {
            await qmiPage.verifyFloorPlan();
        });

        await test.step('Verify features accordion behavior', async () => {
            await qmiPage.verifyFeaturesAccordion();
        });

        await test.step('Verify mortgage popup functionality', async () => {
            await qmiPage.verifyMortgagePopup();
        });

        await test.step('Verify community navigation link', async () => {
            await qmiPage.verifyCommunityNavigation();
        });

    });

});