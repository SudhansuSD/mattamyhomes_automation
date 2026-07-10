const { MobileWebHomePage } = require('../../pages/mobile/MobileWebHomePage');
const { getLocationConfig } = require('../../config/locations/locationConfig');

describe('Mattamy Homes mobile web - home page on mobile (Android/iOS)', function () {
  this.timeout(300000);

  let homePage;
  let location;

  beforeEach(async () => {
    homePage = new MobileWebHomePage();
    location = getLocationConfig();

    await homePage.open();
  });

  describe('Page Load & Layout', () => {
    it('TC-01 | @ci @smoke @regression @sanity | Home page should load correctly', async () => {
      await homePage.verifyLoaded();
    });

    it('TC-02 | @smoke @regression | Validate hero section on Home Page', async () => {
      await homePage.validateHeroSection();
    });

    it('TC-03 | @regression | Validate market Cards on Home Page', async () => {
      await homePage.validateMarketCards();
    });
  });

  describe('Header & Footer', () => {
    it('TC-01 | @smoke | Header navigation should be visible', async () => {
      await homePage.verifyHeaderLinksVisible();
      await homePage.open();
      await homePage.openFindYourHome();
    });

    it('TC-02 | @smoke | Footer should be visible with Privacy Policy link', async () => {
      await homePage.verifyFooterLoaded();
    });
  });

  describe('Search', () => {
    it('TC-01 | @regression | Search market functionality should work', async () => {
      await homePage.searchByMarket(location.market);
      await homePage.verifySearchByMarket(location.market);
    });

    it('TC-02 | @regression | Search by community functionality should work', async () => {
      await homePage.searchByCommunity(location.community);
      await homePage.verifySearchByCommunity(location.community);
    });

    it('TC-03 | @regression | Search by QMI home functionality should work', async () => {
      await homePage.searchByQMI(location.qmiAddress);
      await homePage.verifySearchByQMI(location.qmiAddress);
    });

    it('TC-04 | @regression | Search by plan functionality should work', async () => {
      await homePage.searchByPlan(location.planName);
      await homePage.verifySearchByPlan(location.expectedPlanUrlPart);
    });
  });
});
