const { MobileWebSearchPage } = require('../../pages/mobile/MobileWebSearchPage');
const { getLocationConfig } = require('../../config/locations/locationConfig');

describe('Mattamy Homes mobile web - Search Page on Android Chrome', function () {
  this.timeout(300000);

  let searchPage;
  let location;

  beforeEach(async () => {
    searchPage = new MobileWebSearchPage();
    location = getLocationConfig();

    await searchPage.navigate();
    await searchPage.searchByMarket(location.market);
    await searchPage.verifySearchByMarket(location.market);
  });

  describe('Result Tabs', () => {
    it('TC-01 | @sanity | Verify community results functionality', async () => {
      await searchPage.verifyResults('Communities');
    });

    it('TC-02 | @sanity | Verify plan results functionality', async () => {
      await searchPage.verifyResults('Plans');
    });

    it('TC-03 | @sanity | Verify QMI results functionality', async () => {
      await searchPage.verifyResults('Quick Move-Ins');
    });
  });

  describe('Result Cards', () => {
    it('TC-01 | @regression | Verify search result cards display required details', async () => {
      await searchPage.validateAllResultCardsRequiredDetails();
    });

    it('TC-02 | @regression | Verify result card CTAs navigate to correct detail pages', async () => {
      await searchPage.validateAllResultCardCtaNavigation();
    });
  });

  describe('Filters', () => {
    it('TC-01 | @regression | Verify filter by price functionality', async () => {
      await searchPage.filterByPrice(400000, 500000);
      await searchPage.validatePriceRangeAcrossTabs(400000, 500000);
    });

    it('TC-02 | @regression | Validate filter by beds and bathrooms functionality', async () => {
      await searchPage.filterByBedroomsAndBathrooms(3, 3);
      await searchPage.validateBedsBathsAcrossTabs(3, 3);
    });

    it('TC-03 | @regression | Verify Clear Reset filters behavior', async () => {
      await searchPage.validateClearResetFiltersBehavior();
    });
  });

  describe('Sorting', () => {
    it('TC-01 | @regression | Validate community sorting options', async () => {
      await searchPage.validateCommunitySortOptions();
      await searchPage.validateSortingBehavior('Communities');
    });

    it('TC-02 | @regression | Validate Plan sorting options', async () => {
      await searchPage.validatePlanSortOptions();
      await searchPage.validateSortingBehavior('Plans');
    });

    it('TC-03 | @regression | Validate QMI sorting options', async () => {
      await searchPage.validateQMISortOptions();
      await searchPage.validateSortingBehavior('Quick Move-Ins');
    });
  });
});
