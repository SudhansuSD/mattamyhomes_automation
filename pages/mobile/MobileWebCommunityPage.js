const assert = require('node:assert/strict');
const { MobileWebHomePage } = require('./MobileWebHomePage');
const { getLocationConfig } = require('../../config/locations');

class MobileWebCommunityPage extends MobileWebHomePage {
  async openCommunity(location = getLocationConfig()) {
    await this.open(this.getCommunityPath(location));
  }

  async verifySearchByCommunity(expectedCommunity = getLocationConfig().community) {
    await this.waitForPageReady();
    await this.waitForBodyText(
      new RegExp(this.escapeRegExp(expectedCommunity), 'i'),
      `Expected community page to include ${expectedCommunity}`
    );

    const snapshot = await this.getSnapshot();

    assert.match(snapshot.currentUrl, new RegExp(this.escapeRegExp(this.getCommunityPath()), 'i'));
    this.assertNoErrorPage(snapshot);
  }

  async verifyBreadcrumbAndContactBar(expectedCommunity = getLocationConfig().community) {
    await this.waitForBodyText(
      new RegExp(this.escapeRegExp(expectedCommunity), 'i'),
      `Expected community page to include ${expectedCommunity}`
    );
    await this.closeCookiePreferencesIfVisible();

    const snapshot = await this.driver.execute(() => {
      const isVisible = (element) => {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();

        return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
      };
      const breadcrumb = document.querySelector(
        '[aria-label*="breadcrumb" i], nav[aria-label*="Breadcrumb" i], .breadcrumb, [class*="breadcrumb" i]'
      );
      const contactBar = Array.from(document.querySelectorAll('a, button, section, div')).find((element) => {
        const text = (element.textContent || '').replace(/\s+/g, ' ').trim();
        const href = element.getAttribute('href') || '';

        return (
          isVisible(element) &&
          !/cookie preferences|strictly necessary cookies|performance cookies/i.test(text) &&
          /contact|call|schedule|visit|directions|sales|\d{3}[-.\s]\d{3}[-.\s]\d{4}/i.test(`${text} ${href}`)
        );
      });
      const breadcrumbText = breadcrumb?.textContent?.replace(/\s+/g, ' ').trim() || '';
      const pathSegments = window.location.pathname.split('/').filter(Boolean);

      return {
        breadcrumbText,
        hasBreadcrumbContext:
          Boolean(breadcrumbText) ||
          (pathSegments.length >= 4 && /mattamy|new homes|homes/i.test(document.title || '')),
        hasContactBar: Boolean(contactBar),
        contactText: contactBar?.textContent?.replace(/\s+/g, ' ').trim() || '',
      };
    });

    assert.equal(snapshot.hasBreadcrumbContext, true, 'Expected community page breadcrumb or URL hierarchy context on mobile');
    if (snapshot.breadcrumbText) {
      assert.match(
        snapshot.breadcrumbText,
        /home|communities|community|mattamy/i,
        `Expected breadcrumb context, received: ${snapshot.breadcrumbText}`
      );
    }
    assert.match(
      await this.getBodyText(),
      new RegExp(this.escapeRegExp(expectedCommunity), 'i'),
      'Expected current community name on community page'
    );
    assert.equal(snapshot.hasContactBar, true, 'Expected community page mobile contact/action bar');
    assert.match(snapshot.contactText, /contact|call|schedule|visit|directions|sales/i);
  }

  async verifyCoreSections() {
    await this.waitForBodyText(
      /available homes|quick move-in|map|contact|sales|directions|amenities|overview/i,
      'Expected community core sections to render on mobile',
      45000
    );
    await this.closeCookiePreferencesIfVisible();

    const sections = await this.driver.execute(() => {
      const bodyText = document.body?.innerText || '';

      return {
        hasAvailableHomes: /available homes|quick move-in homes/i.test(bodyText) || Boolean(document.querySelector('#availablehomes')),
        hasMap: /map|directions/i.test(bodyText) || Boolean(document.querySelector('#map, [id*="map" i]')),
        hasContact: /contact|sales|schedule|call|directions/i.test(bodyText) || Boolean(document.querySelector('#contact')),
      };
    });

    assert.equal(
      sections.hasAvailableHomes || sections.hasMap || sections.hasContact,
      true,
      'Expected at least one community core section on mobile'
    );
  }

