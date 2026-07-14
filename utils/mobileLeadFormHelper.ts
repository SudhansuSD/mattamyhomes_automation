import testData from '../data/test_data.json';

const LEAD = testData.leadForm;
const MOBILE = LEAD.mobile;

const VALID_FORM_DATA = {
  firstName: MOBILE.validName.firstName,
  lastName: MOBILE.validName.lastName,
  emailDomain: LEAD.emailDomain,
  phone: MOBILE.phone,
  zip: MOBILE.zip,
  communityPattern: MOBILE.communityPattern,
  countryPattern: MOBILE.countryPattern
};

const INVALID_FORM_DATA = {
  firstName: LEAD.invalidName.firstName,
  lastName: LEAD.invalidName.lastName,
  email: LEAD.invalidEmail,
  phone: MOBILE.phone,
  zip: MOBILE.zip
};

// Structural subset of the WebdriverIO Browser used by the mobile lead-form
// helpers. Kept intentionally permissive (any-returning execute/waitUntil) so a
// concrete `WebdriverIO.Browser` is assignable here without depending on the
// WDIO global types in this shared util's (Playwright-side) tsconfig scope.
type MobileDriver = {
  execute: (script: (...args: any[]) => any, ...args: any[]) => Promise<any>;
  pause: (ms: number) => Promise<void>;
  waitUntil: (
    condition: () => Promise<boolean> | boolean,
    options?: { timeout?: number; timeoutMsg?: string; interval?: number }
  ) => Promise<unknown>;
};

type LeadFormFinderOptions = {
  containerSelectors?: string;
  formTextPattern?: string;
  globalName: string;
};

type LeadFormFillOptions = {
  communityPattern?: string;
  countryPattern?: string;
  emailPrefix: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  zip?: string;
};

