import assert from 'node:assert/strict';
import { MobileWebHomePage } from './MobileWebHomePage';
import { getEnvConfig } from '../../config/environments/envConfig';
import { getLocationConfig } from '../../config/locations/locationConfig';
import {
  fillInvalidEmailLeadFormByIndex,
  fillValidLeadFormByIndex,
  installVisibleLeadFormFinder,
  submitVisibleLeadFormByIndex,
} from '../../utils/leadform/mobileLeadFormHelper';

const MPC_FORM_GLOBAL = '__getVisibleMpcLeadForms';

export class MobileWebMPCPage extends MobileWebHomePage {
  mpcPageReady: boolean;

  /** Sets up the page object with the locators it needs. */
  constructor(driver: MobileBrowser = browser) {
    super(driver);
    this.mpcPageReady = false;
  }

  /** Gets the configured MPC for this run. */
  getConfiguredMpc() {
    const location = getLocationConfig() as any;
    const mpc =
      location.country === 'USA' && Array.isArray(location.mpc) ? location.mpc[0] : undefined;

    assert.ok(mpc, 'Expected USA MPC configuration to be available for mobile MPC tests');
    return mpc;
  }

  /** Opens the configured MPC page. */
  async openMpc(mpc = this.getConfiguredMpc()) {
    const location = getLocationConfig();
    const targetPath = `${mpc.url}?${location.queryParam}`;

    if (this.mpcPageReady) {
      const currentUrl = await this.driver.getUrl().catch(() => '');

      if (new RegExp(this.escapeRegExp(mpc.url), 'i').test(currentUrl)) {
        await this.waitForPageReady();
        return;
      }
    }

    await this.open(targetPath);
    await this.verifyMpcPage(mpc);
    this.mpcPageReady = true;
  }

  /** Checks that the MPC page opened correctly. */
  async verifyMpcPage(mpc = this.getConfiguredMpc()) {
    await this.waitForPageReady(60000);
    await this.closeCookiePreferencesIfVisible();

    const namePattern = new RegExp(this.escapeRegExp(mpc.name), 'i');

    await this.waitForBodyText(namePattern, `Expected MPC page to include ${mpc.name}`, 45000);

    const snapshot = await this.getSnapshot();

    assert.match(snapshot.currentUrl, new RegExp(this.escapeRegExp(mpc.url), 'i'));
    assert.match(`${snapshot.title}\n${snapshot.bodyText}`, /Mattamy Homes/i);
    assert.match(`${snapshot.title}\n${snapshot.bodyText}`, namePattern);
    this.assertNoErrorPage(snapshot);
    this.logOpen('MPC detail', snapshot.currentUrl);
  }

