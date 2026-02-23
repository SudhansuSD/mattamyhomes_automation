import { test } from '@playwright/test';
import { QMIPage } from '../pages/QMIPage';
import { getLocationConfig } from '../config/locations';


const location = getLocationConfig();

test.describe(`Mattamy Homes - ${location.country}`, () => {

    test(`Validate QMI Detail page UI and functionality - ${location.country}`, async ({ page }) => {

        const qmiPage = new QMIPage(page);

        await qmiPage.navigate();
        await qmiPage.searchByQMI(location.qmiAddress);
        await qmiPage.verifySearchByQMI(location.qmiAddress);
        await qmiPage.verifyPageLoaded();
        await qmiPage.verifyGallery();
        await qmiPage.verifyFloorPlan();
        await qmiPage.verifyFeaturesAccordion();
        await qmiPage.verifyMortgagePopup();
        await qmiPage.verifyCommunityNavigation();
    });

});


