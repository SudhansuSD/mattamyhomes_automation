export type JiraScenario = {
    id: string;
    name: string;
    type?: 'validation' | 'functional' | 'ui' | 'navigation' | 'generic';
    sourceRequirement?: string;
    steps?: string[];
    expectedResult?: string;
    tags?: string[];

    // Optional existing automation-specific fields
    searchValue?: string;
    filters?: {
        minPrice?: number;
        maxPrice?: number;
        minBeds?: number;
        minBaths?: number;
    };
    expectedValidation?: 'priceRange' | 'bedsBaths' | 'tabValidation' | 'generic';
};

export type JiraFeature = {
    ticket: string;
    feature: string;
    page: string;
    scenarios: JiraScenario[];
};