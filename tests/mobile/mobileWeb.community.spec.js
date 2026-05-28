const {
  MobileWebCommunityPage,
} = require("../../pages/mobile/MobileWebCommunityPage");
const { getLocationConfig } = require("../../config/locations");

describe("Mattamy Homes mobile web - community page on Android Chrome", () => {
  let communityPage;
  let location;

  beforeEach(async () => {
    communityPage = new MobileWebCommunityPage();
    location = getLocationConfig();

    await communityPage.openCommunity(location);
  });

  it("@regression Validate community core sections", async () => {
    await communityPage.verifySearchByCommunity(location.community);
    await communityPage.verifyCoreSections();
  });

  it("@regression Validate overview copy, address, market details, and key attributes", async () => {
    await communityPage.verifyOverviewAddressMarketAndAttributes(location.community);
  });

  it("@regression Validate QMI card community name matches current community", async () => {
    await communityPage.verifyQmiCardCommunityNameMatchesCurrentCommunity(location.community);
  });

  it("@regression Validate all navigation links", async () => {
    await communityPage.verifyAllNavigationLinks();
  });

  it("@regression Validate available homes navigation", async () => {
    await communityPage.verifyAvailableHomesNavigation();
  });

  it("@regression Validate plans navigation", async () => {
    await communityPage.verifyPlansNavigation();
  });

  it("@sanity Validate primary form required field errors", async () => {
    await communityPage.validatePrimaryFormEmptyErrors();
  });

  it("@sanity Validate primary form invalid email format", async () => {
    await communityPage.validatePrimaryFormInvalidEmail();
  });

  it("@sanity Validate footer form required field errors", async () => {
    await communityPage.validateFooterFormEmptyErrors();
  });

  it("@sanity Validate footer form invalid email format", async () => {
    await communityPage.validateFooterFormInvalidEmail();
  });
});
