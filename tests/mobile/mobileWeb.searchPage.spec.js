const { MobileWebSearchPage } = require('../../pages/mobile/MobileWebSearchPage');
const { getLocationConfig } = require('../../config/locations');

describe('Mattamy Homes mobile web - Search Page on Android Chrome', () => {
  let searchPage;
  let location;

  beforeEach(async () => {
    searchPage = new MobileWebSearchPage();
    location = getLocationConfig();

    await searchPage.navigate();
    await searchPage.searchByMarket(location.market);
    await searchPage.verifySearchByMarket(location.market);
  });

  it('@sanity Verify community results functionality', async () => {
    await searchPage.verifyResults('Communities');
  });

  it('@sanity Verify plan results functionality', async () => {
    await searchPage.verifyResults('Plans');
  });

  it('@sanity Verify QMI results functionality', async () => {
    await searchPage.verifyResults('Quick Move-Ins');
  });

  it('@regression Verify search result cards display required details', async () => {
    await searchPage.validateAllResultCardsRequiredDetails();
  });

  it('@regression Verify result card CTAs navigate to correct detail pages', async () => {
    await searchPage.validateAllResultCardCtaNavigation();
  });

  it('@regression Verify filter by price functionality', async () => {
    await searchPage.filterByPrice(400000, 500000);
    await searchPage.validatePriceRangeAcrossTabs(400000, 500000);
  });

  it('@regression Validate filter by beds and bathrooms functionality', async () => {
    await searchPage.filterByBedroomsAndBathrooms(3, 3);
    await searchPage.validateBedsBathsAcrossTabs(3, 3);
  });

  it('@regression Verify Clear Reset filters behavior', async () => {
    await searchPage.validateClearResetFiltersBehavior();
  });

  it('@regression Validate community sorting options', async () => {
    await searchPage.validateCommunitySortOptions();
    await searchPage.validateSortingBehavior('Communities');
  });

  it('@regression Validate Plan sorting options', async () => {
    await searchPage.validatePlanSortOptions();
    await searchPage.validateSortingBehavior('Plans');
  });

  it('@regression Validate QMI sorting options', async () => {
    await searchPage.validateQMISortOptions();
    await searchPage.validateSortingBehavior('Quick Move-Ins');
  });
});
