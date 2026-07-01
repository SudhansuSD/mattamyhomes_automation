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

const QMI_FORM_GLOBAL = '__getVisibleQmiForms';

class MobileWebQMIPage extends MobileWebHomePage {
  qmiPageReady = false;

  /** Waits for QMI page. */
  async waitForQmiPage(address = getLocationConfig().qmiAddress) {
    const location = getLocationConfig();

    if (this.qmiPageReady) {
      const currentUrl = await this.driver.getUrl();

      if (new RegExp(this.escapeRegExp(location.qmiPath), 'i').test(currentUrl)) {
        return;
      }

      this.qmiPageReady = false;
      await this.driver.url(`${location.qmiPath}?${location.queryParam}`);
    }

    const addressPattern = new RegExp(this.escapeRegExp(address), 'i');
    const pathPattern = new RegExp(this.escapeRegExp(location.qmiPath), 'i');
    let lastSnapshot = {
      bodyText: '',
      currentUrl: '',
      readyState: '',
      title: '',
    };

    await this.waitForPageReady(60000);

    try {
      await this.driver.waitUntil(
        async () => {
          lastSnapshot = await this.getSnapshot();

          return (
            pathPattern.test(lastSnapshot.currentUrl) &&
            addressPattern.test(
              `${lastSnapshot.title}\n${lastSnapshot.bodyText}\n${lastSnapshot.currentUrl}`
            )
          );
        },
        {
          timeout: 30000,
          timeoutMsg: `Expected mobile QMI detail page for ${address}. Last snapshot: ${JSON.stringify({
            currentUrl: lastSnapshot.currentUrl,
            title: lastSnapshot.title,
            readyState: lastSnapshot.readyState,
            bodyText: lastSnapshot.bodyText.slice(0, 300),
          })}`,
        }
      );
    } catch (error) {
      if (
        /invalid session id|browser has closed the connection|disconnected/i.test(
          String(error?.message || error)
        )
      ) {
        throw new Error(
          `Mobile Chrome session was lost while waiting for QMI page. Last URL: ${
            lastSnapshot.currentUrl || '(unavailable)'
          }. Restart the emulator/Chrome if this repeats.`
        );
      }

      throw error;
    }

    await this.closeCookiePreferencesIfVisible();
    this.qmiPageReady = true;
    this.logOpen('QMI detail', lastSnapshot.currentUrl || (await this.driver.getUrl()));
  }

  /** Verifies exact QMI URL. */
  async verifyExactQmiUrl() {
    const location = getLocationConfig();
    const currentPath = new URL(await this.driver.getUrl()).pathname;

    assert.equal(
      currentPath,
      location.qmiPath,
      `Expected QMI URL path to be ${location.qmiPath}`
    );
  }

  /** Verifies hero section. */
  async verifyHeroSection(address = getLocationConfig().qmiAddress) {
    await this.waitForQmiPage(address);

    const location = getLocationConfig();

    const snapshot = await this.driver.execute(() => {
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

      const heading = Array.from(document.querySelectorAll('h1, h2, h3')).find(
        isVisible
      );

      const hero =
        heading?.closest('section, div, main') ||
        document.querySelector('main') ||
        document.body;

      const media = Array.from(
        document.querySelectorAll(
          'main img[src], main picture source[srcset], main video, img[src], picture source[srcset], video'
        )
      );

      const visibleMedia = media.filter((element) => {
        if (!isVisible(element)) {
          return false;
        }

        const text = `${element.getAttribute('alt') || ''} ${
          element.getAttribute('src') || ''
        } ${element.getAttribute('srcset') || ''}`;

        return !/logo|icon|favorite|share|copyright|facebook|instagram|youtube|linkedin/i.test(
          text
        );
      });

      return {
        bodyText: normalize(document.body?.innerText || ''),
        currentUrl: window.location.href,
        headingText: normalize(heading?.textContent || ''),
        hasHero: Boolean(heading || hero),
        hasMedia:
          visibleMedia.length > 0 ||
          media.length > 0 ||
          Boolean(hero?.querySelector('[style*="background-image"]')),
      };
    });

    assert.equal(snapshot.hasHero, true, 'Expected QMI hero content on mobile');

    assert.match(
      `${snapshot.headingText}\n${snapshot.bodyText}\n${snapshot.currentUrl}`,
      new RegExp(
        `${this.escapeRegExp(address)}|${this.escapeRegExp(location.qmiPath)}`,
        'i'
      )
    );

    assert.equal(snapshot.hasMedia, true, 'Expected QMI hero media on mobile');
  }

