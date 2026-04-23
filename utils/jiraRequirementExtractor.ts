export type MergeInput = {
    acceptanceCriteria?: string[];
    description?: string;
    comments?: string[];
    customFields?: string[];
    summary?: string;
};

export function mergeRequirements({
    acceptanceCriteria = [],
    description = '',
    comments = [],
    customFields = [],
    summary = '',
}: MergeInput): string[] {
    const extractedFromSummary = extractRequirementsFromText(summary, true);
    const extractedFromDescription = extractRequirementsFromText(description);
    const extractedFromComments = comments.flatMap(text => extractRequirementsFromText(text));
    const extractedFromCustomFields = customFields.flatMap(text => extractRequirementsFromText(text));

    const all = [
        ...acceptanceCriteria,
        ...extractedFromSummary,
        ...extractedFromDescription,
        ...extractedFromComments,
        ...extractedFromCustomFields,
    ];

    return [...new Set(all.map(r => normalizeRequirement(r)).filter(Boolean))];
}

export function extractRequirementsFromText(text: string, allowShortFallback = false): string[] {
    if (!text) return [];

    const lines = text
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean)
        .filter(line => !isGarbageLine(line));

    const requirementPatterns = [
        /should/i,
        /must/i,
        /shall/i,
        /can/i,
        /cannot/i,
        /should not/i,
        /must not/i,
        /validation/i,
        /display/i,
        /allow/i,
        /prevent/i,
        /only/i,
        /verify/i,
        /ensure/i,
        /redirect/i,
        /navigate/i,
        /link/i,
        /page/i,
        /button/i,
        /field/i,
        /dropdown/i,
        /search/i,
        /filter/i,
    ];

    const detected = lines.filter(line =>
        requirementPatterns.some(pattern => pattern.test(line))
    );

    if (detected.length > 0) return detected;

    // fallback only if summary-like short text exists
    if (allowShortFallback && text.trim().length > 0) {
        return [text.trim()];
    }

    return [];
}

function normalizeRequirement(text: string): string {
    return text
        .replace(/\s+/g, ' ')
        .replace(/^[-•*\d.]+\s*/, '')
        .trim();
}

function isGarbageLine(line: string): boolean {
    const trimmed = line.trim();

    // Ignore pure URLs
    if (/^https?:\/\/\S+$/i.test(trimmed)) return true;

    // Ignore URL path fragments like /florida/sarasota
    if (/^[a-z0-9-_/]+$/i.test(trimmed) && trimmed.includes('/')) return true;

    // Ignore domain-like broken fragments
    if (/^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(trimmed)) return true;

    // Ignore very short meaningless fragments
    if (trimmed.length < 4) return true;

    return false;
}