  async verifyOverviewAddressMarketAndAttributes(expectedCommunity = getLocationConfig().community) {
    await this.waitForBodyText(
      new RegExp(this.escapeRegExp(expectedCommunity), 'i'),
      `Expected community page to include ${expectedCommunity}`,
      45000
    );
    await this.closeCookiePreferencesIfVisible();

    const snapshot = await this.driver.execute((communityName) => {
      const normalize = (value) => (value || '').replace(/\s+/g, ' ').trim();
      const text = normalize(document.body?.innerText || '');
      const escapedCommunityName = communityName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const overview = Array.from(document.querySelectorAll('#ProductOverview, section, div')).find((element) =>
        new RegExp(`welcome to\\s+${escapedCommunityName}`, 'i').test(element.textContent || '') ||
        /designed for the way you live|home details/i.test(element.textContent || '')
      );
      const overviewText = normalize(overview?.textContent || '');
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4')).map((heading) =>
        normalize(heading.textContent || '')
      );

      return {
        bodyText: text,
        overviewText,
        hasOverview:
          Boolean(overview) ||
          new RegExp(`welcome to\\s+${escapedCommunityName}`, 'i').test(text) ||
          (/designed for the way you live|home details/i.test(text) && new RegExp(escapedCommunityName, 'i').test(text)),
        hasAddress: headings.some((heading) => /\d{1,}.+,\s*.+\b[A-Z]{2}\b/i.test(heading)) ||
          /\d{1,}.+,\s*.+\b[A-Z]{2}\b/i.test(text),
        hasAttributes: /home types|bedrooms|full bathrooms|sq\.?\s*ft\.?|stories|garages/i.test(text),
      };
    }, expectedCommunity);