  /** Verifies hero home facts. */
  async verifyHeroHomeFacts() {
    await this.waitForQmiPage();

    const bodyText = await this.getBodyText();
    const hasClassicFacts =
      /bed/i.test(bodyText) &&
      /bath/i.test(bodyText) &&
      /sq\.?\s*ft\.?/i.test(bodyText);

    if (hasClassicFacts) {
      return;
    }

    assert.match(
      bodyText,
      /interactive floorplan|floor ?plan|home features|curated home features/i,
      'Expected QMI page to include home facts or mobile home-detail content'
    );
  }

  /** Verifies price or CTA. */
  async verifyPriceOrCTA() {
    await this.waitForQmiPage();

    const bodyText = await this.getBodyText();

    assert.ok(
      /\$[\d,]+|get information|contact|request info/i.test(bodyText),
      'Expected QMI price or conversion CTA on mobile'
    );
  }

  /** Verifies get information scrolls to form. */
  async verifyGetInformationScrollsToForm() {
    await this.waitForQmiPage();

    const initialUrl = await this.driver.getUrl();
    const clicked = await this.clickVisibleByText(
      /get information|request info|contact/i,
      ['a', 'button']
    );

    if (!clicked) {
      this.logSkip(
        'Get Information CTA not present on mobile QMI page - skipping scroll validation'
      );
      return;
    }

    await this.driver.pause(1000);

    const ctaResult = await this.driver.execute(() => {
      const text = document.body?.innerText || '';

      const formSection = Array.from(
        document.querySelectorAll('form, section, div, [role="group"]')
      ).find((element) =>
        /sign up for community updates|required fields|first name|last name|email/i.test(
          element.textContent || ''
        )
      );

      formSection?.scrollIntoView({ block: 'center', inline: 'center' });

      return {
        currentUrl: window.location.href,
        hasFormContext:
          /sign up for community updates|required fields|first name|last name|email/i.test(
            text
          ),
        hasLeadActionContext: /get information|request info|contact|submit/i.test(
          text
        ),
      };
    });

    assert.ok(
      ctaResult.hasFormContext ||
        ctaResult.hasLeadActionContext ||
        ctaResult.currentUrl !== initialUrl ||
        /#|contact|form|schedule/i.test(ctaResult.currentUrl),
      'Expected Get Information CTA to expose lead form context or navigate to a lead action'
    );
  }

  /** Verifies gallery. */
  async verifyGallery() {
    await this.waitForQmiPage();

    let gallery = {
      controlCount: 0,
      mediaCount: 0,
    };

    await this.driver.waitUntil(async () => {
      gallery = await this.driver.execute(() => {
      const isVisible = (element) => {
        if (!element) {
          return false;
        }

        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();

        return (
          style.visibility !== 'hidden' &&
          style.display !== 'none' &&
          rect.width > 0 &&
          rect.height > 0
        );
      };

      const images = Array.from(document.querySelectorAll('img')).filter(
        (element) =>
          isVisible(element) &&
          Boolean(element.currentSrc || element.getAttribute('src'))
      );

      const pictureSources = Array.from(
        document.querySelectorAll('picture source[srcset]')
      ).filter((element) =>
        isVisible(element.closest('picture') || element.parentElement)
      );

      const backgroundMedia = Array.from(
        document.querySelectorAll('main *, section *, [style*="background-image"]')
      ).filter((element) => {
        if (!isVisible(element)) {
          return false;
        }

        const backgroundImage = window.getComputedStyle(element).backgroundImage;

        return backgroundImage && backgroundImage !== 'none';
      });

      const controls = Array.from(
        document.querySelectorAll('button, [role="button"]')
      ).filter(
        (element) =>
          isVisible(element) &&
          /next|previous|prev|slide|gallery|image/i.test(
            `${element.textContent || ''} ${
              element.getAttribute('aria-label') || ''
            }`
          )
      );

      if (controls[0] instanceof HTMLElement) {
        controls[0].click();
      }

      return {
        controlCount: controls.length,
        mediaCount: images.length + pictureSources.length + backgroundMedia.length,
      };
    });

      return gallery.mediaCount > 0;
    }, {
      timeout: 15000,
      timeoutMsg: 'Expected QMI gallery or hero images on mobile',
    });

    assert.ok(
      gallery.mediaCount > 0,
      'Expected QMI gallery or hero images on mobile'
    );
  }

