import { MobileWebQMIPage } from '../../pages/mobile/MobileWebQMIPage';
import { getEnvConfig } from '../../config/environments/envConfig';
import { getLocationConfig } from '../../config/locations/locationConfig';

describe('Mattamy Homes mobile web - QMI detail page on mobile (Android/iOS)', function () {
  this.timeout(300000);

  let qmiPage;
  let location;
  const { envName } = getEnvConfig();

  beforeEach(async () => {
    qmiPage = new MobileWebQMIPage();
    location = getLocationConfig();

    await qmiPage.searchAndValidateByValue('qmi', location.qmiAddress);
  });

  describe('Hero & Overview', () => {
    it('TC-01 | @smoke @regression | Validate QMI hero content and URL', async () => {
      await qmiPage.verifyExactQmiUrl();
      await qmiPage.verifyHeroSection(location.qmiAddress);
      await qmiPage.verifyHeroHomeFacts();
      await qmiPage.verifyPriceOrCTA();
      await qmiPage.verifyGetInformationScrollsToForm();
    });
  });

  describe('Media & Content', () => {
    it('TC-01 | @regression | Validate QMI page media and content sections', async () => {
      await qmiPage.verifyGallery();
      await qmiPage.verifyFloorPlan();
      await qmiPage.verifyInteractiveFloorPlan();
      await qmiPage.verifyCommunitySitemap();
    });

    it('TC-02 | @regression | Validate QMI home details and features', async () => {
      await qmiPage.verifyHomeDesignDetails();
      await qmiPage.verifyHomeFeatures();
    });
  });

  describe('Sales Office & Related Homes', () => {
    it('TC-01 | @regression | Validate QMI sales office and related homes', async () => {
      await qmiPage.verifySalesOfficeAndContactForm();
    });

    it('TC-02 | @regression @qmi-related-log | Validate QMI related homes names and URLs', async () => {
      await qmiPage.verifyRelatedQuickMoveInHomes();
    });
  });

  describe('Lead Form', () => {
    it('TC-01 | @smoke @regression @qmi-form-fields | Validate QMI form fields', async () => {
      await qmiPage.validateQmiFormFields();
    });

    it('TC-02 | @regression @qmi-form-required | Validate QMI form required field errors', async () => {
      await qmiPage.validateQmiFormRequiredErrors();
    });

    it('TC-03 | @regression @qmi-form-email | Validate QMI form invalid email validation', async () => {
      await qmiPage.validateQmiFormInvalidEmail();
    });

    it('TC-04 | @regression @STAGE @qmi-form-submit | Validate QMI form successful submission', async function () {
      if (envName === 'PROD') {
        this.skip();
      }

      await qmiPage.verifyQmiFormSuccessSubmission();
    });
  });

  describe('Mortgage & Navigation', () => {
    it('TC-01 | @regression | Validate QMI mortgage popup functionality', async () => {
      await qmiPage.verifyMortgagePopup();
    });

    it('TC-02 | @regression @qmi-breadcrumb-log | Validate QMI breadcrumb names and URLs', async () => {
      await qmiPage.verifyBreadcrumbNavigation();
      await qmiPage.verifyBreadcrumbLinks();
    });

    it('TC-03 | @regression @qmi-plan-link | Validate QMI plan name link and URL', async () => {
      await qmiPage.verifyPlanNameLinkNavigation();
    });
  });
});
