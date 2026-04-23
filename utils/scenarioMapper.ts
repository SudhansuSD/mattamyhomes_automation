import { SearchPage } from '../pages/SearchPage';
import { JiraScenario } from './jiraParser';



export class ScenarioMapper {
    
    static async executeSearchScenario(
        searchPage: SearchPage,
        scenario: JiraScenario
    ): Promise<void> {
        if (scenario.searchValue) {
            await searchPage.search(scenario.searchValue);
        }

        if (
            scenario.filters?.minPrice !== undefined &&
            scenario.filters?.maxPrice !== undefined
        ) {
            await searchPage.filterByPrice(
                scenario.filters.minPrice,
                scenario.filters.maxPrice
            );
        }

        if (
            scenario.filters?.minBeds !== undefined &&
            scenario.filters?.minBaths !== undefined
        ) {
            await searchPage.filterByBedroomsAndBathrooms(
                scenario.filters.minBeds,
                scenario.filters.minBaths
            );
        }
    }

    static async validateSearchScenario(
        searchPage: SearchPage,
        scenario: JiraScenario
    ): Promise<void> {
        switch (scenario.expectedValidation) {
            case 'priceRange':
                if (
                    scenario.filters?.minPrice !== undefined &&
                    scenario.filters?.maxPrice !== undefined
                ) {
                    await searchPage.validatePriceRangeAcrossTabs(
                        scenario.filters.minPrice,
                        scenario.filters.maxPrice
                    );
                }
                break;

            case 'bedsBaths':
                if (
                    scenario.filters?.minBeds !== undefined &&
                    scenario.filters?.minBaths !== undefined
                ) {
                    await searchPage.validateBedsBathsAcrossTabs(
                        scenario.filters.minBeds,
                        scenario.filters.minBaths
                    );
                }
                break;

            case 'tabValidation':
                // Add later if needed
                break;

            case 'generic':
            default:
                console.log(`ℹ️ No specific validation mapper defined for: ${scenario.name}`);
                break;
        }
    }
}