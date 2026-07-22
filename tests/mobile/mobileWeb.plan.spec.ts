import { MobileWebPlanPage } from '../../pages/mobile/MobileWebPlanPage';
import { getEnvConfig } from '../../config/environments/envConfig';
import { getLocationConfig } from '../../config/locations/locationConfig';

describe('Mattamy Homes mobile web - plan detail page on mobile (Android/iOS)', function () {
  this.timeout(300000);

  let planPage;
  let location;
  const { envName } = getEnvConfig();

  beforeEach(async () => {
    planPage = new MobileWebPlanPage();
    location = getLocationConfig();

    await planPage.searchAndValidateByValue('plan', location.planName);
  });

  describe('UI & Functional Validation', () => {
    it('TC-01 | @smoke @regression | Validate Plan Detail page core content', async () => {
      await planPage.verifyPlanUrlContains(location.expectedPlanUrlPart);
      await planPage.verifyHeroSummaryForPlan(location.planName);
      await planPage.verifyHomeSpecsPresent();
      await planPage.verifyMobileCommunityLinkNavigation();
      await planPage.verifyGallery();
    });

    it('TC-02 | @regression | Validate Plan Detail page media and interactive sections', async () => {
      await planPage.verifyInteractiveFloorPlanSection();
      await planPage.verifyExteriorStylesSection();
      await planPage.verifyMortgageCalculatorCta();
    });

    it('TC-03 | @regression | Validate Plan Detail page conversion and contact sections', async () => {
      await planPage.verifyQuickMoveInHomesSection();
      await planPage.verifySalesOfficeSection();
      await planPage.verifyPlanDetailForm();
    });
  });

  describe('Form Validation', () => {
    it('TC-01 | @regression | Validate plan detail form required field errors', async () => {
      await planPage.validatePlanDetailFormEmptyErrors();
    });

    it('TC-02 | @regression | Validate plan detail form invalid email format', async () => {
      await planPage.validatePlanDetailFormInvalidEmail();
    });

    it('TC-03 | @regression @STAGE | Validate plan detail form successful submission', async function () {
      if (envName === 'PROD') {
        this.skip();
      }

      await planPage.verifyPlanDetailFormSuccessSubmission();
    });
  });

  describe('QMI Section', () => {
    it('TC-01 | @prod @regression | Verify QMI Section on Plan Detail page', async () => {
      await planPage.verifyQMISection();
    });
  });
});
