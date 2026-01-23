import { When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/bddConfig';
import { expect } from '@playwright/test';

// Market search step is defined in `homePageSteps.ts` to avoid duplicates.

When(
  'I select min price {string} and max price {string}',
  async function (
    this: CustomWorld,
    minPrice: string,
    maxPrice: string
  ) {
    await this.searchPage.filterByPrice();
  }
);

Then(
  'search results should display communities with applied price filter',
      async function (this: CustomWorld) {
        await this.searchPage.verifyCommunityResults();
    }
);