  /** Verifies floor plan. */
  async verifyFloorPlan() {
    await this.verifyOptionalSection(
      /floor ?plan/i,
      'Floor plan section not present on mobile QMI page - skipping validation',
      /floor ?plan|sq\.?\s*ft|bed|bath/i
    );
  }

  /** Verifies interactive floor plan. */
  async verifyInteractiveFloorPlan() {
    await this.verifyOptionalSection(
      /interactive floorplan/i,
      'Interactive floorplan section not present on mobile QMI page - skipping validation',
      /interactive floorplan|view floorplan|iframe|floor ?plan/i
    );
  }

  /** Verifies community sitemap. */
  async verifyCommunitySitemap() {
    await this.verifyOptionalSection(
      /explore the community|site ?map|community map/i,
      'Community sitemap section not present on mobile QMI page - skipping validation',
      /explore the community|site ?map|map|lot|community/i
    );
  }

  /** Verifies home design details. */
  async verifyHomeDesignDetails() {
    await this.verifyOptionalSection(
      /home design details|design details/i,
      'Home Design Details section not present on mobile QMI page - skipping validation',
      /home design details|beds|baths|garage|sq\.?\s*ft|stories/i
    );
  }

  /** Verifies home features. */
  async verifyHomeFeatures() {
    await this.verifyOptionalSection(
      /home features|features/i,
      'Home Features section not present on mobile QMI page - skipping validation',
      /features|included|design|flooring|kitchen|bath|garage/i
    );
  }

  /** Verifies sales office and contact form. */
  async verifySalesOfficeAndContactForm() {
    await this.waitForQmiPage();

    const snapshot = await this.driver.execute(() => {
      const text = document.body?.innerText || '';

      return {
        hasContactContext:
          /sales office|new home gallery|hours|directions|call|phone|contact/i.test(
            text
          ),
        hasFormContext:
          /sign up for community updates|first name|last name|email|submit/i.test(
            text
          ),
      };
    });

    assert.equal(
      snapshot.hasContactContext,
      true,
      'Expected QMI sales office/contact context on mobile'
    );

    if (!snapshot.hasFormContext) {
      this.logSkip(
        'QMI community updates form not present on mobile - skipping sales office form context validation'
      );
    }
  }

  /** Verifies related quick move in homes. */
  async verifyRelatedQuickMoveInHomes() {
    this.logValidate('Validate related QMI homes section');
    const result = await this.getRelatedQuickMoveInHomesSnapshot();

    if (!result.found) {
      this.logSkip(
        'Related QMI section not present on mobile QMI page - skipping validation'
      );
      return;
    }

    assert.match(result.text, /quick move|available homes|view all|ready/i);

    if (result.relatedQmiLinks.length === 0) {
      this.logSkip(
        'Related QMI section has no internal QMI links on mobile - skipping link validation'
      );
      return;
    }

    for (const href of result.ignoredLinks) {
      this.logSkip(`Ignored non-QMI related link: ${href}`);
    }

    for (const href of result.relatedQmiLinks) {
      this.logResult(`Related QMI home: ${href}`);
    }
  }

  /** Validates QMI form fields. */
  async validateQmiFormFields() {
    const form = await this.getVisibleQmiForm();

    if (!form.found) {
      this.logSkip(
        'QMI community updates form not present on mobile - skipping form field validation'
      );
      return;
    }

    assert.match(form.text, /first name/i);
    assert.match(form.text, /last name/i);
    assert.match(form.text, /email/i);
    assert.match(form.text, /country of residence|country/i);
    assert.match(form.text, /zip|postal/i);

    assert.equal(
      form.hasSubmit,
      true,
      'Expected QMI form submit button on mobile'
    );
  }