    assert.equal(snapshot.hasOverview, true, 'Expected overview or home details section to include current community context');
    assert.match(snapshot.bodyText, new RegExp(this.escapeRegExp(expectedCommunity), 'i'));
    assert.ok(
      snapshot.overviewText.length > 100 || snapshot.bodyText.length > 500,
      'Expected overview/community page to include meaningful content'
    );
    assert.equal(snapshot.hasAddress, true, 'Expected community address details on mobile');
    assert.equal(snapshot.hasAttributes, true, 'Expected community key attributes on mobile');
  }

  async verifyQmiCardCommunityNameMatchesCurrentCommunity(expectedCommunity = getLocationConfig().community) {
    await this.waitForBodyText(
      new RegExp(this.escapeRegExp(expectedCommunity), 'i'),
      `Expected community page to include ${expectedCommunity}`,
      45000
    );

    const result = await this.driver.execute(() => {
      const section = document.querySelector('#availablehomes') ||
        Array.from(document.querySelectorAll('section, div')).find((element) =>
          /quick move-in homes|available homes/i.test(element.textContent || '')
        );

      if (!section) {
        return { skipped: true, reason: 'Available homes section not present' };
      }

      section.scrollIntoView({ block: 'center', inline: 'center' });
      const currentCommunitySegment = window.location.pathname.split('/').filter(Boolean).pop() || '';
      const links = Array.from(section.querySelectorAll('a[href]'))
        .filter((link) => !/view all/i.test(link.textContent || ''))
        .map((link) => link.getAttribute('href') || '')
        .filter((href) => href && !/\/search\?/i.test(href));

      if (!links.length) {
        return { skipped: true, reason: 'No QMI cards present' };
      }

      return {
        skipped: false,
        currentCommunitySegment,
        invalidLinks: links.filter((href) =>
          !new URL(href, window.location.href).pathname.toLowerCase().split('/').includes(currentCommunitySegment)
        ),
      };
    });

    if (result.skipped) {
      console.log(`${result.reason} - skipping QMI community-name validation`);
      return;
    }

    assert.deepEqual(
      result.invalidLinks,
      [],
      `Expected QMI card hrefs to include current community segment: ${result.currentCommunitySegment}`
    );
  }

  async verifyAllNavigationLinks() {
    await this.waitForPageReady();

    const invalidLinks = await this.driver.execute(() => {
      return Array.from(document.querySelectorAll('a[href]'))
        .map((link) => link.getAttribute('href') || '')
        .filter((href) => href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:'))
        .filter((href) => !href.trim());
    });

    assert.deepEqual(invalidLinks, [], 'Expected all community navigation links to have href values');
  }

  async verifyAvailableHomesNavigation() {
    const result = await this.clickFirstCommunityLink(/quick-move-in|available-home|\d{1,}-/i, 'available home');

    if (result.skipped) {
      console.log(`${result.reason} - skipping available homes navigation`);
      return;
    }

    assert.match(await this.driver.getUrl(), new RegExp(this.escapeRegExp(result.href), 'i'));
    await this.driver.back();
    await this.waitForPageReady();
  }

  async verifyPlansNavigation() {
    const location = getLocationConfig();
    const planPattern = new RegExp(this.escapeRegExp(location.expectedPlanUrlPart || location.planName), 'i');
    const result = await this.clickFirstCommunityLink(planPattern, 'plan');

    if (result.skipped) {
      console.log(`${result.reason} - skipping plans navigation`);
      return;
    }

    assert.match(await this.driver.getUrl(), new RegExp(this.escapeRegExp(result.href), 'i'));
    await this.driver.back();
    await this.waitForPageReady();
  }

  async clickFirstCommunityLink(pattern, label) {
    const clicked = await this.driver.execute(
      ({ source, flags, label }) => {
        const regex = new RegExp(source, flags);
        const isVisible = (element) => {
          const style = window.getComputedStyle(element);
          const rect = element.getBoundingClientRect();

          return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
        };
        const section = document.querySelector('#availablehomes') ||
          Array.from(document.querySelectorAll('section, div')).find((element) =>
            /quick move-in homes|available homes|home plans|floor plans|plans/i.test(element.textContent || '')
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
      { source: pattern.source, flags: pattern.flags, label }
    );

    if (!clicked.skipped) {
      await this.waitForPageReady();
    }

    return clicked;
  }

  async validateEmptyFormErrors() {
    await this.validatePrimaryFormEmptyErrors();
  }

  async validatePrimaryFormEmptyErrors() {
    await this.waitForCommunityForm();
    await this.submitVisibleFormByIndex(0);
    const errorSnapshot = await this.driver.execute(() => {
      const text = document.body?.innerText || '';
      const invalidFields = document.querySelectorAll(':invalid, [aria-invalid="true"], .field-validation-error');

      return {
        errorText: text,
        invalidFieldCount: invalidFields.length,
      };
    });

    assert.ok(
      /required|invalid|error|please enter|field is required/i.test(errorSnapshot.errorText) ||
        errorSnapshot.invalidFieldCount > 0,
      'Expected required field validation after submitting an empty community form'
    );
  }

  async validateFooterFormEmptyErrors() {
    await this.waitForCommunityForm();
    await this.submitVisibleFormByIndex(1);
    const errorSnapshot = await this.driver.execute(() => {
      const text = document.body?.innerText || '';
      const invalidFields = document.querySelectorAll(':invalid, [aria-invalid="true"], .field-validation-error');

      return {
        errorText: text,
        invalidFieldCount: invalidFields.length,
      };
    });

    assert.ok(
      /required|invalid|error|please enter|field is required/i.test(errorSnapshot.errorText) ||
        errorSnapshot.invalidFieldCount > 0,
      'Expected required field validation after submitting footer community form'
    );
  }

  async validateInvalidEmail() {
    await this.validatePrimaryFormInvalidEmail();
  }

  async validatePrimaryFormInvalidEmail() {
    await this.waitForCommunityForm();
    await this.fillInvalidEmailFormByIndex(0);
    const errorSnapshot = await this.driver.execute(() => {
      const text = document.body?.innerText || '';
      const email = document.querySelector('input[type="email"], input[name*="email" i], input[id*="email" i]');

      return {
        errorText: text,
        emailValidationMessage: email?.validationMessage || '',
        emailAriaInvalid: email?.getAttribute('aria-invalid') || '',
      };
    });

    assert.ok(
      /email|valid domain|invalid|please enter/i.test(
        `${errorSnapshot.errorText} ${errorSnapshot.emailValidationMessage} ${errorSnapshot.emailAriaInvalid}`
      ),
      'Expected invalid email validation on the community form'
    );
  }

  async validateFooterFormInvalidEmail() {
    await this.waitForCommunityForm();
    await this.fillInvalidEmailFormByIndex(1);
    const errorSnapshot = await this.driver.execute(() => {
      const text = document.body?.innerText || '';
      const email = document.querySelector('input[type="email"], input[name*="email" i], input[id*="email" i]');

      return {
        errorText: text,
        emailValidationMessage: email?.validationMessage || '',
        emailAriaInvalid: email?.getAttribute('aria-invalid') || '',
      };
    });

    assert.ok(
      /email|valid domain|invalid|please enter/i.test(
        `${errorSnapshot.errorText} ${errorSnapshot.emailValidationMessage} ${errorSnapshot.emailAriaInvalid}`
      ),
      'Expected invalid email validation on the footer community form'
    );
  }

  async submitVisibleFormByIndex(formIndex = 0) {
    const submitted = await this.driver.execute((formIndex) => {
      const form = window.__getVisibleCommunityForms?.()[formIndex];

      if (!form) {
        return false;
      }

      form.scrollIntoView({ block: 'center', inline: 'center' });
      const submit = form.querySelector('button[type="submit"], input[type="submit"], button');
      submit?.click();
      return true;
    }, formIndex);

    assert.equal(submitted, true, `Expected visible community form at index ${formIndex}`);
    await this.driver.pause(1500);
  }

  async submitEmptyVisibleForm() {
    await this.submitVisibleFormByIndex(0);
  }

  async fillInvalidEmailFormByIndex(formIndex = 0) {
    const filled = await this.driver.execute((formIndex) => {
      const form = window.__getVisibleCommunityForms?.()[formIndex] || window.__getVisibleCommunityForms?.()[0];

      if (!form) {
        return false;
      }

      const fill = (selector, value) => {
        const input = form.querySelector(selector);
        if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
          input.focus();
          input.value = value;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      };

      form.scrollIntoView({ block: 'center', inline: 'center' });
      fill('input[name*="first" i], input[id*="first" i], input[placeholder*="First" i]', 'Test');
      fill('input[name*="last" i], input[id*="last" i], input[placeholder*="Last" i]', 'User');
      fill('input[type="email"], input[name*="email" i], input[id*="email" i]', 'user@domain.c');
      fill('input[type="tel"], input[name*="phone" i], input[id*="phone" i]', '123456');

      const submit = form.querySelector('button[type="submit"], input[type="submit"], button');
      submit?.click();
      return true;
    }, formIndex);

    assert.equal(filled, true, `Expected community form at index ${formIndex} to validate invalid email`);
    await this.driver.pause(1500);
  }

  async fillInvalidEmailForm() {
    await this.fillInvalidEmailFormByIndex(0);
  }

  async waitForCommunityForm() {
    await this.waitForBodyText(
      /sign up for community updates|first name|last name|email|zip\/postal code|submit/i,
      'Expected community lead form to render on mobile community page',
      45000
    );
    await this.closeCookiePreferencesIfVisible();
    await this.driver.execute(() => {
      window.__getVisibleCommunityForms = () => {
        const isVisible = (element) => {
          const style = window.getComputedStyle(element);
          const rect = element.getBoundingClientRect();

          return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
        };
        const isLeadForm = (form) =>
          isVisible(form) &&
          form.querySelector('input, select, textarea') &&
          form.querySelector('button, input[type="submit"]') &&
          /submit|first name|last name|email|zip|postal|community updates/i.test(form.textContent || '');
        const uniqueBySubmitButton = (forms) => {
          const seenButtons = new Set();

          return forms.filter((form) => {
            const submit = form.querySelector('button[type="submit"], input[type="submit"], button');

            if (!submit || seenButtons.has(submit)) {
              return false;
            }

            seenButtons.add(submit);
            return true;
          });
        };
        const actualForms = Array.from(document.querySelectorAll('form')).filter(isLeadForm);

        if (actualForms.length) {
          return uniqueBySubmitButton(actualForms);
        }

        return uniqueBySubmitButton(Array.from(document.querySelectorAll('section, div')).filter(isLeadForm));
      };
    });
  }
}

module.exports = { MobileWebCommunityPage };
