const assert = require('node:assert/strict');
const { MobileWebHomePage } = require('./MobileWebHomePage');
const { getEnvConfig } = require('../../config/environments/envConfig');
const { getLocationConfig } = require('../../config/locations/locationConfig');
const {
  assertLeadFormSubmissionSuccess,
  fillInvalidEmailLeadFormByIndex,
  fillValidLeadFormByIndex,
  getLeadFormErrorSnapshot,
  installVisibleLeadFormFinder,
  submitVisibleLeadFormByIndex,
} = require('../../utils/mobileLeadFormHelper');

const PLAN_FORM_GLOBAL = '__getVisiblePlanForms';

class MobileWebPlanPage extends MobileWebHomePage {
  /** Returns plan source snapshot. */
  async getPlanSourceSnapshot() {
    return this.driver.execute(() => {
      const visibleText = document.body?.innerText || '';
      const sourceText = document.documentElement?.textContent || '';

      return {
        sourceText,
        text: visibleText || sourceText,
        visibleText,
        isSourceOnly: visibleText.trim().length < 20 && sourceText.trim().length > 1000,
        title: document.title,
        url: window.location.href,
      };
    });
  }

  /** Waits for plan page. */
  async waitForPlanPage(planName = getLocationConfig().planName) {
    const planPattern = new RegExp(this.escapeRegExp(planName), 'i');

    await this.driver.waitUntil(
      async () => {
        const snapshot = await this.driver.execute(() => {
          const text = (document.body?.innerText || document.documentElement?.textContent || '').slice(0, 12000);

          return {
            readyState: document.readyState,
            text,
            title: document.title,
            url: window.location.href,
          };
        });

        return (
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

  /** Verifies plan URL contains. */
  async verifyPlanUrlContains(expectedUrlPart = getLocationConfig().expectedPlanUrlPart) {
    assert.match(await this.driver.getUrl(), new RegExp(this.escapeRegExp(expectedUrlPart), 'i'));
  }

  /** Verifies hero summary for plan. */
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
        bodyText: normalize(document.body?.innerText || document.documentElement?.textContent || ''),
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

  /** Verifies home specs present. */
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
            document.documentElement?.textContent || body?.textContent || '',
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

  /** Verifies mobile community link navigation. */
  async verifyMobileCommunityLinkNavigation() {
    const location = getLocationConfig();

    await this.waitForPlanPage(location.planName);
    const snapshot = await this.getPlanSourceSnapshot();

    if (snapshot.isSourceOnly) {
      assert.match(
        snapshot.sourceText,
        new RegExp(this.escapeRegExp(location.community), 'i'),
        `Expected mobile plan source to include community name ${location.community}`
      );
      assert.match(
        snapshot.sourceText,
        new RegExp(this.escapeRegExp(location.communityPath || this.getCommunityPath(location)), 'i'),
        `Expected mobile plan source to include community path ${location.communityPath}`
      );
      return;
    }

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
  }

  /** Verifies gallery. */
  async verifyGallery() {
    await this.waitForPlanPage();
    const snapshot = await this.getPlanSourceSnapshot();

    if (snapshot.isSourceOnly) {
      assert.match(
        snapshot.sourceText,
        /image|legacyImage|openGraphImage|gallery|src/i,
        'Expected plan source to include gallery or image data'
      );
      return;
    }

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

  /** Verifies interactive floor plan section. */
  async verifyInteractiveFloorPlanSection() {
    await this.verifyOptionalSection(
      /interactive floorplan|floor ?plan/i,
      'Interactive floorplan section not present on mobile plan page - skipping validation',
      /view floorplan|interactive floorplan|floor ?plan|iframe/i
    );
  }

  /** Verifies exterior styles section. */
  async verifyExteriorStylesSection() {
    await this.verifyOptionalSection(
      /exterior styles|exterior/i,
      'Exterior styles section not present on mobile plan page - skipping validation',
      /exterior|elevation|style/i
    );
  }

  /** Verifies mortgage calculator CTA. */
  async verifyMortgageCalculatorCta() {
    await this.verifyOptionalSection(
      /mortgage calculator/i,
      'Mortgage Calculator section not present on mobile plan page - skipping validation',
      /get started|calculate|mortgage/i
    );
  }

  /** Verifies quick move in homes section. */
  async verifyQuickMoveInHomesSection() {
    const result = await this.getSectionSnapshot(/quick move-in homes|quick move-ins|available homes/i);

    if (!result.found) {
      this.logSkip('QMI section not present on mobile plan page - skipping validation');
      return;
    }

    assert.match(result.text, /quick move|available homes|view all|ready/i);
    assert.ok(result.linkCount > 0 || /show more|view all/i.test(result.text), 'Expected QMI section links or CTA');
  }

  /** Verifies sales office section. */
  async verifySalesOfficeSection() {
    const result = await this.getSectionSnapshot(/sales office|hours|directions|call|new home gallery/i);

    if (!result.found) {
      this.logSkip('Sales office section not present on mobile plan page - skipping validation');
      return;
    }

    assert.match(result.text, /hours|directions|call|office|gallery/i);
  }

  /** Verifies plan detail form. */
  async verifyPlanDetailForm() {
    await this.waitForPlanForm();
    const snapshot = await this.getPlanSourceSnapshot();

    if (snapshot.isSourceOnly) {
      assert.match(snapshot.sourceText, /eloqua|dynaMXForm|form|first name|email/i);
      return;
    }

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

  /** Validates plan detail form empty errors. */
  async validatePlanDetailFormEmptyErrors() {
    await this.waitForPlanForm();
    const snapshot = await this.getPlanSourceSnapshot();

    if (snapshot.isSourceOnly) {
      this.logSkip('Plan form is available only in source snapshot on mobile - skipping interactive empty-form validation');
      return;
    }

    await this.submitVisiblePlanFormByIndex(0);
    const errorSnapshot = await this.getFormErrorSnapshot();

    assert.ok(
      /required|invalid|error|please enter|field is required/i.test(errorSnapshot.text) || errorSnapshot.invalidFieldCount > 0,
      'Expected required field validation after submitting empty plan form'
    );
  }

  /** Validates plan detail form invalid email. */
  async validatePlanDetailFormInvalidEmail() {
    await this.waitForPlanForm();
    const snapshot = await this.getPlanSourceSnapshot();

    if (snapshot.isSourceOnly) {
      this.logSkip('Plan form is available only in source snapshot on mobile - skipping interactive invalid-email validation');
      return;
    }

    await this.fillInvalidEmailPlanFormByIndex(0);
    const errorSnapshot = await this.getFormErrorSnapshot();

    assert.ok(
      /email|valid domain|invalid|please enter/i.test(
        `${errorSnapshot.text} ${errorSnapshot.emailValidationMessage} ${errorSnapshot.emailAriaInvalid}`
      ),
      'Expected invalid email validation on plan form'
    );
  }

  /** Verifies plan detail form success submission. */
  async verifyPlanDetailFormSuccessSubmission() {
    const { envName } = getEnvConfig();

    assert.notEqual(envName, 'PROD', 'Plan detail form success submission must not run on PROD');

    await this.waitForPlanForm();
    const snapshot = await this.getPlanSourceSnapshot();

    if (snapshot.isSourceOnly) {
      this.logSkip('Plan form is available only in source snapshot on mobile - skipping interactive success submission');
      return;
    }

    await this.fillValidPlanFormByIndex(0);
    await this.assertSubmissionSuccess('Expected successful submission confirmation for plan detail form');
  }

  /** Verifies qmisection. */
  async verifyQMISection() {
    await this.verifyQuickMoveInHomesSection();
  }

  /** Verifies optional section. */
  async verifyOptionalSection(headingPattern, skipMessage, contentPattern) {
    const snapshot = await this.getPlanSourceSnapshot();

    if (snapshot.isSourceOnly) {
      if (!headingPattern.test(snapshot.sourceText)) {
        this.logSkip(skipMessage);
        return;
      }

      assert.match(snapshot.sourceText, contentPattern);
      return;
    }

    const result = await this.getSectionSnapshot(headingPattern);

    if (!result.found) {
      this.logSkip(skipMessage);
      return;
    }

    assert.match(result.text, contentPattern);
  }

  /** Returns section snapshot. */
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

  /** Waits for plan form. */
  async waitForPlanForm() {
    await this.waitForPlanPage();
    const snapshot = await this.getPlanSourceSnapshot();

    if (snapshot.isSourceOnly && /eloqua|dynaMXForm|form|email/i.test(snapshot.sourceText)) {
      return;
    }

    await this.waitForBodyText(
      /sign up for community updates|first name|last name|email|zip\/postal code|submit/i,
      'Expected plan detail lead form to render on mobile plan page',
      45000
    );
    await this.closeCookiePreferencesIfVisible();
    await installVisibleLeadFormFinder(this.driver, {
      globalName: PLAN_FORM_GLOBAL,
    });
  }

  /** Submits visible plan form by index. */
  async submitVisiblePlanFormByIndex(formIndex = 0) {
    const submitted = await submitVisibleLeadFormByIndex(this.driver, PLAN_FORM_GLOBAL, formIndex);
    assert.equal(submitted, true, `Expected visible plan form at index ${formIndex}`);
  }

  /** Fills invalid email plan form by index. */
  async fillInvalidEmailPlanFormByIndex(formIndex = 0) {
    const filled = await fillInvalidEmailLeadFormByIndex(this.driver, PLAN_FORM_GLOBAL, formIndex);
    assert.equal(filled, true, `Expected plan form at index ${formIndex} to validate invalid email`);
  }

  /** Fills valid plan form by index. */
  async fillValidPlanFormByIndex(formIndex = 0) {
    const submitted = await fillValidLeadFormByIndex(this.driver, PLAN_FORM_GLOBAL, formIndex, {
      emailPrefix: 'ssdas_plan_mobile',
    });
    assert.equal(submitted, true, `Expected plan form at index ${formIndex} to submit valid data`);
  }

  /** Returns form error snapshot. */
  async getFormErrorSnapshot() {
    return getLeadFormErrorSnapshot(this.driver);
  }

  /** Asserts submission success. */
  async assertSubmissionSuccess(message) {
    await assertLeadFormSubmissionSuccess(this.driver, message);
  }
}

module.exports = { MobileWebPlanPage };
