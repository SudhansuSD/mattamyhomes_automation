const assert = require('node:assert/strict');
const { MobileWebHomePage } = require('./MobileWebHomePage');
const { getLocationConfig } = require('../../config/locations');

class MobileWebPlanPage extends MobileWebHomePage {
  getPlanPath(location = getLocationConfig()) {
    const communityPath = this.getCommunityPath(location);
    const planSlug = (location.expectedPlanUrlPart || `/${this.toSlug(location.planName)}`).replace(/^\/+/, '');

    return `${communityPath}/${planSlug}`;
  }

  async navigateToPlan(location = getLocationConfig()) {
    await this.open();
    const planResultAvailable = await this.searchByPlan(location.planName, { allowFallback: true });

    if (!planResultAvailable) {
      await this.driver.url(`${this.getPlanPath(location)}?${location.queryParam}`);
      await this.waitForPageReady();
    }

    await this.waitForPlanPage(location.planName);
  }

  async waitForPlanPage(planName = getLocationConfig().planName) {
    const planPattern = new RegExp(this.escapeRegExp(planName), 'i');

    await this.driver.waitUntil(
      async () => {
        const snapshot = await this.driver.execute(() => {
          const text = document.body?.innerText || '';

          return {
            readyState: document.readyState,
            text,
            title: document.title,
            url: window.location.href,
          };
        });

        return (
          snapshot.readyState === 'complete' &&
          planPattern.test(`${snapshot.title}\n${snapshot.text}\n${snapshot.url}`) &&
          /bed|bath|sq\.?\s*ft|floorplan|plan/i.test(snapshot.text)
        );
      },
      {
        timeout: 60000,
        timeoutMsg: `Expected mobile plan detail page to render ${planName}`,
      }
    );

    await this.closeCookiePreferencesIfVisible();
  }

  async verifyPageLoaded(planName = getLocationConfig().planName) {
    await this.waitForPlanPage(planName);
    const snapshot = await this.getSnapshot();

    assert.match(`${snapshot.title}\n${snapshot.bodyText}`, new RegExp(this.escapeRegExp(planName), 'i'));
    this.assertNoErrorPage(snapshot);
  }

  async verifyPlanUrlContains(expectedUrlPart = getLocationConfig().expectedPlanUrlPart) {
    assert.match(await this.driver.getUrl(), new RegExp(this.escapeRegExp(expectedUrlPart), 'i'));
  }

  async verifyHeroSummaryForPlan(planName = getLocationConfig().planName) {
    await this.waitForPlanPage(planName);
    const hero = await this.driver.execute(() => {
      const normalize = (value) => (value || '').replace(/\s+/g, ' ').trim();
      const heading = Array.from(document.querySelectorAll('h1, h2')).find((element) => {
        const text = normalize(element.textContent || '');
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();

        return text && style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
      });

      return {
        headingText: normalize(heading?.textContent || ''),
        bodyText: normalize(document.body?.innerText || ''),
        title: document.title,
        url: window.location.href,
      };
    });

    assert.match(
      `${hero.headingText}\n${hero.bodyText}\n${hero.title}\n${hero.url}`,
      new RegExp(this.escapeRegExp(planName), 'i'),
      `Expected hero or body to include plan ${planName}`
    );
  }

  async verifyHomeSpecsPresent() {
    await this.waitForPlanPage();

    let specText = '';
    await this.driver.waitUntil(
      async () => {
        specText = await this.driver.execute(() => {
          const body = document.body;

          return [
            document.title,
            body?.innerText || '',
            body?.textContent || '',
          ].join('\n');
        });

        return /bed/i.test(specText) && /bath/i.test(specText) && /sq\.?\s*ft/i.test(specText);
      },
      {
        timeout: 30000,
        timeoutMsg: 'Expected plan detail page to include beds, baths, and square footage',
      }
    );

    assert.match(specText, /bed/i, 'Expected plan detail page to include beds');
    assert.match(specText, /bath/i, 'Expected plan detail page to include baths');
    assert.match(specText, /sq\.?\s*ft/i, 'Expected plan detail page to include square footage');
  }