  /** Checks hero content. */
  async validateHeroContent(mpcName = this.getConfiguredMpc().name) {
    await this.openMpc();

    const snapshot = await this.driver.execute((expectedName) => {
      const normalize = (value) => (value || '').replace(/\s+/g, ' ').trim();
      const isVisible = (element) => {
        if (!(element instanceof HTMLElement)) {
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
      const heading = Array.from(document.querySelectorAll('h1, h2')).find(
        (element) =>
          isVisible(element) &&
          new RegExp(expectedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(
            element.textContent || '',
          ),
      );
      const hasMedia = (element: Element) =>
        Array.from(
          element.querySelectorAll('img, picture source, video, [style*="background-image"]'),
        ).some((mediaElement) =>
          mediaElement instanceof HTMLElement
            ? isVisible(mediaElement)
            : Boolean(mediaElement.closest('picture')),
        );
      const ancestors: Element[] = [];
      let current = heading;

      while (current?.parentElement) {
        current = current.parentElement;
        ancestors.push(current);
      }

      const hero =
        ancestors.find(
          (element) =>
            /^(SECTION|ARTICLE|MAIN|HEADER)$/i.test(element.tagName) && hasMedia(element),
        ) ||
        ancestors.find(
          (element) =>
            /^(SECTION|ARTICLE|MAIN|HEADER)$/i.test(element.tagName) &&
            normalize(element.textContent || '').length > expectedName.length,
        ) ||
        document.querySelector('main') ||
        document.body;
      const heroText = normalize(hero.textContent || '');
      const descriptiveSection = Array.from(
        document.querySelectorAll('main section, section, article'),
      ).find((element) => {
        const text = normalize(element.textContent || '');

        return (
          isVisible(element) &&
          text.length > expectedName.length &&
          /community|homes|neighborhood|location|amenit|park|village|city|downtown|beach|shopping|dining/i.test(
            text,
          )
        );
      });
      const descriptiveText =
        heroText.length > expectedName.length
          ? heroText
          : normalize(descriptiveSection?.textContent || document.body?.innerText || '');
      const media = Array.from(
        hero.querySelectorAll('img, picture source, video, [style*="background-image"]'),
      ).filter((element) =>
        element instanceof HTMLElement ? isVisible(element) : Boolean(element.closest('picture')),
      );
      const favoriteButton = Array.from(document.querySelectorAll('button, [role="button"]')).find(
        (element) =>
          isVisible(element) &&
          /mark as favorite|favorite/i.test(
            `${element.textContent || ''} ${element.getAttribute('aria-label') || ''}`,
          ),
      );

      hero.scrollIntoView({ block: 'center', inline: 'center' });

      return {
        bodyText: normalize(document.body?.innerText || ''),
        descriptiveText,
        hasFavoriteButton: Boolean(favoriteButton),
        hasHero: Boolean(hero),
        hasMedia: media.length > 0,
        headingText: normalize(heading?.textContent || ''),
        heroText,
      };
    }, mpcName);

    assert.equal(snapshot.hasHero, true, 'Expected MPC hero section on mobile');
    assert.match(
      `${snapshot.headingText}\n${snapshot.heroText}\n${snapshot.bodyText}`,
      new RegExp(this.escapeRegExp(mpcName), 'i'),
    );
    assert.ok(
      snapshot.descriptiveText.length > mpcName.length,
      'Expected MPC hero to include descriptive content',
    );
    assert.equal(snapshot.hasMedia, true, 'Expected MPC hero media on mobile');

    if (snapshot.hasFavoriteButton) {
      this.logResult('MPC favorite button is visible on mobile');
    }
  }

  /** Checks summary tab. */
  async validateSummaryTab() {
    await this.validateMpcTab('Summary', /community|homes|neighborhood|designed|location/i);
  }

  /** Checks home details tab. */
  async validateHomeDetailsTab() {
    await this.validateMpcTab(
      'Home Details',
      /home types|bedrooms|full bathrooms|sq\.?\s*ft\.?|stories|garages/i,
    );
  }

  /** Checks contact hours tab. */
  async validateContactHoursTab() {
    await this.validateMpcTab(
      'Contact & Hours',
      /sales office|new home gallery|contact|hours|open|closed|\d{3}-\d{3}-\d{4}/i,
    );
  }

  /** Checks MPC tab. */
  async validateMpcTab(tabName, expectedPattern) {
    await this.openMpc();
    await this.closeCookiePreferencesIfVisible();

    const result = await this.driver.execute(
      ({ tabName, source, flags }) => {
        const regex = new RegExp(source, flags);
        const isVisible = (element) => {
          if (!(element instanceof HTMLElement)) {
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
        const tab = Array.from(
          document.querySelectorAll('button, [role="tab"], [aria-label]'),
        ).find((element) => {
          const label = `${element.textContent || ''} ${element.getAttribute('aria-label') || ''}`
            .replace(/\s+/g, ' ')
            .trim();

          return isVisible(element) && new RegExp(`^\\s*${tabName}\\s*$`, 'i').test(label);
        });

        if (tab instanceof HTMLElement) {
          tab.scrollIntoView({ block: 'center', inline: 'center' });
          tab.click();
        }

        return {
          clicked: Boolean(tab),
          selected: tab?.getAttribute('aria-selected') || '',
          text: (document.body?.innerText || '').replace(/\s+/g, ' ').trim(),
          valid: regex.test(document.body?.innerText || ''),
        };
      },
      { tabName, source: expectedPattern.source, flags: expectedPattern.flags },
    );

    if (result.clicked) {
      this.logScriptClick(`${tabName} tab`);
      await this.waitForMobileCondition(async () => {
        const snapshot = await this.getSnapshot();
        return expectedPattern.test(`${snapshot.bodyText} ${snapshot.currentUrl}`);
      }, `Expected ${tabName} tab content after clicking mobile MPC tab`);
    } else {
      this.logSkip(
        `${tabName} tab is not present in the mobile MPC layout - validating page content instead`,
      );
    }

    const bodyText = result.valid ? result.text : await this.getBodyText();
    assert.match(bodyText, expectedPattern, `Expected MPC ${tabName} content on mobile`);
  }

  /** Checks amenity and location sections. */
  async validateAmenityAndLocationSections() {
    await this.openMpc();
    const result = await this.getSectionByPattern(
      /amenit|location|convenient|destination|lifestyle|nearby|explore/i,
    );

    assert.equal(result.found, true, 'Expected MPC amenity or location section on mobile');
    assert.match(result.text, /amenit|location|convenient|destination|lifestyle|nearby|explore/i);
  }

  /** Checks promotion CTA. */
  async validatePromotionCTA(mpcUrl = this.getConfiguredMpc().url) {
    await this.openMpc();

    const result = await this.driver.execute((mpcUrl) => {
      const isVisible = (element) => {
        if (!(element instanceof HTMLElement)) {
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
      const controls = Array.from(document.querySelectorAll('a[href], button'));
      const promotion = controls.find(
        (element) =>
          isVisible(element) &&
          /view promotions|promotion|offer|incentive/i.test(
            `${element.textContent || ''} ${element.getAttribute('aria-label') || ''}`,
          ),
      );
      const communityLink = controls.find((element) => {
        const href = element.getAttribute('href') || '';

        return (
          isVisible(element) &&
          href &&
          new URL(href, window.location.href).pathname.includes(mpcUrl)
        );
      });
      const match = promotion || communityLink;

      match?.scrollIntoView({ block: 'center', inline: 'center' });

      return {
        found: Boolean(match),
        href: match?.getAttribute('href') || '',
        text: (match?.textContent || match?.getAttribute('aria-label') || '')
          .replace(/\s+/g, ' ')
          .trim(),
      };
    }, mpcUrl);

    assert.equal(
      result.found,
      true,
      `Expected a visible promotion CTA or community link under ${mpcUrl}`,
    );

    if (result.href) {
      assert.match(result.href, new RegExp(this.escapeRegExp(mpcUrl), 'i'));
    }
  }

  /** Checks image gallery if available. */
  async validateImageGallery() {
    await this.openMpc();

    const gallery = await this.driver.execute(() => {
      const isVisible = (element) => {
        if (!(element instanceof HTMLElement)) {
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
      const galleryPattern = /gallery|photos|images|videos|new home gallery|community gallery/i;
      const root =
        document.querySelector('[role="region"][aria-label*="Images" i], #gallery') ||
        Array.from(document.querySelectorAll('section, article, div')).find(
          (element) =>
            isVisible(element) &&
            galleryPattern.test(element.textContent || '') &&
            element.querySelector('img, picture, video, iframe, button'),
        );

      if (!root) {
        return { found: false, mediaCount: 0, modalOpened: false };
      }

      root.scrollIntoView({ block: 'center', inline: 'center' });
      const photosControl = Array.from(
        root.querySelectorAll('button, [role="button"], [aria-label]'),
      ).find(
        (element) =>
          isVisible(element) &&
          /photos/i.test(
            `${element.textContent || ''} ${element.getAttribute('aria-label') || ''}`,
          ),
      );
      (photosControl as HTMLElement | undefined)?.click();
      const media = Array.from(root.querySelectorAll('img, picture, video, iframe')).filter(
        (element) =>
          element instanceof HTMLElement ? isVisible(element) : Boolean(element.closest('picture')),
      );
      const firstMedia = media[0];

      if (firstMedia instanceof HTMLElement) {
        firstMedia.scrollIntoView({ block: 'center', inline: 'center' });
        firstMedia.click();
      }

      const modal = Array.from(
        document.querySelectorAll('.ReactModal__Content, [role="dialog"]'),
      ).find(
        (element) => isVisible(element) && element.querySelector('img, picture, video, iframe'),
      );

      return {
        found: true,
        mediaCount: media.length,
        modalOpened: Boolean(modal),
      };
    });

    if (!(await this.requireFeature(gallery.found, 'mpc.imageGallery', 'MPC image gallery'))) {
      return;
    }

    assert.ok(gallery.mediaCount > 0, 'Expected MPC image gallery media on mobile');

    if (!gallery.modalOpened) {
      this.logSkip(
        'MPC gallery media did not open a modal on mobile - media visibility was validated',
      );
    }

    await this.dismissPromoPopupIfPresent();
  }

  /** Checks neighborhood cards. */
  async validateNeighborhoodCards(
    mpcName = this.getConfiguredMpc().name,
    mpcUrl = this.getConfiguredMpc().url,
  ) {
    await this.openMpc();

    const cards = await this.getNeighborhoodCardsSnapshot(mpcUrl);

    assert.equal(cards.found, true, `Expected neighborhood section for ${mpcName} on mobile`);
    assert.ok(cards.links.length > 0, 'Expected MPC neighborhood cards on mobile');
    assert.deepEqual(
      cards.invalidLinks,
      [],
      `Expected neighborhood card hrefs to include current MPC URL segment: ${cards.currentMpcSegment}`,
    );
  }

  /** Checks first neighborhood navigation. */
  async validateFirstNeighborhoodNavigation(mpcUrl = this.getConfiguredMpc().url) {
    await this.openMpc();

    const result = await this.driver.execute((mpcUrl) => {
      const isVisible = (element) => {
        if (!(element instanceof HTMLElement)) {
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
      const normalize = (value) => (value || '').replace(/\s+/g, ' ').trim();
      const currentMpcSegment = window.location.pathname.split('/').filter(Boolean).pop() || '';
      const expectedMpcPath = mpcUrl.toLowerCase().replace(/^\/+|\/+$/g, '');
      const isNeighborhoodLink = (element) => {
        const href = element.getAttribute('href') || '';
        const segments = new URL(href, window.location.href).pathname
          .toLowerCase()
          .split('/')
          .filter(Boolean);

        return (
          isVisible(element) &&
          segments.includes(currentMpcSegment) &&
          segments.join('/') !== expectedMpcPath &&
          normalize(element.textContent || element.getAttribute('aria-label') || '').length > 0
        );
      };
      const section = Array.from(
        document.querySelectorAll('main section, section, article, [role="region"]'),
      )
        .filter(
          (element) =>
            isVisible(element) &&
            /explore neighborhoods in this community|neighborhood/i.test(
              element.textContent || '',
            ) &&
            Array.from(element.querySelectorAll('a[href]')).some(isNeighborhoodLink),
        )
        .sort((first, second) => {
          const firstRect = first.getBoundingClientRect();
          const secondRect = second.getBoundingClientRect();

          return firstRect.width * firstRect.height - secondRect.width * secondRect.height;
        })[0];
      const link = Array.from((section || document).querySelectorAll('a[href]')).find(
        isNeighborhoodLink,
      );

      if (!(link instanceof HTMLElement)) {
        return { clicked: false, reason: 'No neighborhood card link found' };
      }

      const href = link.getAttribute('href') || '';
      link.scrollIntoView({ block: 'center', inline: 'center' });
      link.click();
      return { clicked: true, href };
    }, mpcUrl);

    if (!result.clicked) {
      this.logSkip(`${result.reason} - skipping first neighborhood navigation`);
      return;
    }

    this.logScriptClick('first MPC neighborhood card');
    await this.waitForPageReady();
    assert.match(await this.driver.getUrl(), new RegExp(this.escapeRegExp(result.href), 'i'));
  }

  /** Checks that the Get Information CTA opens a lead form. */
  async verifyGetInformationCtaOpensLeadForm() {
    await this.openMpc();
    const form = await this.openGetInformationForm();

    assert.equal(form.found, true, 'Expected Get Information form to open on mobile MPC page');
    assert.match(form.text, /first name/i);
    assert.match(form.text, /last name/i);
    assert.match(form.text, /email/i);
    assert.match(form.text, /zip|postal/i);
    assert.equal(form.hasSubmit, true, 'Expected Get Information form submit button on mobile');
  }

  /** Checks get information form required-field errors. */
  async validateGetInformationFormEmptyErrors() {
    await this.openMpc();
    await this.openGetInformationForm();
    const submitted = await this.submitVisibleLeadFormByIndex(0);

    assert.equal(submitted, true, 'Expected Get Information form to be submittable on mobile');
    await this.assertFormErrors('Expected required field validation in Get Information form');
  }

  /** Checks get information form invalid email address. */
  async validateGetInformationFormInvalidEmail() {
    await this.openMpc();
    await this.openGetInformationForm();
    const filled = await this.fillInvalidEmailLeadFormByIndex(0);

    assert.equal(filled, true, 'Expected Get Information form to accept invalid email test data');
    await this.assertEmailError('Expected invalid email validation in Get Information form');
  }

  /** Checks that the Get Information form submits successfully. */
  async verifyGetInformationFormSuccessSubmission() {
    const { envName } = getEnvConfig();

    assert.notEqual(envName, 'PROD', 'Get Information success submission must not run on PROD');

    await this.openMpc();
    await this.openGetInformationForm();
    const submitted = await this.fillValidLeadFormByIndex(0);

    assert.equal(submitted, true, 'Expected Get Information form to submit valid data on mobile');
    await this.assertSubmissionSuccess(
      'Expected Get Information form success confirmation on mobile',
    );
  }

  /** Checks community update form fields. */
  async validateCommunityUpdateFormFields() {
    await this.openMpc();
    const form = await this.getCommunityUpdateForm();

    assert.equal(form.found, true, 'Expected MPC community update form on mobile');
    assert.match(form.text, /community of interest|community/i);
    assert.match(form.text, /first name/i);
    assert.match(form.text, /last name/i);
    assert.match(form.text, /email/i);
    assert.match(form.text, /country of residence|country/i);
    assert.match(form.text, /zip|postal/i);
    assert.equal(
      form.hasSubmit,
      true,
      'Expected MPC community update form submit button on mobile',
    );
  }

  /** Checks community update required errors. */
  async validateCommunityUpdateRequiredErrors() {
    await this.openMpc();
    await this.getCommunityUpdateForm();
    const submitted = await this.submitVisibleLeadFormByIndex(0);

    assert.equal(submitted, true, 'Expected MPC community update form to be submittable on mobile');
    await this.assertFormErrors('Expected required field validation in MPC community update form');
  }

  /** Checks community update invalid email address. */
  async validateCommunityUpdateInvalidEmail() {
    await this.openMpc();
    await this.getCommunityUpdateForm();
    const filled = await this.fillInvalidEmailLeadFormByIndex(0);

    assert.equal(
      filled,
      true,
      'Expected MPC community update form to accept invalid email test data',
    );
    await this.assertEmailError('Expected invalid email validation in MPC community update form');
  }

  /** Checks every MPC image/video URL returns HTTP 200. */
  async validateImageAndVideoUrlsReturn200(pageName = 'MPC page') {
    await this.openMpc();
    await this.assertMediaUrlsReturn200(pageName);
  }

  /** Finds a section whose text matches the pattern. */
  async getSectionByPattern(pattern) {
    await this.openMpc();

    return this.driver.execute(
      ({ source, flags }) => {
        const regex = new RegExp(source, flags);
        const normalize = (value) => (value || '').replace(/\s+/g, ' ').trim();
        const isVisible = (element) => {
          if (!(element instanceof HTMLElement)) {
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
        const section = Array.from(document.querySelectorAll('section, article, div')).find(
          (element) => isVisible(element) && regex.test(element.textContent || ''),
        );

        section?.scrollIntoView({ block: 'center', inline: 'center' });

        return {
          found: Boolean(section),
          text: normalize(section?.textContent || ''),
        };
      },
      { source: pattern.source, flags: pattern.flags },
    );
  }

  /** Captures the visible neighborhood cards. */
  async getNeighborhoodCardsSnapshot(mpcUrl) {
    return this.driver.execute((mpcUrl) => {
      const normalize = (value) => (value || '').replace(/\s+/g, ' ').trim();
      const isVisible = (element) => {
        if (!(element instanceof HTMLElement)) {
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
      const currentMpcSegment = window.location.pathname.split('/').filter(Boolean).pop() || '';
      const getPathSegments = (href) =>
        new URL(href, window.location.href).pathname.toLowerCase().split('/').filter(Boolean);
      const isNeighborhoodLink = (element) => {
        const href = element.getAttribute('href') || '';
        const segments = getPathSegments(href);

        return (
          isVisible(element) &&
          segments.includes(currentMpcSegment) &&
          segments.join('/') !== mpcUrl.toLowerCase().replace(/^\/+|\/+$/g, '') &&
          normalize(element.textContent || element.getAttribute('aria-label') || '').length > 0
        );
      };
      const sections = Array.from(
        document.querySelectorAll('main section, section, article, [role="region"]'),
      )
        .filter(
          (element) =>
            isVisible(element) &&
            /explore neighborhoods in this community|neighborhood/i.test(
              element.textContent || '',
            ) &&
            Array.from(element.querySelectorAll('a[href]')).some(isNeighborhoodLink),
        )
        .sort((first, second) => {
          const firstRect = first.getBoundingClientRect();
          const secondRect = second.getBoundingClientRect();

          return firstRect.width * firstRect.height - secondRect.width * secondRect.height;
        });
      const section = sections[0];

      section?.scrollIntoView({ block: 'center', inline: 'center' });

      const links = Array.from((section || document).querySelectorAll('a[href]'))
        .filter(isNeighborhoodLink)
        .map((link) => ({
          href: link.getAttribute('href') || '',
          text: normalize(link.textContent || ''),
        }))
        .filter((link) => link.href);
      const invalidLinks = links.filter((link) => {
        const segments = new URL(link.href, window.location.href).pathname
          .toLowerCase()
          .split('/')
          .filter(Boolean);

        return !segments.includes(currentMpcSegment);
      });

      return {
        currentMpcSegment,
        found: Boolean(section) || links.some((link) => link.href.includes(mpcUrl)),
        invalidLinks,
        links,
      };
    }, mpcUrl);
  }

  /** Opens get information form. */
  async openGetInformationForm() {
    await this.installLeadFormFinder();

    const opened = await this.driver.execute(() => {
      const existingForm = window.__getVisibleMpcLeadForms?.()[0];

      if (existingForm) {
        return true;
      }

      const isVisible = (element) => {
        if (!(element instanceof HTMLElement)) {
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
      const cta = Array.from(document.querySelectorAll('button, a[href], [role="button"]')).find(
        (element) => {
          const label = `${element.textContent || ''} ${element.getAttribute('aria-label') || ''}`
            .replace(/\s+/g, ' ')
            .trim();

          return isVisible(element) && /^get information$/i.test(label);
        },
      );

      if (!(cta instanceof HTMLElement)) {
        return false;
      }

      cta.scrollIntoView({ block: 'center', inline: 'center' });
      cta.click();
      return true;
    });

    assert.equal(opened, true, 'Expected Get Information CTA on mobile MPC page');
    this.logScriptClick('Get Information CTA');
    await this.installLeadFormFinder();
    await this.waitForMobileCondition(async () => {
      await this.installLeadFormFinder();
      const snapshot = await this.getLeadFormSnapshotByIndex(0);
      return snapshot.found;
    }, 'Expected MPC lead form after clicking Get Information CTA');

    return this.getLeadFormSnapshotByIndex(0);
  }

  /** Finds the community update form. */
  async getCommunityUpdateForm() {
    await this.driver.execute(() => window.scrollTo(0, document.body.scrollHeight));
    await this.installLeadFormFinder();
    await this.waitForMobileCondition(async () => {
      await this.installLeadFormFinder();
      const snapshot = await this.getLeadFormSnapshotByIndex(0);
      return snapshot.found;
    }, 'Expected MPC community update form after scrolling to page bottom');

    return this.getLeadFormSnapshotByIndex(0);
  }

  /** Installs the shared lead-form finder. */
  async installLeadFormFinder() {
    await installVisibleLeadFormFinder(this.driver, {
      containerSelectors: '.ReactModal__Content, [role="dialog"], aside, section, div',
      globalName: MPC_FORM_GLOBAL,
    });
  }

  /** Captures the lead form at the requested index. */
  async getLeadFormSnapshotByIndex(formIndex = 0) {
    await this.installLeadFormFinder();

    return this.getVisibleLeadFormSnapshot(MPC_FORM_GLOBAL, formIndex);
  }

  /** Submits visible lead form by index. */
  async submitVisibleLeadFormByIndex(formIndex = 0) {
    await this.installLeadFormFinder();
    return submitVisibleLeadFormByIndex(this.driver, MPC_FORM_GLOBAL, formIndex);
  }

  /** Fills invalid email address lead form by index. */
  async fillInvalidEmailLeadFormByIndex(formIndex = 0) {
    await this.installLeadFormFinder();
    return fillInvalidEmailLeadFormByIndex(this.driver, MPC_FORM_GLOBAL, formIndex);
  }

  /** Fills valid lead form by index. */
  async fillValidLeadFormByIndex(formIndex = 0) {
    await this.installLeadFormFinder();
    return fillValidLeadFormByIndex(this.driver, MPC_FORM_GLOBAL, formIndex, {
      communityPattern: 'wellen|sunstone|community|park',
      emailPrefix: 'qa-automation_mpc_mobile',
    });
  }
}
