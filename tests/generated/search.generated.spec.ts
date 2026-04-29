// import { test } from '@playwright/test';
// import { SearchPage } from '../../pages/SearchPage';
// import { ScenarioMapper } from '../../utils/scenarioMapper';
// import rawScenarios from '../../data/jira-scenarios.json';
// import { JiraFeature } from '../../utils/jiraParser';
// import { getLocationConfig } from '../../config/locations';

// const scenarios = rawScenarios as JiraFeature;
// const location = getLocationConfig();

// test.describe(`${scenarios.ticket} - ${scenarios.feature}`, () => {
//   for (const scenario of scenarios.scenarios) {
//     test(`${scenario.id} - ${scenario.name}`, async ({ page }) => {
//       const searchPage = new SearchPage(page);

//       await searchPage.navigate(); // Optional if you have this method
//       console.log(`\n🚀 Running Scenario: ${scenario.name}`);

//       await ScenarioMapper.executeSearchScenario(searchPage, scenario);
//       await ScenarioMapper.validateSearchScenario(searchPage, scenario);
//     });
//   }
// });