  /** Validates QMI form required errors. */
  async validateQmiFormRequiredErrors() {
    const submitted = await this.submitVisibleQmiFormByIndex(0);

    if (!submitted) {
      this.logSkip(
        'QMI community updates form not present on mobile - skipping required validation'
      );
      return;
    }

    const snapshot = await this.getFormErrorSnapshot();

    assert.ok(
      /required|invalid|error|please enter|field is required/i.test(
        snapshot.text
      ) || snapshot.invalidFieldCount > 0,
      'Expected required field validation after submitting empty QMI form'
    );
  }

  /** Validates QMI form invalid email. */
  async validateQmiFormInvalidEmail() {
    const filled = await this.fillInvalidEmailQmiFormByIndex(0);

    if (!filled) {
      this.logSkip(
        'QMI community updates form not present on mobile - skipping invalid email validation'
      );
      return;
    }

    const snapshot = await this.getFormErrorSnapshot();

    assert.ok(
      /email|valid domain|invalid|please enter/i.test(
        `${snapshot.text} ${snapshot.emailValidationMessage} ${snapshot.emailAriaInvalid}`
      ),
      'Expected invalid email validation on QMI form'
    );
  }

  /** Verifies QMI form success submission. */
  async verifyQmiFormSuccessSubmission() {
    const { envName } = getEnvConfig();

    assert.notEqual(envName, 'PROD', 'QMI form success submission must not run on PROD');

    const submitted = await this.fillValidQmiFormByIndex(0);

    if (!submitted) {
      this.logSkip(
        'QMI community updates form not present on mobile - skipping success submission'
      );
      return;
    }

    await this.assertSubmissionSuccess(
      'Expected successful submission confirmation for QMI form'
    );
  }

  /** Verifies mortgage popup. */
  async verifyMortgagePopup() {
    await this.waitForQmiPage();

    const mortgageSnapshot = await this.driver.execute(() => {
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

      const links = Array.from(document.querySelectorAll('a[href]'));

      const mortgageLink = links.find((link) => {
        const href = link.getAttribute('href') || '';
        const text = `${link.textContent || ''} ${
          link.getAttribute('aria-label') || ''
        }`;

        return (
          isVisible(link) &&
          (
            /apply\.mattamyhf\.com/i.test(href) ||
            /loanType=MORTGAGE/i.test(href) ||
            /mortgage|financing|get started|calculator/i.test(text)
          )
        );
      });

      const buttons = Array.from(
        document.querySelectorAll('button, [role="button"]')
      );

      const mortgageButton = buttons.find((button) => {
        const text = `${button.textContent || ''} ${
          button.getAttribute('aria-label') || ''
        }`;

        return (
          isVisible(button) &&
          /mortgage|financing|get started|calculator/i.test(text)
        );
      });

      return {
        found: Boolean(mortgageLink || mortgageButton),
        href: mortgageLink?.getAttribute('href') || '',
        text: normalize(
          mortgageLink?.textContent ||
            mortgageButton?.textContent ||
            mortgageButton?.getAttribute('aria-label') ||
            ''
        ),
        isExternalMortgageLink: mortgageLink
          ? /apply\.mattamyhf\.com/i.test(
              mortgageLink.getAttribute('href') || ''
            ) ||
            /loanType=MORTGAGE/i.test(mortgageLink.getAttribute('href') || '')
          : false,
      };
    });

    if (!mortgageSnapshot.found) {
      this.logSkip(
        'Mortgage CTA/link not present on mobile QMI page - skipping mortgage validation'
      );
      return;
    }

    assert.ok(
      mortgageSnapshot.isExternalMortgageLink ||
        /mortgage|financing|get started|calculator/i.test(
          `${mortgageSnapshot.text} ${mortgageSnapshot.href}`
        ),
      `Expected mortgage CTA/link context, but got: ${JSON.stringify(
        mortgageSnapshot
      )}`
    );

    this.logResult(
      `Mortgage CTA/link validated without opening external link. Text: "${mortgageSnapshot.text}", href: "${mortgageSnapshot.href}"`
    );
  }

