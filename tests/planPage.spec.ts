import { test } from '@playwright/test';
import { getLocationConfig } from '../config/locations';
import { PlanDetailPage } from '../pages/PlanDetailPage';


const location = getLocationConfig();

test.describe(`Mattamy Homes - ${location.country}`, () => {

    test(`Validate Plan Detail page UI and functionality - ${location.country}`, async ({ page }) => {

        const planPage = new PlanDetailPage(page);

        await planPage.navigate();
        await planPage.searchByPlan(location.planName);
        await planPage.verifyPageLoaded();
        await planPage.verifySearchByPlan(location.expectedPlanUrlPart);
        await planPage.verifyHeroSection();
        await planPage.verifyBreadcrumb();
        await planPage.verifyPriceOrCTA();
        await planPage.verifyGallery();
        await planPage.verifyFloorPlan();
        await planPage.verifyMortgageForm();
        await planPage.verifyCommunityNavigation();
    });

    test(`Verify QMI Section on Plan Detail page - ${location.country}`, async ({ page }) => {
        const planPage = new PlanDetailPage(page);
        await planPage.navigate();
        await planPage.searchByPlan(location.planName);
        await planPage.verifySearchByPlan(location.expectedPlanUrlPart);
        await planPage.verifyQMISection();
    });

});



