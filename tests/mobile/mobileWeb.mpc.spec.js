const { MobileWebMPCPage } = require('../../pages/mobile/MobileWebMPCPage');
const { getEnvConfig } = require('../../config/environments/envConfig');
const { getLocationConfig } = require('../../config/locations/locationConfig');

describe('Mattamy Homes mobile web - MPC page on mobile (Android/iOS)', function () {
  this.timeout(300000);

  let location;
  let mpc;
  let mpcPage;
  const { envName } = getEnvConfig();

  beforeEach(async function () {
    location = getLocationConfig();
    mpc = location.country === 'USA' && Array.isArray(location.mpc)
      ? location.mpc[0]
      : undefined;

    if (!mpc) {
      this.skip();
    }

    mpcPage = new MobileWebMPCPage();
    await mpcPage.openMpc(mpc);
  });

  describe('Page Load and Hero', () => {
    it('TC-01 | @smoke | Validate MPC page loads with hero content', async () => {
      await mpcPage.validateHeroContent(mpc.name);
    });
  });

  describe('Tab Validation', () => {
    it('TC-01 | @regression | Validate summary tab content', async () => {
      await mpcPage.validateSummaryTab();
    });

    it('TC-02 | @regression | Validate home details tab content', async () => {
      await mpcPage.validateHomeDetailsTab();
    });

    it('TC-03 | @regression | Validate contact and hours tab content', async () => {
      await mpcPage.validateContactHoursTab();
    });
  });

  describe('Content Sections', () => {
    it('TC-01 | @regression | Validate amenities and location convenience sections', async () => {
      await mpcPage.validateAmenityAndLocationSections();
    });

    it('TC-02 | @regression | Validate community promotion CTA', async () => {
      await mpcPage.validatePromotionCTA(mpc.url);
    });

    it('TC-03 | @regression | Validate image gallery if available', async () => {
      await mpcPage.validateImageGalleryIfAvailable();
    });
  });

  describe('Neighborhood Cards', () => {
    it('TC-01 | @regression | Validate neighborhood card details', async () => {
      await mpcPage.validateNeighborhoodCards(mpc.name, mpc.url);
    });

    it('TC-02 | @regression | Validate first neighborhood navigation', async () => {
      await mpcPage.validateFirstNeighborhoodNavigation(mpc.url);
    });
  });

  describe('Form Validation', () => {
    it('TC-01 | @sanity | Validate Get Information CTA opens MPC lead form', async () => {
      await mpcPage.verifyGetInformationCtaOpensLeadForm();
    });

    it('TC-02 | @sanity | Validate Get Information form required field errors', async () => {
      await mpcPage.validateGetInformationFormEmptyErrors();
    });

    it('TC-03 | @sanity | Validate Get Information form invalid email format', async () => {
      await mpcPage.validateGetInformationFormInvalidEmail();
    });

    it('TC-04 | @regression @STAGE | Validate Get Information form successful submission', async function () {
      if (envName === 'PROD') {
        this.skip();
      }

      await mpcPage.verifyGetInformationFormSuccessSubmission();
    });

    it('TC-05 | @sanity | Validate MPC community update form fields', async () => {
      await mpcPage.validateCommunityUpdateFormFields();
    });

    it('TC-06 | @sanity | Validate MPC community update form required field errors', async () => {
      await mpcPage.validateCommunityUpdateRequiredErrors();
    });

    it('TC-07 | @sanity | Validate MPC community update form invalid email error', async () => {
      await mpcPage.validateCommunityUpdateInvalidEmail();
    });
  });

  describe('Media Validation', () => {
    it('TC-01 | @regression | Validate MPC page image and video URLs return 200', async () => {
      await mpcPage.validateImageAndVideoUrlsReturn200('MPC page');
    });
  });
});
