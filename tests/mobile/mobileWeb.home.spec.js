const { MobileWebHomePage } = require('../../pages/mobile/MobileWebHomePage');
const { getLocationConfig } = require('../../config/locations');

describe('Mattamy Homes mobile web - home page on Android Chrome', () => {
  let homePage;
  let location;

  beforeEach(async () => {
    homePage = new MobileWebHomePage();
    location = getLocationConfig();
    await homePage.open();
  });

  it('@ci @smoke @regression @sanity Home page should load correctly', async () => {
    await homePage.verifyLoaded();
  });

  it('@smoke @regression Validate hero section on Home Page', async () => {
    await homePage.validateHeroSection();
  });

  it('@smoke Header navigation should be visible', async () => {
    await homePage.verifyHeaderLinksVisible();
    await homePage.open();
    await homePage.openFindYourHome();
  });

  it('@smoke Footer should be visible with Privacy Policy link', async () => {
    await homePage.verifyFooterLoaded();
  });

  it('@regression Search market functionality should work', async () => {
    await homePage.searchByMarket(location.market);
    await homePage.verifySearchByMarket(location.market);
  });

  it('@regression Search by community functionality should work', async () => {
    await homePage.searchByCommunity(location.community);
    await homePage.verifySearchByCommunity(location.community);
  });

  it('@regression Search by QMI home functionality should work', async () => {
    await homePage.searchByQMI(location.qmiAddress);
    await homePage.verifySearchByQMI(location.qmiAddress);
  });

  it('@regression Search by plan functionality should work', async () => {
    await homePage.searchByPlan(location.planName);
    await homePage.verifySearchByPlan(location.expectedPlanUrlPart);
  });

  it('@regression Validate market Cards on Home Page', async () => {
    await homePage.validateMarketCards();
  });
});
