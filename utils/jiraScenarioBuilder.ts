export type GenericScenario = {
    id: string;
    name: string;
    type: 'validation' | 'functional' | 'ui' | 'navigation' | 'generic';
    sourceRequirement: string;
    steps: string[];
    expectedResult: string;
    tags?: string[];
};

export function buildGenericScenarios(
    issueKey: string,
    requirements: string[],
    summary?: string,
    description?: string
): GenericScenario[] {
    const combinedText = `${summary || ''} ${description || ''}`.toLowerCase();

    // Special handling for redirect/navigation tickets
    if (isRedirectTicket(combinedText, requirements)) {
        return buildRedirectScenarios(requirements, summary, description);
    }

    return requirements.map((requirement, index) => {
        const type = inferScenarioType(requirement);

        return {
            id: `TC${String(index + 1).padStart(3, '0')}`,
            name: buildScenarioName(requirement),
            type,
            sourceRequirement: requirement,
            steps: buildSteps(requirement, type),
            expectedResult: requirement,
            tags: inferTags(requirement),
        };
    });
}

function isRedirectTicket(text: string, requirements: string[]): boolean {
    return (
        /redirect|redirection|navigate to|link to|landing page|destination url/.test(text) ||
        requirements.some(r => /redirect|link to|navigate/i.test(r))
    );
}

function buildRedirectScenarios(
    requirements: string[],
    summary?: string,
    description?: string
): GenericScenario[] {
    const sourceReq =
        requirements.find(r => /redirect|link to|navigate/i.test(r)) ||
        summary ||
        'Validate redirect behavior';

    return [
        {
            id: 'TC001',
            name: 'Validate source URL redirects correctly',
            type: 'navigation',
            sourceRequirement: sourceReq,
            steps: [
                'Open the source URL in browser',
                'Observe redirect behavior',
                'Verify user is redirected to the expected destination page',
            ],
            expectedResult: 'User should be redirected to the correct destination page',
            tags: ['redirect', 'navigation', 'url'],
        },
        {
            id: 'TC002',
            name: 'Validate redirected destination URL is correct',
            type: 'navigation',
            sourceRequirement: sourceReq,
            steps: [
                'Launch the source redirect URL',
                'Capture the final landing URL',
                'Verify the landing URL matches the expected configured destination',
            ],
            expectedResult: 'Final landing URL should match the expected destination URL',
            tags: ['redirect', 'url', 'destination'],
        },
    ];
}

function inferScenarioType(requirement: string): GenericScenario['type'] {
    const text = requirement.toLowerCase();

    if (
        /validation|error|required|allow|prevent|invalid|should not|must not/.test(text)
    ) {
        return 'validation';
    }

    if (/click|navigate|redirect|open|page|link/.test(text)) {
        return 'navigation';
    }

    if (/button|dropdown|field|label|placeholder|ui|display/.test(text)) {
        return 'ui';
    }

    if (/search|filter|select|save|edit|submit|create|update|delete/.test(text)) {
        return 'functional';
    }

    return 'generic';
}

function buildScenarioName(requirement: string): string {
    const cleaned = requirement.replace(/[.]/g, '').trim();
    return cleaned.length > 80 ? cleaned.slice(0, 77) + '...' : cleaned;
}

function buildSteps(requirement: string, type: GenericScenario['type']): string[] {
    switch (type) {
        case 'validation':
            return [
                'Navigate to the relevant page',
                'Perform the input/action based on the requirement',
                'Observe the validation behavior',
                'Verify the correct validation response is shown',
            ];

        case 'navigation':
            return [
                'Navigate to the starting page',
                'Perform the relevant action',
                'Verify navigation or redirection occurs correctly',
            ];

        case 'ui':
            return [
                'Open the relevant page or component',
                'Inspect the target UI element',
                'Verify it is displayed and behaves as expected',
            ];

        case 'functional':
            return [
                'Open the relevant application page',
                'Perform the functional user action',
                'Verify the expected business behavior occurs',
            ];

        default:
            return [
                'Navigate to the relevant page',
                'Perform the required user action',
                'Verify expected behavior',
            ];
    }
}

function inferTags(requirement: string): string[] {
    const text = requirement.toLowerCase();
    const tags: string[] = [];

    if (/search/.test(text)) tags.push('search');
    if (/filter/.test(text)) tags.push('filter');
    if (/validation|error|required/.test(text)) tags.push('validation');
    if (/price/.test(text)) tags.push('price');
    if (/bed|bath/.test(text)) tags.push('beds-baths');
    if (/dropdown/.test(text)) tags.push('dropdown');
    if (/button/.test(text)) tags.push('button');
    if (/redirect|link|url/.test(text)) tags.push('redirect');

    return tags;
}