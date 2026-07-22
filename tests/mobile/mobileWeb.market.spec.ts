import { MobileWebMarketPage } from '../../pages/mobile/MobileWebMarketPage';
import { getEnvConfig } from '../../config/environments/envConfig';
import { getLocationConfig } from '../../config/locations/locationConfig';

describe('Mattamy Homes mobile web - Market page on mobile (Android/iOS)', function () {
  this.timeout(300000);

  let location;
  let configuredMarket;
  let marketPage;
  const { envName } = getEnvConfig();

  beforeEach(function () {
    location = getLocationConfig();
    marketPage = new MobileWebMarketPage();
    configuredMarket =
      location.markets.find((market) =>
        market.name
          .split('||')
          .map((name) => name.trim())
          .includes(location.market)
      ) || location.markets[0];
  });

  /* ==========================================================
     BASIC MARKET VALIDATION (ALL MARKETS)
  ========================================================== */

  describe('Basic Market Validation', () => {
    it('TC-01 | @smoke @regression | Validate all markets navigation and heading', async () => {
      for (const market of location.markets) {
        await marketPage.openMarket(market);
        await marketPage.verifyMarketPage(market);
      }
    });
  });

  /* ==========================================================
     CONFIGURED MARKET DEEP VALIDATION
  ========================================================== */

  describe('Configured Market Deep Validation', () => {
    beforeEach(async () => {
      await marketPage.openMarket(configuredMarket);
    });

    describe('Page Context and Hero', () => {
      it('TC-01 | @smoke @regression | Validate mobile browser context (user agent and viewport)', async () => {
        await marketPage.verifyLoaded(configuredMarket);
      });

      it('TC-02 | @regression | Validate market hero content and key search links', async () => {
        await marketPage.validateHeroContent(configuredMarket);
        await marketPage.validateMarketSearchLinks(configuredMarket);
      });
    });

    describe('Community Cards', () => {
      it('TC-01 | @regression | Validate community cards section', async () => {
        await marketPage.validateCommunityCards(configuredMarket);
      });

      it('TC-02 | @regression | Validate community card details', async () => {
        await marketPage.validateCommunityCardDetails(configuredMarket);
      });

      it('TC-03 | @regression | Validate first community card navigation', async () => {
        await marketPage.validateFirstCommunityCardNavigation(configuredMarket);
      });
    });

    describe('Discover Our Homes', () => {
      it('TC-01 | @regression | Validate Discover Our Homes section links', async () => {
        await marketPage.validateDiscoverOurHomesSection(configuredMarket);
      });
    });

    describe('Mobile Navigation', () => {
      it('TC-01 | @regression | Validate mobile hamburger navigation exposes key links', async () => {
        await marketPage.verifyHeaderNavigation(configuredMarket);
      });
    });

    describe('Lead Form Validation', () => {
      beforeEach(function () {
        // Mirror the desktop guard: no market lead form is available for Canada.
        if (location.country === 'CAN') {
          this.skip();
        }
      });

      it('TC-01 | @smoke @regression | Validate market lead form fields', async () => {
        await marketPage.validateLeadFormFields(configuredMarket);
      });

      it('TC-02 | @regression | Validate market lead form required field errors', async () => {
        await marketPage.validateLeadFormRequiredErrors(configuredMarket);
      });

      it('TC-03 | @regression | Validate market lead form invalid email error', async () => {
        await marketPage.validateLeadFormInvalidEmail(configuredMarket);
      });

      it('TC-04 | @regression @STAGE | Validate market lead form successful submission', async function () {
        if (envName === 'PROD') {
          this.skip();
        }

        await marketPage.submitLeadFormSuccessfully(configuredMarket);
      });
    });

    describe('Media Validation', () => {
      it('TC-01 | @regression | Validate market page image and video URLs return 200', async () => {
        await marketPage.validateImageAndVideoUrlsReturn200('Market page', configuredMarket);
      });
    });
  });
});
