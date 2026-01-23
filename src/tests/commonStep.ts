import { Given, When } from '@cucumber/cucumber';
import { CustomWorld } from '../support/bddConfig';
import { CountryCode } from '../../utils/country';

Given(
  'I open Mattamy Homes website for {string}',
  async function (this: CustomWorld, country: string) {
    const countryCode: CountryCode =
      country === 'CAN' ? 'CAN' : 'USA';

    await this.homePage.navigate(countryCode);
    await this.homePage.verifyPageLoaded();

  }
);