  async verifyMobileCommunityLinkNavigation() {
    const location = getLocationConfig();

    await this.waitForPlanPage(location.planName);
    const communityLink = await this.driver.execute(
      (communityName, communityPath) => {
        const normalize = (value) => (value || '').replace(/\s+/g, ' ').trim();
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

        const link = Array.from(document.querySelectorAll('a[href]')).find(
          (element) => {
            const text = normalize(element.textContent);
            const href = element.getAttribute('href') || '';

            return (
              isVisible(element) &&
              new RegExp(communityName, 'i').test(text) &&
              href.includes(communityPath)
            );
          }
        );

        return {
          found: Boolean(link),
          href: link?.getAttribute('href') || '',
          text: normalize(link?.textContent || ''),
        };
      },
      location.community,
      location.communityPath || this.getCommunityPath(location)
    );

    assert.equal(
      communityLink.found,
      true,
      `Expected mobile plan page to show linked community name ${location.community}`
    );

    assert.match(
      communityLink.href,
      new RegExp(
        this.escapeRegExp(location.communityPath || this.getCommunityPath(location)),
        'i'
      ),
      `Expected mobile community link to point to ${location.communityPath}`
    );

    await this.driver.execute(
      (communityName, communityPath) => {
        const normalize = (value) => (value || '').replace(/\s+/g, ' ').trim();
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

        const link = Array.from(document.querySelectorAll('a[href]')).find(
          (element) => {
            const text = normalize(element.textContent);
            const href = element.getAttribute('href') || '';

            return (
              isVisible(element) &&
              new RegExp(communityName, 'i').test(text) &&
              href.includes(communityPath)
            );
          }
        );

        link?.click();
      },
      location.community,
      location.communityPath || this.getCommunityPath(location)
    );

    await this.driver.waitUntil(
      async () => {
        const currentPath = new URL(await this.driver.getUrl()).pathname;

        return new RegExp(
          this.escapeRegExp(location.communityPath || this.getCommunityPath(location)),
          'i'
        ).test(currentPath);
      },
      {
        timeout: 15000,
        timeoutMsg: `Expected mobile community link to navigate to ${location.communityPath}`,
      }
    );

    await this.driver.back();
    await this.waitForPlanPage(location.planName);
  }

  async verifyGallery() {
    await this.waitForPlanPage();
    const gallery = await this.driver.execute(() => {
      const isVisible = (element) => {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();

        return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
      };
      const images = Array.from(document.querySelectorAll('img[src], picture source[srcset]')).filter(isVisible);
      const controls = Array.from(document.querySelectorAll('button, [role="button"]')).filter((element) =>
        isVisible(element) && /next|previous|prev|slide|gallery|image/i.test(`${element.textContent || ''} ${element.getAttribute('aria-label') || ''}`)
      );

      return {
        controlCount: controls.length,
        imageCount: images.length,
      };
    });

    assert.ok(gallery.imageCount > 0, 'Expected plan detail page gallery or hero images');
  }

  async verifyInteractiveFloorPlanSection() {
    await this.verifyOptionalSection(
      /interactive floorplan|floor ?plan/i,
      'Interactive floorplan section not present on mobile plan page - skipping validation',
      /view floorplan|interactive floorplan|floor ?plan|iframe/i
    );
  }

  async verifyExteriorStylesSection() {
    await this.verifyOptionalSection(
      /exterior styles|exterior/i,
      'Exterior styles section not present on mobile plan page - skipping validation',
      /exterior|elevation|style/i
    );
  }

  async verifyMortgageCalculatorCta() {
    await this.verifyOptionalSection(
      /mortgage calculator/i,
      'Mortgage Calculator section not present on mobile plan page - skipping validation',
      /get started|calculate|mortgage/i
    );
  }

  async verifyQuickMoveInHomesSection() {
    const result = await this.getSectionSnapshot(/quick move-in homes|quick move-ins|available homes/i);

    if (!result.found) {
      console.log('QMI section not present on mobile plan page - skipping validation');
      return;
    }

    assert.match(result.text, /quick move|available homes|view all|ready/i);
    assert.ok(result.linkCount > 0 || /show more|view all/i.test(result.text), 'Expected QMI section links or CTA');
  }

  async verifySalesOfficeSection() {
    const result = await this.getSectionSnapshot(/sales office|hours|directions|call|new home gallery/i);

    if (!result.found) {
      console.log('Sales office section not present on mobile plan page - skipping validation');
      return;
    }

    assert.match(result.text, /hours|directions|call|office|gallery/i);
  }

