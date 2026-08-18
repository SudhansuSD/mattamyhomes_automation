import assert from 'node:assert/strict';
import { MobileWebHomePage } from './MobileWebHomePage';
import { getEnvConfig } from '../../config/environments/envConfig';
import { getLocationConfig } from '../../config/locations/locationConfig';
import {
  fillInvalidEmailLeadFormByIndex,
  fillValidLeadFormByIndex,
  getLeadFormErrorSnapshot,
  installVisibleLeadFormFinder,
  submitVisibleLeadFormByIndex,
} from '../../utils/mobileLeadFormHelper';

const COMMUNITY_FORM_GLOBAL = '__getVisibleCommunityForms';

export class MobileWebCommunityPage extends MobileWebHomePage {
  /** Verifies search by community. */
  async verifySearchByCommunity(expectedCommunity = getLocationConfig().community) {
    await this.waitForPageReady();
    await this.waitForBodyText(
      new RegExp(this.escapeRegExp(expectedCommunity), 'i'),
      `Expected community page to include ${expectedCommunity}`,
    );

    const snapshot = await this.getSnapshot();

    assert.match(snapshot.currentUrl, new RegExp(this.escapeRegExp(this.getCommunityPath()), 'i'));
    this.assertNoErrorPage(snapshot);
  }

  /** Verifies core sections. */
  async verifyCoreSections() {
    await this.waitForBodyText(
      /available homes|quick move-in|map|contact|sales|directions|amenities|overview/i,
      'Expected community core sections to render on mobile',
      45000,
    );
    await this.closeCookiePreferencesIfVisible();

    const availableHomesSelector = await this.healMobileSelector(
      'mobile community available homes section',
      [
        { selector: '#availablehomes' },
        { selector: '[id*="available" i]' },
        { selector: '[id*="quick" i]' },
      ],
      { requireVisible: false },
    );

    const sections = await this.driver.execute((availableHomesSelector) => {
      const bodyText = document.body?.innerText || '';

      return {
        hasAvailableHomes:
          /available homes|quick move-in homes/i.test(bodyText) ||
          Boolean(document.querySelector(availableHomesSelector)),
        hasMap:
          /map|directions/i.test(bodyText) ||
          Boolean(document.querySelector('#map, [id*="map" i]')),
        hasContact:
          /contact|sales|schedule|call|directions/i.test(bodyText) ||
          Boolean(document.querySelector('#contact')),
      };
    }, availableHomesSelector);

    assert.equal(
      sections.hasAvailableHomes || sections.hasMap || sections.hasContact,
      true,
      'Expected at least one community core section on mobile',
    );
  }

  /** Verifies overview address market and attributes. */
  async verifyOverviewAddressMarketAndAttributes(
    expectedCommunity = getLocationConfig().community,
  ) {
    await this.waitForBodyText(
      new RegExp(this.escapeRegExp(expectedCommunity), 'i'),
      `Expected community page to include ${expectedCommunity}`,
      45000,
    );
    await this.closeCookiePreferencesIfVisible();

    const snapshot = await this.driver.execute((communityName) => {
      const normalize = (value) => (value || '').replace(/\s+/g, ' ').trim();
      const text = normalize(document.body?.innerText || '');
      const escapedCommunityName = communityName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const overview = Array.from(document.querySelectorAll('#ProductOverview, section, div')).find(
        (element) =>
          new RegExp(`welcome to\\s+${escapedCommunityName}`, 'i').test(
            element.textContent || '',
          ) || /designed for the way you live|home details/i.test(element.textContent || ''),
      );
      const overviewText = normalize(overview?.textContent || '');
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4')).map((heading) =>
        normalize(heading.textContent || ''),
      );

      return {
        bodyText: text,
        overviewText,
        hasOverview:
          Boolean(overview) ||
          new RegExp(`welcome to\\s+${escapedCommunityName}`, 'i').test(text) ||
          (/designed for the way you live|home details/i.test(text) &&
            new RegExp(escapedCommunityName, 'i').test(text)),
        hasAddress:
          headings.some((heading) => /\d{1,}.+,\s*.+\b[A-Z]{2}\b/i.test(heading)) ||
          /\d{1,}.+,\s*.+\b[A-Z]{2}\b/i.test(text),
        hasAttributes: /home types|bedrooms|full bathrooms|sq\.?\s*ft\.?|stories|garages/i.test(
          text,
        ),
      };
    }, expectedCommunity);

