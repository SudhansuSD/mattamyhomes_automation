import { APIRequestContext, expect, test } from '@playwright/test';
import { getEnvConfig } from '../config/environments/envConfig';
import { escapeRegex } from './pageObjectUtils';

export type RedirectCase = {
  sourceUrl: string;
  expectedPathContains: string;
  title: string;
};

export async function validateRedirectCases(
  request: APIRequestContext,
  redirectCases: RedirectCase[],
  options?: {
    limit?: number;
    label?: string;
  },
): Promise<void> {
  const casesToValidate =
    typeof options?.limit === 'number' ? redirectCases.slice(0, options.limit) : redirectCases;

  expect(
    casesToValidate.length,
    `${options?.label ?? 'Redirect'} cases should be available`,
  ).toBeGreaterThan(0);

  for (const redirectCase of casesToValidate) {
    await test.step(redirectCase.title, async () => {
      const sourceUrl = toCurrentEnvironmentUrl(redirectCase.sourceUrl);
      const expectedPath = normalizeExpectedPath(redirectCase.expectedPathContains);
      const response = await request.get(sourceUrl, {
        failOnStatusCode: false,
        maxRedirects: 10,
        timeout: 30_000,
      });
      const finalUrl = new URL(response.url());

      expect(
        response.status(),
        `${sourceUrl} should not end on a client/server error. Final URL: ${finalUrl.href}`,
      ).toBeLessThan(400);

      expect(
        finalUrl.pathname,
        `${sourceUrl} should redirect to a URL containing ${expectedPath}. Final URL: ${finalUrl.href}`,
      ).toMatch(new RegExp(escapeRegex(expectedPath), 'i'));

      expect(finalUrl.href, `${sourceUrl} should not loop to the same legacy URL`).not.toBe(
        sourceUrl,
      );
    });
  }
}

function toCurrentEnvironmentUrl(rawUrl: string): string {
  const { baseURL } = getEnvConfig();
  const source = new URL(rawUrl);
  const base = new URL(baseURL);

  source.protocol = base.protocol;
  source.host = base.host;

  return source.href;
}

function normalizeExpectedPath(expected: string): string {
  return expected.split('?')[0];
}