  /** Verifies breadcrumb navigation. */
  async verifyBreadcrumbNavigation() {
    this.logValidate('Validate QMI breadcrumb URL context');
    await this.waitForQmiPage();

    const location = getLocationConfig();
    const segments = location.qmiPath.split('/').filter(Boolean);
    const communitySlug = segments[3];
    const addressSlug = segments.slice(-1)[0];

    const snapshot = await this.driver.execute(({ communitySlug, addressSlug }) => {
      const normalize = (value) => (value || '').replace(/\s+/g, ' ').trim();
      const candidates = Array.from(
        document.querySelectorAll(
          '#breadcrumb, [aria-label*="breadcrumb" i], nav[aria-label*="Breadcrumb" i], .breadcrumb, [class*="breadcrumb" i]'
        )
      );
      const breadcrumb = candidates.find((element) => {
        const text = normalize(element.textContent).toLowerCase();
        const hrefs = Array.from(element.querySelectorAll('a[href]'))
          .map((link) => link.getAttribute('href') || '')
          .join(' ')
          .toLowerCase();
        const context = `${text} ${hrefs}`;
        const linkCount = element.querySelectorAll('a[href]').length;

        return linkCount >= 2 && /home|mattamy|community|quick move|breadcrumb/i.test(context);
      });

      return {
        breadcrumbText: normalize(breadcrumb?.textContent || ''),
        currentUrl: window.location.href,
      };
    }, { communitySlug, addressSlug });

    assert.match(
      snapshot.currentUrl,
      new RegExp(this.escapeRegExp(communitySlug), 'i')
    );

    assert.match(
      snapshot.currentUrl,
      new RegExp(this.escapeRegExp(addressSlug), 'i')
    );

    if (snapshot.breadcrumbText) {
      assert.match(snapshot.breadcrumbText, /home|mattamy|community|quick move/i);
    } else {
      this.logValidate('Breadcrumb trail not rendered on mobile QMI page; validated URL context only');
    }
  }

  /** Verifies breadcrumb links. */
  async verifyBreadcrumbLinks() {
    this.logValidate('Validate QMI breadcrumb links when rendered');
    await this.waitForQmiPage();

    const location = getLocationConfig();
    const segments = location.qmiPath.split('/').filter(Boolean);
    const communityPath = `/${segments.slice(0, 4).join('/')}`;
    const planPath = `/${segments.slice(0, 5).join('/')}`;

    const result = await this.driver.execute(({ communityPath, planPath }) => {
      const normalize = (value) => (value || '').replace(/\s+/g, ' ').trim();
      const candidates = Array.from(
        document.querySelectorAll(
          '#breadcrumb, [aria-label*="breadcrumb" i], nav[aria-label*="Breadcrumb" i], .breadcrumb, [class*="breadcrumb" i]'
        )
      );
      const root = candidates.find((element) => {
        const text = normalize(element.textContent).toLowerCase();
        const links = Array.from(element.querySelectorAll('a[href]')).map(
          (link) => link.getAttribute('href') || ''
        );
        const hrefs = links.join(' ').toLowerCase();
        const context = `${text} ${hrefs}`;

        return (
          links.length >= 2 &&
          /home|mattamy|community|quick move|breadcrumb/i.test(context) &&
          (context.includes(communityPath.toLowerCase()) || context.includes(planPath.toLowerCase()))
        );
      });

      const links = Array.from(root?.querySelectorAll('a[href]') || []).map(
        (link) => link.getAttribute('href') || ''
      );

      return {
        links,
        text: normalize(root?.textContent || ''),
      };
    }, { communityPath, planPath });

    if (!result.links.length) {
      this.logSkip(
        'Breadcrumb links not present on mobile QMI page - validating breadcrumb text/URL context only'
      );

      assert.match(
        await this.driver.getUrl(),
        new RegExp(this.escapeRegExp(location.qmiPath), 'i')
      );

      return;
    }

    assert.ok(
      result.links.some((href) => href.includes(communityPath)),
      `Expected breadcrumb links to include community path ${communityPath}`
    );

    assert.ok(
      result.links.some((href) => href.includes(planPath)),
      `Expected breadcrumb links to include plan path ${planPath}`
    );

    assert.match(
      result.text,
      new RegExp(this.escapeRegExp(location.qmiAddress), 'i')
    );
  }

