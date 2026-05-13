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
3. Review existing repo structure before creating files.
4. Reuse existing:
   - page objects
   - utility methods
   - helper functions
   - fixtures
   - constants
   - test data
5. Create reusable methods for repeated actions.
6. Generate:
   - Page Object files
   - Playwright TypeScript test specs
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
- Page objects
- Test specs
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