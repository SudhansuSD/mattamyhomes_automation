---
name: url-feature-automation-generator
description: Analyze a provided URL, identify features and functionalities, and generate Playwright TypeScript page objects and test scripts using reusable framework methods and existing repo structure.
---

# URL Feature Automation Generator

## Purpose
When a user provides a website URL, analyze the page, identify all visible features and functionalities, and generate Playwright automation code using the existing repository structure, reusable methods, page object files, and test files.

## Skill Behavior

1. Open and inspect the provided URL.
2. Identify:
   - Hero sections
   - Navigation
   - Forms
   - Filters (if available)
   - Dropdowns
   - CTA buttons
   - Modals
   - Accordions
   - Tabs
   - Carousels
   - Search functionality
   - Validation behavior
   - Responsive behavior
3. Review existing repo structure before creating files (`pages/`, `tests/`, `utils/`, `config/`) so nothing is duplicated.
4. Reuse existing:
   - page objects under `pages/`
   - utility methods
   - helper functions
   - fixtures
   - constants
   - test data
5. Create reusable methods for repeated actions.
6. Generate:
   - Playwright TypeScript test specs **directly under `tests/`** (never `tests/generated/`).
   - A new page object under `pages/<Feature>Page.ts` (extending `BasePage` or `SearchablePage`) **only** when the URL introduces functionality no existing page object covers.
   - helper utilities if needed
7. Use stable locators:
   - data-testid
   - role locators
   - accessible names
   - CSS
   - XPath only if unavoidable
8. Avoid hardcoded waits.
9. Follow existing framework coding standards.

## Expected Output

Generate or update:
- Test specs under `tests/`
- Page objects under `pages/` (reuse existing; add a new file only for new functionality)
- Reusable utility methods
- Test data files if required

Provide:
- Files created/updated
- Execution command
- Covered features
- Assumptions/limitations

## Example Usage

```md
Use skill: url-feature-automation-generator

URL: https://mattamyhomes.com/?country=CAN

Generate:
- Playwright page objects
- Automation tests
- Reusable methods
```