const { MobileWebPlanPage } = require('../../pages/mobile/MobileWebPlanPage');
const { getLocationConfig } = require('../../config/locations');

describe('Mattamy Homes mobile web - plan detail page on Android Chrome', () => {
  let planPage;
  let location;

  beforeEach(async () => {
    planPage = new MobileWebPlanPage();
    location = getLocationConfig();

    await planPage.navigateToPlan(location);
    await planPage.verifyPageLoaded(location.planName);
  });

  it('@regression Validate Plan Detail page core content', async () => {
    await planPage.verifyPlanUrlContains(location.expectedPlanUrlPart);
    await planPage.verifyHeroSummaryForPlan(location.planName);
    await planPage.verifyHomeSpecsPresent();
    await planPage.verifyMobileCommunityLinkNavigation();
    await planPage.verifyGallery();
  });

  it('@regression Validate Plan Detail page media and interactive sections', async () => {
    await planPage.verifyInteractiveFloorPlanSection();
    await planPage.verifyExteriorStylesSection();
    await planPage.verifyMortgageCalculatorCta();
  });

  it('@regression Validate Plan Detail page conversion and contact sections', async () => {
    await planPage.verifyQuickMoveInHomesSection();
    await planPage.verifySalesOfficeSection();
    await planPage.verifyPlanDetailForm();
  });

  it('@sanity Validate plan detail form required field errors', async () => {
    await planPage.validatePlanDetailFormEmptyErrors();
  });

  it('@sanity Validate plan detail form invalid email format', async () => {
    await planPage.validatePlanDetailFormInvalidEmail();
  });

  it('@prod @regression Verify QMI Section on Plan Detail page', async () => {
    await planPage.verifyQMISection();
  });
});
