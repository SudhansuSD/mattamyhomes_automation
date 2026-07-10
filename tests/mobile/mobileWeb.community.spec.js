const {
  MobileWebCommunityPage,
} = require("../../pages/mobile/MobileWebCommunityPage");
const { getEnvConfig } = require("../../config/environments/envConfig");
const { getLocationConfig } = require("../../config/locations/locationConfig");

describe("Mattamy Homes mobile web - community page on mobile (Android/iOS)", function () {
  this.timeout(300000);

  let communityPage;
  let location;
  const { envName } = getEnvConfig();

  beforeEach(async () => {
    communityPage = new MobileWebCommunityPage();
    location = getLocationConfig();

    await communityPage.searchAndValidateByValue("community", location.community);
  });

  describe("UI Validation", () => {
    it("TC-01 | @regression | Validate community core sections", async () => {
      await communityPage.verifyCoreSections();
    });

    it("TC-02 | @regression | Validate overview copy, address, market details, and key attributes", async () => {
      await communityPage.verifyOverviewAddressMarketAndAttributes(location.community);
    });

    it("TC-03 | @regression | Validate QMI card community name matches current community", async () => {
      await communityPage.verifyQmiCardCommunityNameMatchesCurrentCommunity(location.community);
    });
  });

  describe("Navigation Validation", () => {
    it("TC-01 | @regression | Validate all navigation links", async () => {
      await communityPage.verifyAllNavigationLinks();
    });

    it("TC-02 | @regression | Validate available homes navigation", async () => {
      await communityPage.verifyAvailableHomesNavigation();
    });

    it("TC-03 | @regression | Validate plans navigation", async () => {
      await communityPage.verifyPlansNavigation();
    });
  });

  describe("Lead Form", () => {
    it("TC-01 | @sanity | Validate primary form required field errors", async () => {
      await communityPage.validatePrimaryFormEmptyErrors();
    });

    it("TC-02 | @sanity | Validate primary form invalid email format", async () => {
      await communityPage.validatePrimaryFormInvalidEmail();
    });

    it("TC-03 | @regression @STAGE | Validate primary form successful submission", async function () {
      if (envName === "PROD") {
        this.skip();
      }

      await communityPage.verifyPrimaryFormSuccessSubmission();
    });

    it("TC-04 | @sanity | Validate footer form required field errors", async () => {
      await communityPage.validateFooterFormEmptyErrors();
    });

    it("TC-05 | @sanity | Validate footer form invalid email format", async () => {
      await communityPage.validateFooterFormInvalidEmail();
    });

    it("TC-06 | @regression @STAGE | Validate footer form successful submission", async function () {
      if (envName === "PROD") {
        this.skip();
      }

      await communityPage.verifyFooterFormSuccessSubmission();
    });
  });
});
