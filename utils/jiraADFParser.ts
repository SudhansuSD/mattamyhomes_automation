export function extractTextFromADF(node: any): string {
    if (!node) return '';

    if (node.type === 'text') {
        return node.text || '';
    }

    if (Array.isArray(node.content)) {
        return node.content.map(extractTextFromADF).join(' ');
    }

    return '';
}

export function parseADFToText(adf: any): string {
    if (!adf || !adf.content) return '';
    return adf.content.map(extractTextFromADF).join('\n').trim();
}