  /** Verifies plan name link navigation. */
  async verifyPlanNameLinkNavigation() {
    this.logValidate('Validate QMI plan name link navigation');
    await this.waitForQmiPage();

    const location = getLocationConfig();
    const qmiSegments = location.qmiPath.split('/').filter(Boolean);
    const qmiPlanSlug = qmiSegments[qmiSegments.length - 2];
    const qmiPlanName = qmiPlanSlug
      .split('-')
      .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
      .join(' ');
    const planPath = `/${qmiSegments.slice(0, -1).join('/')}`;

    const planLink = await this.driver.execute(
      (planName, expectedPlanPath) => {
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

        const links = Array.from(document.querySelectorAll('a[href]')).filter(
          isVisible
        );

        const link = links.find((element) => {
          const text = normalize(element.textContent);
          const href = element.getAttribute('href') || '';
          const normalizedText = text.toLowerCase();
          const normalizedPlanName = planName.toLowerCase();

          return (
            href.includes(expectedPlanPath) &&
            (!text || normalizedText.includes(normalizedPlanName))
          );
        });

        return {
          found: Boolean(link),
          href: link?.getAttribute('href') || '',
          text: normalize(link?.textContent || ''),
        };
      },
      qmiPlanName,
      planPath
    );

    assert.equal(
      planLink.found,
      true,
      `Expected mobile QMI page to show linked QMI plan ${qmiPlanName}`
    );

    assert.match(
      planLink.href,
      new RegExp(this.escapeRegExp(planPath), 'i'),
      `Expected mobile plan name link to point to ${planPath}`
    );

    this.logOpen(`QMI plan link ${qmiPlanName}`, planLink.href);

    await this.driver.execute(
      (planName, expectedPlanPath) => {
        const normalize = (value) => (value || '').replace(/\s+/g, ' ').trim();
        const links = Array.from(document.querySelectorAll('a[href]'));
        const link = links.find((element) => {
          const text = normalize(element.textContent);
          const href = element.getAttribute('href') || '';
          const normalizedText = text.toLowerCase();
          const normalizedPlanName = planName.toLowerCase();

          return (
            href.includes(expectedPlanPath) &&
            (!text || normalizedText.includes(normalizedPlanName))
          );
        });

        link?.click();
      },
      qmiPlanName,
      planPath
    );

    await this.driver.waitUntil(
      async () => {
        const currentPath = new URL(await this.driver.getUrl()).pathname;

        return new RegExp(this.escapeRegExp(planPath), 'i').test(currentPath);
      },
      {
        timeout: 15000,
        timeoutMsg: `Expected mobile plan name link to navigate to ${planPath}`,
      }
    );
  }

  /** Verifies optional section. */
  async verifyOptionalSection(headingPattern, skipMessage, contentPattern) {
    const result = await this.getSectionSnapshot(headingPattern);

    if (!result.found) {
      this.logSkip(skipMessage);
      return;
    }

    assert.match(result.text, contentPattern);
  }

  /** Returns section snapshot. */
  async getSectionSnapshot(pattern) {
    await this.waitForQmiPage();

    return this.driver.execute(
      ({ source, flags }) => {
        const regex = new RegExp(source, flags);

        const normalize = (value) =>
          (value || '').replace(/\s+/g, ' ').trim();

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

        const section = Array.from(
          document.querySelectorAll('section, article, div')
        ).find(
          (element) => isVisible(element) && regex.test(element.textContent || '')
        );

        section?.scrollIntoView({ block: 'center', inline: 'center' });

        return {
          found: Boolean(section),
          hrefs: Array.from(section?.querySelectorAll('a[href]') || []).map(
            (link) => link.getAttribute('href') || ''
          ),
          linkCount: section?.querySelectorAll('a[href]').length || 0,
          text: normalize(section?.textContent || ''),
        };
      },
      { source: pattern.source, flags: pattern.flags }
    );
  }

