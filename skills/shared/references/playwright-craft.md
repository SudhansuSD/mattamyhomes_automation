# Playwright Craft Reference

Shared by `automation-code-review` and `automation-code-review-fixer`. Both skills carry the rules in condensed form; this file holds the reasoning behind them. Read it only when a finding or a fix needs the argument spelled out - not on every invocation.

## Locators

Preference order, most to least stable:

1. `getByRole()` - survives markup changes, matches how the page is used
2. `getByLabel()`
3. `getByPlaceholder()`
4. `getByText()`
5. `getByTestId()`
6. Stable CSS selector
7. XPath, only when nothing above can express the target

Avoid dynamic IDs, generated class names, deep CSS chains, and DOM-position-dependent selectors.

Structural audit selectors such as `a[href]`, `img, video, iframe, picture`, or `section` are legitimate stable CSS: when the check is "every link on this page resolves" or "no media element is broken", the selector is describing page structure, not naming a control.

### Strict mode

A strict-mode violation is information: Playwright found more than one match, which usually means the locator describes the page less precisely than intended. Inspect every match, then scope by container or semantic relationship:

```ts
page.getByRole('region', { name: 'Featured plans' }).getByRole('link', { name: 'View plan' })
```

`.first()` and `nth()` are correct only when position is part of the expected UI contract - "the first card in the carousel" as a requirement, not as a way to silence the error.

## Synchronization

Playwright auto-waits on actions and web-first assertions. A blind sleep adds latency to every run whether or not it was needed, and still races on a slow one. Paying them repeatedly is measurable: it once took this suite from 3.2h to 5.8h.

Prefer an application condition:

```ts
await expect(locator).toBeVisible();
await expect(locator).toHaveText(expectedText);
await expect(page).toHaveURL(expectedUrl);
await expect(loader).toBeHidden();
await expect.poll(() => items.count()).toBeGreaterThan(0);
await this.waitForPageReady();   // BasePage - waits for the DOM to go quiet
await responsePromise;
```

A bounded polling interval inside a loop is fine; it is progress-driven, not a fixed guess.

Do not stack waits for the same action - a sleep, then a load-state wait, then a selector wait, then a visibility assertion - unless each one has a distinct reason.

Retries belong on genuine environmental instability. Before adding one, check locator quality, race conditions, loading behavior, animation, test data, and network dependency.

## Assertions

Retryable assertions poll until the timeout; one-time state checks sample once and flake:

```ts
// Retries
await expect(element).toBeVisible();

// Samples once - flakes on anything asynchronous
const visible = await element.isVisible();
expect(visible).toBeTruthy();
```

Assert meaningful application behavior rather than implementation detail. Never remove, weaken, or rewrite an expected result to make a run go green.

## Error Handling

An empty catch around required behavior converts a real failure into a pass:

```ts
// Hides a genuine failure
try {
  await submitButton.click();
} catch {
}
```

Optional UI is different, and its helpers say so in the name:

```ts
await this.acceptCookiesIfPresent();
await this.dismissPromoPopupIfPresent();
```

The distinction is whether absence is expected. A feature that is absent by design for a location is declared in `config/features/featureExpectations.ts` and checked through `isFeaturePresent` / `requireFeature`, so the decision is recorded rather than inferred at runtime.

## Reuse

Before creating a method, locator, utility, page object, or support collaborator: search for something similar, reuse it, extend it if safe, and only then create - with a clear single responsibility.

Parameterize what varies by data:

```ts
// One method
async searchLocation(location: string) {
  await this.searchInput.fill(location);
}

// Not searchFlorida(), searchTexas(), searchArizona()
```

An abstraction that only reduces line count, without improving reliability, readability, or reuse, is not worth its indirection.

## Layering

- `tests/` - orchestration and assertions, thin
- `pages/` - locators and interaction, layered `BasePage` -> `SearchablePage` -> page
- `support/` - collaborators a page object owns: `OverlayManager`, `MediaAuditor`, `LeadFormFlow`
- `utils/` - cross-cutting helpers, grouped by `reporting/`, `evidence/`, `leadform/`, `web/`
- `config/` - environment, location, browser, navigation, feature expectations
- `data/` - test data

A shared UI section such as the header or footer is a page object extending `BasePage`, not a component class. `components/` is unused. When several page objects need the same behavior, it becomes a `support/` collaborator they own.

Methods keep one responsibility, a meaningful name, parameters for data-driven behavior, a small body, and minimal nesting.

## TypeScript

Type parameters, return values, config shapes, and test-data shapes where it makes the code easier to verify. Replace `any` when a real type clarifies intent. Stop short of type complexity that costs more to read than the code it describes.

## Independence And Parallel Safety

Every test establishes its own state through setup, navigation helpers, config, or test data - never through another test's side effects. Before adding shared state, check for reused accounts, shared filenames, shared temporary files, global mutable data, and order dependence.

`ENV` selects STAGE or PROD - the only two environments. `LOCATION` selects USA or CAN; `ALL` runs one pass per country. Specs read `getLocationConfig()` so a run retargets without a source change. Country-specific page objects pin themselves with `locationOverride`.