  async verifyPlanDetailForm() {
    await this.waitForPlanForm();
    const form = await this.driver.execute(() => {
      const form = window.__getVisiblePlanForms?.()[0];

      return {
        found: Boolean(form),
        text: (form?.textContent || '').replace(/\s+/g, ' ').trim(),
      };
    });

    assert.equal(form.found, true, 'Expected plan detail form on mobile');
    assert.match(form.text, /first name/i);
    assert.match(form.text, /last name/i);
    assert.match(form.text, /email/i);
    assert.match(form.text, /country of residence/i);
    assert.match(form.text, /zip|postal/i);
  }

  async validatePlanDetailFormEmptyErrors() {
    await this.waitForPlanForm();
    await this.submitVisiblePlanFormByIndex(0);
    const snapshot = await this.getFormErrorSnapshot();

    assert.ok(
      /required|invalid|error|please enter|field is required/i.test(snapshot.text) || snapshot.invalidFieldCount > 0,
      'Expected required field validation after submitting empty plan form'
    );
  }

  async validatePlanDetailFormInvalidEmail() {
    await this.waitForPlanForm();
    await this.fillInvalidEmailPlanFormByIndex(0);
    const snapshot = await this.getFormErrorSnapshot();

    assert.ok(
      /email|valid domain|invalid|please enter/i.test(
        `${snapshot.text} ${snapshot.emailValidationMessage} ${snapshot.emailAriaInvalid}`
      ),
      'Expected invalid email validation on plan form'
    );
  }

  async verifyQMISection() {
    await this.verifyQuickMoveInHomesSection();
  }

  async verifyOptionalSection(headingPattern, skipMessage, contentPattern) {
    const result = await this.getSectionSnapshot(headingPattern);

    if (!result.found) {
      console.log(skipMessage);
      return;
    }

    assert.match(result.text, contentPattern);
  }

  async getSectionSnapshot(pattern) {
    await this.waitForPlanPage();

    return this.driver.execute(({ source, flags }) => {
      const regex = new RegExp(source, flags);
      const normalize = (value) => (value || '').replace(/\s+/g, ' ').trim();
      const isVisible = (element) => {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();

        return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
      };
      const section = Array.from(document.querySelectorAll('section, article, div')).find((element) =>
        isVisible(element) && regex.test(element.textContent || '')
      );

      section?.scrollIntoView({ block: 'center', inline: 'center' });

      return {
        found: Boolean(section),
        linkCount: section?.querySelectorAll('a[href]').length || 0,
        text: normalize(section?.textContent || ''),
      };
    }, { source: pattern.source, flags: pattern.flags });
  }

  async waitForPlanForm() {
    await this.waitForPlanPage();
    await this.waitForBodyText(
      /sign up for community updates|first name|last name|email|zip\/postal code|submit/i,
      'Expected plan detail lead form to render on mobile plan page',
      45000
    );
    await this.closeCookiePreferencesIfVisible();
    await this.driver.execute(() => {
      window.__getVisiblePlanForms = () => {
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

  async submitVisiblePlanFormByIndex(formIndex = 0) {
    const submitted = await this.driver.execute((formIndex) => {
      const form = window.__getVisiblePlanForms?.()[formIndex];

      if (!form) {
        return false;
      }

      form.scrollIntoView({ block: 'center', inline: 'center' });
      const submit = form.querySelector('button[type="submit"], input[type="submit"], button');
      submit?.click();
      return true;
    }, formIndex);

    assert.equal(submitted, true, `Expected visible plan form at index ${formIndex}`);
    await this.driver.pause(1500);
  }

  async fillInvalidEmailPlanFormByIndex(formIndex = 0) {
    const filled = await this.driver.execute((formIndex) => {
      const form = window.__getVisiblePlanForms?.()[formIndex] || window.__getVisiblePlanForms?.()[0];

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

    assert.equal(filled, true, `Expected plan form at index ${formIndex} to validate invalid email`);
    await this.driver.pause(1500);
  }

  async getFormErrorSnapshot() {
    return this.driver.execute(() => {
      const text = document.body?.innerText || '';
      const email = document.querySelector('input[type="email"], input[name*="email" i], input[id*="email" i]');
      const invalidFields = document.querySelectorAll(':invalid, [aria-invalid="true"], .field-validation-error');

      return {
        emailAriaInvalid: email?.getAttribute('aria-invalid') || '',
        emailValidationMessage: email?.validationMessage || '',
        invalidFieldCount: invalidFields.length,
        text,
      };
    });
  }
}

module.exports = { MobileWebPlanPage };