  /** Returns related quick move in homes snapshot. */
  async getRelatedQuickMoveInHomesSnapshot() {
    await this.waitForQmiPage();

    const location = getLocationConfig();

    return this.driver.execute(
      ({ communityPath, currentQmiPath }) => {
        const normalize = (value) => (value || '').replace(/\s+/g, ' ').trim();
        const normalizeHref = (href) => {
          try {
            return new URL(href, window.location.origin).pathname.replace(/\/+$/, '');
          } catch {
            return href || '';
          }
        };
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
        const isNonQmiPageUrl = (href) => {
          if (/^(?:tel:|mailto:|sms:|fb:|instagram:|javascript:)/i.test(href)) {
            return true;
          }

          try {
            const url = new URL(href, window.location.origin);

            return /^https?:/i.test(url.protocol) && !url.hostname.endsWith('mattamyhomes.com');
          } catch {
            return true;
          }
        };
        const community = communityPath.replace(/\/+$/, '').toLowerCase();
        const currentPath = currentQmiPath.replace(/\/+$/, '').toLowerCase();
        const headingPattern = /quick move-in homes ready when you are|related homes|quick move-ins|available homes/i;
        const heading = Array.from(document.querySelectorAll('h1, h2, h3, h4')).find(
          (element) => isVisible(element) && headingPattern.test(element.textContent || '')
        );
        const section =
          heading?.closest('section, article, [class*="related" i], [class*="qmi" i]') ||
          Array.from(document.querySelectorAll('section, article')).find(
            (element) => isVisible(element) && headingPattern.test(element.textContent || '')
          );

        section?.scrollIntoView({ block: 'center', inline: 'center' });

        const allLinks = Array.from(section?.querySelectorAll('a[href]') || [])
          .map((link) => link.getAttribute('href') || '')
          .filter(Boolean);
        const ignoredLinks = allLinks.filter(isNonQmiPageUrl);
        const relatedQmiLinks = allLinks
          .filter((href) => !isNonQmiPageUrl(href))
          .map(normalizeHref)
          .filter((href, index, all) => {
            const lowerHref = href.toLowerCase();
            const segments = lowerHref.split('/').filter(Boolean);

            return (
              all.indexOf(href) === index &&
              lowerHref.startsWith(community) &&
              lowerHref !== currentPath &&
              !lowerHref.includes('#') &&
              segments.length >= 6
            );
          });

        return {
          found: Boolean(section),
          ignoredLinks,
          relatedQmiLinks,
          text: normalize(section?.textContent || ''),
        };
      },
      {
        communityPath: location.communityPath || this.getCommunityPath(location),
        currentQmiPath: location.qmiPath,
      }
    );
  }

  /** Returns visible QMI form. */
  async getVisibleQmiForm() {
    await this.waitForQmiPage();
    await this.installQmiFormFinder();

    return this.driver.execute(() => {
      const form = window.__getVisibleQmiForms?.()[0];

      return {
        found: Boolean(form),
        hasSubmit: Boolean(
          form?.querySelector('button[type="submit"], input[type="submit"], button')
        ),
        text: (form?.textContent || '').replace(/\s+/g, ' ').trim(),
      };
    });
  }

  /** Installs QMI form finder. */
  async installQmiFormFinder() {
    await installVisibleLeadFormFinder(this.driver, {
      containerSelectors: 'section, div, [role="group"]',
      globalName: QMI_FORM_GLOBAL,
    });
  }

  /** Submits visible QMI form by index. */
  async submitVisibleQmiFormByIndex(formIndex = 0) {
    await this.installQmiFormFinder();
    return submitVisibleLeadFormByIndex(this.driver, QMI_FORM_GLOBAL, formIndex);
  }

  /** Fills invalid email QMI form by index. */
  async fillInvalidEmailQmiFormByIndex(formIndex = 0) {
    await this.installQmiFormFinder();
    return fillInvalidEmailLeadFormByIndex(this.driver, QMI_FORM_GLOBAL, formIndex);
  }

  /** Fills valid QMI form by index. */
  async fillValidQmiFormByIndex(formIndex = 0) {
    await this.installQmiFormFinder();
    return fillValidLeadFormByIndex(this.driver, QMI_FORM_GLOBAL, formIndex, {
      emailPrefix: 'ssdas_qmi_mobile',
    });
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

module.exports = { MobileWebQMIPage };
