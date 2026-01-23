import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/bddConfig';

When(
  'I apply bed & bath filter with {string} beds and {string} baths',
  async function (this: CustomWorld, beds: string, baths: string) {
    const minBeds = parseInt(beds, 3);
    const minBaths = parseInt(baths, 3);

        await this.searchPage.filterByBedroomsAndBathrooms(minBeds, minBaths);
    }
);

Then(
    'search results should display communities with applied bed & bath filter',
    async function (this: CustomWorld) {
        await this.searchPage.verifyCommunityResults();
    }
);