    assert.equal(
      snapshot.hasOverview,
      true,
      'Expected overview or home details section to include current community context',
    );
    assert.match(snapshot.bodyText, new RegExp(this.escapeRegExp(expectedCommunity), 'i'));
    assert.ok(
      snapshot.overviewText.length > 100 || snapshot.bodyText.length > 500,
      'Expected overview/community page to include meaningful content',
    );
    assert.equal(snapshot.hasAddress, true, 'Expected community address details on mobile');
    assert.equal(snapshot.hasAttributes, true, 'Expected community key attributes on mobile');
  }

  /** Verifies QMI card community name matches current community. */
  async verifyQmiCardCommunityNameMatchesCurrentCommunity(
    expectedCommunity = getLocationConfig().community,
  ) {
    await this.waitForBodyText(
      new RegExp(this.escapeRegExp(expectedCommunity), 'i'),
      `Expected community page to include ${expectedCommunity}`,
      45000,
    );

    const availableHomesSelector = await this.healMobileSelector(
      'mobile community QMI card section',
      [
        { selector: '#availablehomes' },
        { selector: '[id*="available" i]' },
        { selector: '[id*="quick" i]' },
      ],
      { requireVisible: false },
    );

    const result = await this.driver.execute((availableHomesSelector) => {
      const section =
        document.querySelector(availableHomesSelector) ||
        Array.from(document.querySelectorAll('section, div')).find((element) =>
          /quick move-in homes|available homes/i.test(element.textContent || ''),
        );

      if (!section) {
        return { skipped: true, reason: 'Available homes section not present' };
      }

      section.scrollIntoView({ block: 'center', inline: 'center' });
      const currentCommunitySegment =
        window.location.pathname.split('/').filter(Boolean).pop() || '';
      const links = (Array.from(section.querySelectorAll('a[href]')) as HTMLAnchorElement[])
        .filter((link) => !/view all/i.test(link.textContent || ''))
        .map((link) => link.getAttribute('href') || '')
        .filter((href) => href && !/\/search\?/i.test(href));

      if (!links.length) {
        return { skipped: true, reason: 'No QMI cards present' };
      }

      return {
        skipped: false,
        currentCommunitySegment,
        invalidLinks: links.filter(
          (href) =>
            !new URL(href, window.location.href).pathname
              .toLowerCase()
              .split('/')
              .includes(currentCommunitySegment),
        ),
      };
    }, availableHomesSelector);

    if (result.skipped) {
      this.logSkip(`${result.reason} - skipping QMI community-name validation`);
      return;
    }

    assert.deepEqual(
      result.invalidLinks,
      [],
      `Expected QMI card hrefs to include current community segment: ${result.currentCommunitySegment}`,
    );
  }

  /** Verifies all navigation links. */
  async verifyAllNavigationLinks() {
    await this.waitForPageReady();

    const invalidLinks = await this.driver.execute(() => {
      return Array.from(document.querySelectorAll('a[href]'))
        .map((link) => link.getAttribute('href') || '')
        .filter(
          (href) =>
            href &&
            !href.startsWith('#') &&
            !href.startsWith('mailto:') &&
            !href.startsWith('tel:'),
        )
        .filter((href) => !href.trim());
    });

    assert.deepEqual(
      invalidLinks,
      [],
      'Expected all community navigation links to have href values',
    );
  }

  /** Verifies available homes navigation. */
  async verifyAvailableHomesNavigation() {
    const result = await this.clickFirstCommunityLink(
      /quick-move-in|available-home|\d{1,}-/i,
      'available home',
    );

    if (result.skipped) {
      this.logSkip(`${result.reason} - skipping available homes navigation`);
      return;
    }

    assert.match(await this.driver.getUrl(), new RegExp(this.escapeRegExp(result.href), 'i'));
    await this.driver.back();
    await this.waitForPageReady();
  }

  /** Verifies plans navigation. */
  async verifyPlansNavigation() {
    const location = getLocationConfig();
    const planPattern = new RegExp(
      this.escapeRegExp(location.expectedPlanUrlPart || location.planName),
      'i',
    );
    const result = await this.clickFirstCommunityLink(planPattern, 'plan');

    if (result.skipped) {
      this.logSkip(`${result.reason} - skipping plans navigation`);
      return;
    }

    assert.match(await this.driver.getUrl(), new RegExp(this.escapeRegExp(result.href), 'i'));
    await this.driver.back();
    await this.waitForPageReady();
  }

  /** Clicks first community link. */
  async clickFirstCommunityLink(pattern, label) {
    const clicked = await this.driver.execute(
      ({ source, flags, label }) => {
        const regex = new RegExp(source, flags);
        const isVisible = (element) => {
          const style = window.getComputedStyle(element);
          const rect = element.getBoundingClientRect();

          return (
            style.visibility !== 'hidden' &&
            style.display !== 'none' &&
            rect.width > 0 &&
            rect.height > 0
          );
        };
        const section =
          document.querySelector('#availablehomes') ||
          Array.from(document.querySelectorAll('section, div')).find((element) =>
            /quick move-in homes|available homes|home plans|floor plans|plans/i.test(
              element.textContent || '',
            ),
          );
        const links = Array.from((section || document).querySelectorAll('a[href]'));
        const link = links.find((candidate) => {
          const href = candidate.getAttribute('href') || '';
          const text = candidate.textContent || '';

          return isVisible(candidate) && regex.test(`${href} ${text}`);
        });

        if (!(link instanceof HTMLElement)) {
          return { skipped: true, reason: `No ${label} link found` };
        }

        const href = link.getAttribute('href') || '';
        link.scrollIntoView({ block: 'center', inline: 'center' });
        link.click();
        return { skipped: false, href };
      },
      { source: pattern.source, flags: pattern.flags, label },
    );

    if (!clicked.skipped) {
      this.logScriptClick(`${label} card`);
      await this.waitForPageReady();
      this.logOpen(`${label} detail`, await this.driver.getUrl());
    }

    return clicked;
  }

  /** Validates primary form empty errors. */
  async validatePrimaryFormEmptyErrors() {
    await this.waitForCommunityForm();
    await this.submitVisibleFormByIndex(0);
    const errorSnapshot = await getLeadFormErrorSnapshot(this.driver);

    assert.ok(
      /required|invalid|error|please enter|field is required/i.test(errorSnapshot.text) ||
        errorSnapshot.invalidFieldCount > 0,
      'Expected required field validation after submitting an empty community form',
    );
  }

  /** Validates footer form empty errors. */
  async validateFooterFormEmptyErrors() {
    await this.waitForCommunityForm();
    await this.submitVisibleFormByIndex(1);
    const errorSnapshot = await getLeadFormErrorSnapshot(this.driver);

    assert.ok(
      /required|invalid|error|please enter|field is required/i.test(errorSnapshot.text) ||
        errorSnapshot.invalidFieldCount > 0,
      'Expected required field validation after submitting footer community form',
    );
  }

  /** Validates primary form invalid email. */
  async validatePrimaryFormInvalidEmail() {
    await this.waitForCommunityForm();
    await this.fillInvalidEmailFormByIndex(0);
    const errorSnapshot = await getLeadFormErrorSnapshot(this.driver);

    assert.ok(
      /email|valid domain|invalid|please enter/i.test(
        `${errorSnapshot.text} ${errorSnapshot.emailValidationMessage} ${errorSnapshot.emailAriaInvalid}`,
      ),
      'Expected invalid email validation on the community form',
    );
  }

  /** Validates footer form invalid email. */
  async validateFooterFormInvalidEmail() {
    await this.waitForCommunityForm();
    await this.fillInvalidEmailFormByIndex(1);
    const errorSnapshot = await getLeadFormErrorSnapshot(this.driver);

    assert.ok(
      /email|valid domain|invalid|please enter/i.test(
        `${errorSnapshot.text} ${errorSnapshot.emailValidationMessage} ${errorSnapshot.emailAriaInvalid}`,
      ),
      'Expected invalid email validation on the footer community form',
    );
  }

  /** Verifies primary form success submission. */
  async verifyPrimaryFormSuccessSubmission() {
    await this.submitCommunityFormSuccessfully(0, 'primary community form');
  }

  /** Verifies footer form success submission. */
  async verifyFooterFormSuccessSubmission() {
    await this.submitCommunityFormSuccessfully(1, 'footer community form');
  }

  /** Submits community form successfully. */
  async submitCommunityFormSuccessfully(formIndex, formName) {
    const { envName } = getEnvConfig();

    assert.notEqual(envName, 'PROD', `${formName} success submission must not run on PROD`);

    await this.waitForCommunityForm();
    await this.fillValidFormByIndex(formIndex);
    await this.assertSubmissionSuccess(
      `Expected successful submission confirmation for ${formName}`,
    );
  }

  /** Submits visible form by index. */
  async submitVisibleFormByIndex(formIndex = 0) {
    const submitted = await submitVisibleLeadFormByIndex(
      this.driver,
      COMMUNITY_FORM_GLOBAL,
      formIndex,
    );
    assert.equal(submitted, true, `Expected visible community form at index ${formIndex}`);
  }

  /** Fills invalid email form by index. */
  async fillInvalidEmailFormByIndex(formIndex = 0) {
    const filled = await fillInvalidEmailLeadFormByIndex(
      this.driver,
      COMMUNITY_FORM_GLOBAL,
      formIndex,
    );
    assert.equal(
      filled,
      true,
      `Expected community form at index ${formIndex} to validate invalid email`,
    );
  }

  /** Fills valid form by index. */
  async fillValidFormByIndex(formIndex = 0) {
    const submitted = await fillValidLeadFormByIndex(
      this.driver,
      COMMUNITY_FORM_GLOBAL,
      formIndex,
      {
        emailPrefix: 'ssdas_community_mobile',
      },
    );
    assert.equal(
      submitted,
      true,
      `Expected community form at index ${formIndex} to submit valid data`,
    );
  }

  /** Waits for community form. */
  async waitForCommunityForm() {
    await this.waitForBodyText(
      /sign up for community updates|first name|last name|email|zip\/postal code|submit/i,
      'Expected community lead form to render on mobile community page',
      45000,
    );
    await this.closeCookiePreferencesIfVisible();
    await installVisibleLeadFormFinder(this.driver, {
      globalName: COMMUNITY_FORM_GLOBAL,
    });
  }
}
