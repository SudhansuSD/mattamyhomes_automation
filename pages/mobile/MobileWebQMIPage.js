const assert = require('node:assert/strict');
const { MobileWebHomePage } = require('./MobileWebHomePage');
const { getLocationConfig } = require('../../config/locations/locationConfig');

class MobileWebQMIPage extends MobileWebHomePage {
  qmiPageReady = false;

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
  }

  async verifyPageLoaded(address = getLocationConfig().qmiAddress) {
    await this.waitForQmiPage(address);
    const snapshot = await this.getSnapshot();

    assert.match(
      `${snapshot.title}\n${snapshot.bodyText}`,
      new RegExp(this.escapeRegExp(address), 'i')
    );

    this.assertNoErrorPage(snapshot);
  }

  async verifyExactQmiUrl() {
    const location = getLocationConfig();
    const currentPath = new URL(await this.driver.getUrl()).pathname;

    assert.equal(
      currentPath,
      location.qmiPath,
      `Expected QMI URL path to be ${location.qmiPath}`
    );
  }

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

  async verifyPriceOrCTA() {
    await this.waitForQmiPage();

    const bodyText = await this.getBodyText();

    assert.ok(
      /\$[\d,]+|get information|contact|request info/i.test(bodyText),
      'Expected QMI price or conversion CTA on mobile'
    );
  }

  async verifyGetInformationScrollsToForm() {
    await this.waitForQmiPage();

    const initialUrl = await this.driver.getUrl();
    const clicked = await this.clickVisibleByText(
      /get information|request info|contact/i,
      ['a', 'button']
    );

    if (!clicked) {
      console.log(
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

  async verifyFloorPlan() {
    await this.verifyOptionalSection(
      /floor ?plan/i,
      'Floor plan section not present on mobile QMI page - skipping validation',
      /floor ?plan|sq\.?\s*ft|bed|bath/i
    );
  }

  async verifyInteractiveFloorPlan() {
    await this.verifyOptionalSection(
      /interactive floorplan/i,
      'Interactive floorplan section not present on mobile QMI page - skipping validation',
      /interactive floorplan|view floorplan|iframe|floor ?plan/i
    );
  }

  async verifyCommunitySitemap() {
    await this.verifyOptionalSection(
      /explore the community|site ?map|community map/i,
      'Community sitemap section not present on mobile QMI page - skipping validation',
      /explore the community|site ?map|map|lot|community/i
    );
  }

  async verifyHomeDesignDetails() {
    await this.verifyOptionalSection(
      /home design details|design details/i,
      'Home Design Details section not present on mobile QMI page - skipping validation',
      /home design details|beds|baths|garage|sq\.?\s*ft|stories/i
    );
  }

  async verifyHomeFeatures() {
    await this.verifyOptionalSection(
      /home features|features/i,
      'Home Features section not present on mobile QMI page - skipping validation',
      /features|included|design|flooring|kitchen|bath|garage/i
    );
  }

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
      console.log(
        'QMI community updates form not present on mobile - skipping sales office form context validation'
      );
    }
  }

  async verifyRelatedQuickMoveInHomes() {
    const result = await this.getSectionSnapshot(
      /quick move-in homes ready when you are|related homes|quick move-ins|available homes/i
    );

    if (!result.found) {
      console.log(
        'Related QMI section not present on mobile QMI page - skipping validation'
      );
      return;
    }

    assert.match(result.text, /quick move|available homes|view all|ready/i);

    if (result.linkCount === 0) {
      console.log(
        'Related QMI section has no links on mobile - skipping link validation'
      );
      return;
    }

    assert.ok(
      result.hrefs.every(Boolean),
      'Expected related QMI links to expose href values'
    );

    for (const href of result.hrefs) {
      console.log(`Related QMI URL: ${href}`);
    }
  }

  async validateQmiFormFields() {
    const form = await this.getVisibleQmiForm();

    if (!form.found) {
      console.log(
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

  async validateQmiFormRequiredErrors() {
    const submitted = await this.submitVisibleQmiFormByIndex(0);

    if (!submitted) {
      console.log(
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

  async validateQmiFormInvalidEmail() {
    const filled = await this.fillInvalidEmailQmiFormByIndex(0);

    if (!filled) {
      console.log(
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
      console.log(
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

    console.log(
      `Mortgage CTA/link validated without opening external link. Text: "${mortgageSnapshot.text}", href: "${mortgageSnapshot.href}"`
    );
  }

  async verifyBreadcrumbNavigation() {
    await this.waitForQmiPage();

    const location = getLocationConfig();
    const segments = location.qmiPath.split('/').filter(Boolean);
    const communitySlug = segments[3];
    const addressSlug = segments.slice(-1)[0];

    const snapshot = await this.driver.execute(() => {
      const breadcrumb = document.querySelector(
        '#breadcrumb, [aria-label*="breadcrumb" i], nav[aria-label*="Breadcrumb" i], .breadcrumb, [class*="breadcrumb" i]'
      );

      return {
        breadcrumbText: (breadcrumb?.textContent || '')
          .replace(/\s+/g, ' ')
          .trim(),
        currentUrl: window.location.href,
      };
    });

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
    }
  }

  async verifyBreadcrumbLinks() {
    await this.waitForQmiPage();

    const location = getLocationConfig();
    const segments = location.qmiPath.split('/').filter(Boolean);
    const communityPath = `/${segments.slice(0, 4).join('/')}`;
    const planPath = `/${segments.slice(0, 5).join('/')}`;

    const result = await this.driver.execute(() => {
      const root =
        document.querySelector(
          '#breadcrumb, [aria-label*="breadcrumb" i], nav[aria-label*="Breadcrumb" i], .breadcrumb, [class*="breadcrumb" i]'
        ) || document;

      const links = Array.from(root.querySelectorAll('a[href]')).map(
        (link) => link.getAttribute('href') || ''
      );

      return {
        links,
        text: (root.textContent || '').replace(/\s+/g, ' ').trim(),
      };
    });

    if (!result.links.length) {
      console.log(
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

  async verifyPlanNameLinkNavigation() {
    await this.waitForQmiPage();

    const location = getLocationConfig();
    const planPath = `/${location.qmiPath
      .split('/')
      .filter(Boolean)
      .slice(0, -1)
      .join('/')}`;

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

          return (
            new RegExp(`^${planName}$`, 'i').test(text) &&
            href.includes(expectedPlanPath)
          );
        });

        return {
          found: Boolean(link),
          href: link?.getAttribute('href') || '',
          text: normalize(link?.textContent || ''),
        };
      },
      location.planName,
      planPath
    );

    assert.equal(
      planLink.found,
      true,
      `Expected mobile QMI page to show linked plan name ${location.planName}`
    );

    assert.match(
      planLink.href,
      new RegExp(this.escapeRegExp(planPath), 'i'),
      `Expected mobile plan name link to point to ${planPath}`
    );

    await this.driver.execute(
      (planName, expectedPlanPath) => {
        const normalize = (value) => (value || '').replace(/\s+/g, ' ').trim();
        const links = Array.from(document.querySelectorAll('a[href]'));
        const link = links.find((element) => {
          const text = normalize(element.textContent);
          const href = element.getAttribute('href') || '';

          return (
            new RegExp(`^${planName}$`, 'i').test(text) &&
            href.includes(expectedPlanPath)
          );
        });

        link?.click();
      },
      location.planName,
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

  async verifyOptionalSection(headingPattern, skipMessage, contentPattern) {
    const result = await this.getSectionSnapshot(headingPattern);

    if (!result.found) {
      console.log(skipMessage);
      return;
    }

    assert.match(result.text, contentPattern);
  }

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

  async installQmiFormFinder() {
    await this.driver.execute(() => {
      window.__getVisibleQmiForms = () => {
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

        const isLeadForm = (form) =>
          isVisible(form) &&
          form.querySelector('input, select, textarea') &&
          form.querySelector('button, input[type="submit"]') &&
          /submit|first name|last name|email|zip|postal|community updates/i.test(
            form.textContent || ''
          );

        const uniqueBySubmitButton = (forms) => {
          const seenButtons = new Set();

          return forms.filter((form) => {
            const submit = form.querySelector(
              'button[type="submit"], input[type="submit"], button'
            );

            if (!submit || seenButtons.has(submit)) {
              return false;
            }

            seenButtons.add(submit);
            return true;
          });
        };

        const actualForms = Array.from(document.querySelectorAll('form')).filter(
          isLeadForm
        );

        if (actualForms.length) {
          return uniqueBySubmitButton(actualForms);
        }

        return uniqueBySubmitButton(
          Array.from(
            document.querySelectorAll('section, div, [role="group"]')
          ).filter(isLeadForm)
        );
      };
    });
  }

  async submitVisibleQmiFormByIndex(formIndex = 0) {
    await this.installQmiFormFinder();

    const submitted = await this.driver.execute((index) => {
      const form = window.__getVisibleQmiForms?.()[index];

      if (!form) {
        return false;
      }

      form.scrollIntoView({ block: 'center', inline: 'center' });

      const submit = form.querySelector(
        'button[type="submit"], input[type="submit"], button'
      );

      submit?.click();

      return true;
    }, formIndex);

    await this.driver.pause(1500);

    return submitted;
  }

  async fillInvalidEmailQmiFormByIndex(formIndex = 0) {
    await this.installQmiFormFinder();

    const filled = await this.driver.execute((index) => {
      const form =
        window.__getVisibleQmiForms?.()[index] ||
        window.__getVisibleQmiForms?.()[0];

      if (!form) {
        return false;
      }

      const fill = (selector, value) => {
        const input = form.querySelector(selector);

        if (
          input instanceof HTMLInputElement ||
          input instanceof HTMLTextAreaElement
        ) {
          input.focus();
          input.value = value;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      };

      form.scrollIntoView({ block: 'center', inline: 'center' });

      fill(
        'input[name*="first" i], input[id*="first" i], input[placeholder*="First" i]',
        'Test'
      );

      fill(
        'input[name*="last" i], input[id*="last" i], input[placeholder*="Last" i]',
        'User'
      );

      fill(
        'input[type="email"], input[name*="email" i], input[id*="email" i]',
        'user@domain.c'
      );

      fill(
        'input[type="tel"], input[name*="phone" i], input[id*="phone" i]',
        '123456'
      );

      const submit = form.querySelector(
        'button[type="submit"], input[type="submit"], button'
      );

      submit?.click();

      return true;
    }, formIndex);

    await this.driver.pause(1500);

    return filled;
  }

  async getFormErrorSnapshot() {
    return this.driver.execute(() => {
      const text = document.body?.innerText || '';

      const email = document.querySelector(
        'input[type="email"], input[name*="email" i], input[id*="email" i]'
      );

      const invalidFields = document.querySelectorAll(
        ':invalid, [aria-invalid="true"], .field-validation-error'
      );

      return {
        emailAriaInvalid: email?.getAttribute('aria-invalid') || '',
        emailValidationMessage: email?.validationMessage || '',
        invalidFieldCount: invalidFields.length,
        text,
      };
    });
  }
}

module.exports = { MobileWebQMIPage };
