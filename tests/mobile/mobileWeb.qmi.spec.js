const { MobileWebQMIPage } = require('../../pages/mobile/MobileWebQMIPage');
const { getLocationConfig } = require('../../config/locations/locationConfig');

describe('Mattamy Homes mobile web - QMI detail page on Android Chrome', function () {
  this.timeout(300000);

  let qmiPage;
  let location;

  before(async function () {
    this.timeout(300000);

    qmiPage = new MobileWebQMIPage();
    location = getLocationConfig();

    await qmiPage.open();
    await qmiPage.searchByQMI(location.qmiAddress, {
      allowDirectFallback: false,
    });
    await qmiPage.verifySearchByQMI(location.qmiAddress);
    await qmiPage.verifyPageLoaded(location.qmiAddress);
  });

  it('@smoke Validate QMI hero content and URL', async () => {
    await qmiPage.verifyExactQmiUrl();
    await qmiPage.verifyHeroSection(location.qmiAddress);
    await qmiPage.verifyHeroHomeFacts();
    await qmiPage.verifyPriceOrCTA();
    await qmiPage.verifyGetInformationScrollsToForm();
  });

  it('@regression Validate QMI page media and content sections', async () => {
    await qmiPage.verifyGallery();
    await qmiPage.verifyFloorPlan();
    await qmiPage.verifyInteractiveFloorPlan();
    await qmiPage.verifyCommunitySitemap();
  });

  it('@regression Validate QMI home details and features', async () => {
    await qmiPage.verifyHomeDesignDetails();
    await qmiPage.verifyHomeFeatures();
  });

  it('@regression Validate QMI sales office and related homes', async () => {
    await qmiPage.verifySalesOfficeAndContactForm();
  });

  it('@regression @qmi-related-log Validate QMI related homes names and URLs', async () => {
    await qmiPage.verifyRelatedQuickMoveInHomes();
  });

  it('@regression @qmi-form-fields Validate QMI form fields', async () => {
    await qmiPage.validateQmiFormFields();
  });

  it('@regression @qmi-form-required Validate QMI form required field errors', async () => {
    await qmiPage.validateQmiFormRequiredErrors();
  });

  it('@regression @qmi-form-email Validate QMI form invalid email validation', async () => {
    await qmiPage.validateQmiFormInvalidEmail();
  });

  it('@regression Validate QMI mortgage popup functionality', async () => {
    await qmiPage.verifyMortgagePopup();
  });

  it('@regression @qmi-plan-link Validate QMI plan name link and URL', async () => {
    await qmiPage.verifyPlanNameLinkNavigation();
  });
});