export async function installVisibleLeadFormFinder(
  driver: MobileDriver,
  options: LeadFormFinderOptions
): Promise<void> {
  await driver.execute(({ containerSelectors, formTextPattern, globalName }) => {
    (window as any)[globalName] = () => {
      const isVisible = (element: Element) => {
        if (!(element instanceof HTMLElement)) {
          return false;
        }

        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();

        return style.visibility !== 'hidden' &&
          style.display !== 'none' &&
          rect.width > 0 &&
          rect.height > 0;
      };
      const textPattern = new RegExp(formTextPattern, 'i');
      const isLeadForm = (form: Element) =>
        isVisible(form) &&
        form.querySelector('input, select, textarea') &&
        form.querySelector('button, input[type="submit"]') &&
        textPattern.test(form.textContent || '');
      const uniqueBySubmitButton = (forms: Element[]) => {
        const seenButtons = new Set<Element>();

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

      return uniqueBySubmitButton(
        Array.from(document.querySelectorAll(containerSelectors)).filter(isLeadForm)
      );
    };
  }, {
    containerSelectors: options.containerSelectors || 'section, div',
    formTextPattern: options.formTextPattern || 'submit|first name|last name|email|zip|postal|community updates|get information',
    globalName: options.globalName
  });
}

export async function submitVisibleLeadFormByIndex(
  driver: MobileDriver,
  globalName: string,
  formIndex = 0,
  pauseMs = 1500
): Promise<boolean> {
  const submitted = await driver.execute(({ globalName, index }) => {
    const form = (window as any)[globalName]?.()[index];

    if (!form) {
      return false;
    }

    form.scrollIntoView({ block: 'center', inline: 'center' });
    const submit = form.querySelector('button[type="submit"], input[type="submit"], button');
    submit?.click();
    return true;
  }, { globalName, index: formIndex });

  await driver.pause(pauseMs);
  return Boolean(submitted);
}

export async function fillInvalidEmailLeadFormByIndex(
  driver: MobileDriver,
  globalName: string,
  formIndex = 0,
  pauseMs = 1500
): Promise<boolean> {
  const filled = await driver.execute(({ globalName, index, invalidData }) => {
    const form = (window as any)[globalName]?.()[index] || (window as any)[globalName]?.()[0];

    if (!form) {
      return false;
    }

    const fill = (selector: string, value: string) => {
      const input = form.querySelector(selector);

      if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
        input.focus();
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    };
    const checkConsent = () => {
      const checkbox = Array.from<HTMLInputElement>(form.querySelectorAll('input[type="checkbox"]')).find((candidate) =>
        !/real estate agent/i.test(`${candidate.getAttribute('aria-label') || ''} ${candidate.closest('label')?.textContent || ''}`)
      );

      if (checkbox instanceof HTMLInputElement) {
        checkbox.checked = true;
        checkbox.dispatchEvent(new Event('input', { bubbles: true }));
        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      }
    };
    const selectFirstOption = (selector: string) => {
      const select = form.querySelector(selector);

      if (select instanceof HTMLSelectElement && select.options.length > 1) {
        select.selectedIndex = 1;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    };

    form.scrollIntoView({ block: 'center', inline: 'center' });
    selectFirstOption('select[name*="community" i], select[id*="community" i], select');
    fill('input[name*="first" i], input[id*="first" i], input[placeholder*="First" i]', invalidData.firstName);
    fill('input[name*="last" i], input[id*="last" i], input[placeholder*="Last" i]', invalidData.lastName);
    fill('input[type="email"], input[name*="email" i], input[id*="email" i]', invalidData.email);
    fill('input[type="tel"], input[name*="phone" i], input[id*="phone" i]', invalidData.phone);
    fill('input[name*="zip" i], input[id*="zip" i], input[placeholder*="Zip" i], input[placeholder*="Postal" i]', invalidData.zip);
    selectFirstOption('select[name*="country" i], select[id*="country" i]');
    checkConsent();

    const submit = form.querySelector('button[type="submit"], input[type="submit"], button');
    submit?.click();
    return true;
  }, { globalName, index: formIndex, invalidData: INVALID_FORM_DATA });

  await driver.pause(pauseMs);
  return Boolean(filled);
}

export async function fillValidLeadFormByIndex(
  driver: MobileDriver,
  globalName: string,
  formIndex: number,
  options: LeadFormFillOptions,
  pauseMs = 2500
): Promise<boolean> {
  const submitted = await driver.execute(({ fillOptions, globalName, index }) => {
    const form = (window as any)[globalName]?.()[index] || (window as any)[globalName]?.()[0];

    if (!form) {
      return false;
    }

    const fill = (selector: string, value: string) => {
      const input = form.querySelector(selector);

      if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
        input.focus();
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    };
    const selectOption = (selector: string, preferredPatternSource: string) => {
      const select = form.querySelector(selector);

      if (!(select instanceof HTMLSelectElement)) {
        return;
      }

      const preferredPattern = new RegExp(preferredPatternSource, 'i');
      const preferred = Array.from(select.options).find((option) =>
        preferredPattern.test(option.textContent || option.label || option.value)
      );
      const fallback = Array.from(select.options).find((option) => option.value && option.index > 0);

      select.value = (preferred || fallback || select.options[1])?.value || select.value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    };
    const checkConsent = () => {
      const checkbox = Array.from<HTMLInputElement>(form.querySelectorAll('input[type="checkbox"]')).find((candidate) =>
        !/real estate agent/i.test(`${candidate.getAttribute('aria-label') || ''} ${candidate.closest('label')?.textContent || ''}`)
      );

      if (checkbox instanceof HTMLInputElement) {
        checkbox.checked = true;
        checkbox.dispatchEvent(new Event('input', { bubbles: true }));
        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      }
    };

    form.scrollIntoView({ block: 'center', inline: 'center' });
    selectOption('select[name*="community" i], select[id*="community" i], select', fillOptions.communityPattern);
    fill('input[name*="first" i], input[id*="first" i], input[placeholder*="First" i]', fillOptions.firstName);
    fill('input[name*="last" i], input[id*="last" i], input[placeholder*="Last" i]', fillOptions.lastName);
    fill('input[type="email"], input[name*="email" i], input[id*="email" i]', `${fillOptions.emailPrefix}_${Date.now()}@${fillOptions.emailDomain}`);
    fill('input[type="tel"], input[name*="phone" i], input[id*="phone" i]', fillOptions.phone);
    fill('input[name*="zip" i], input[id*="zip" i], input[placeholder*="Zip" i], input[placeholder*="Postal" i]', fillOptions.zip);
    selectOption('select[name*="country" i], select[id*="country" i]', fillOptions.countryPattern);
    checkConsent();

    const submit = form.querySelector('button[type="submit"], input[type="submit"], button');
    submit?.click();
    return true;
  }, {
    fillOptions: {
      communityPattern: options.communityPattern || VALID_FORM_DATA.communityPattern,
      countryPattern: options.countryPattern || VALID_FORM_DATA.countryPattern,
      emailPrefix: options.emailPrefix,
      emailDomain: VALID_FORM_DATA.emailDomain,
      firstName: options.firstName || VALID_FORM_DATA.firstName,
      lastName: options.lastName || VALID_FORM_DATA.lastName,
      phone: options.phone || VALID_FORM_DATA.phone,
      zip: options.zip || VALID_FORM_DATA.zip
    },
    globalName,
    index: formIndex
  });

  await driver.pause(pauseMs);
  return Boolean(submitted);
}

export async function getLeadFormErrorSnapshot(driver: MobileDriver): Promise<{
  emailAriaInvalid: string;
  emailValidationMessage: string;
  invalidFieldCount: number;
  text: string;
}> {
  return driver.execute(() => {
    const text = document.body?.innerText || '';
    const email = document.querySelector('input[type="email"], input[name*="email" i], input[id*="email" i]');
    const invalidFields = document.querySelectorAll(':invalid, [aria-invalid="true"], .field-validation-error');

    return {
      emailAriaInvalid: email?.getAttribute('aria-invalid') || '',
      emailValidationMessage: email instanceof HTMLInputElement ? email.validationMessage || '' : '',
      invalidFieldCount: invalidFields.length,
      text
    };
  });
}

export async function assertLeadFormSubmissionSuccess(
  driver: MobileDriver,
  message: string,
  timeout = 30000
): Promise<void> {
  await driver.waitUntil(
    async () => {
      const snapshot = await getLeadFormSubmissionSnapshot(driver);

      return snapshot.hasSuccess || snapshot.hasSuccessDialog;
    },
    {
      timeout,
      timeoutMsg: message
    }
  );
}

export async function getLeadFormSubmissionSnapshot(driver: MobileDriver): Promise<{
  hasSuccess: boolean;
  hasSuccessDialog: boolean;
  text: string;
}> {
  return driver.execute(() => {
    const text = document.body?.innerText || '';
    const visibleDialog = Array.from(
      document.querySelectorAll('.ReactModal__Content, [role="dialog"], [aria-modal="true"]')
    ).find((element) => {
      if (!(element instanceof HTMLElement)) {
        return false;
      }

      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();

      return style.visibility !== 'hidden' &&
        style.display !== 'none' &&
        rect.width > 0 &&
        rect.height > 0 &&
        /thank you for your interest|successfully submitted|submitted|received/i.test(element.textContent || '');
    });

    return {
      hasSuccess: /thank you for your interest in mattamy homes|thank you for your interest|successfully submitted|submitted|received/i.test(text),
      hasSuccessDialog: Boolean(visibleDialog),
      text
    };
  });
}
