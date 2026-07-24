import axios from 'axios';
import { loadEnv } from '../config/env';

loadEnv();

export type JiraAttachment = {
  id: string;
  filename: string;
  mimeType?: string;
  size?: number;
  content?: string;
  textContent?: string;
};

export type JiraIssueRequirement = {
  ticket: string;
  summary: string;
  description: string;
  acceptanceCriteria: string[];
  comments: string[];
  labels: string[];
  status: string;
  priority: string;
  issueType: string;
  attachments: JiraAttachment[];
  sourceUrl: string;
  fetchedAt: string;
  rawFields: Record<string, unknown>;
};

type JiraIssueResponse = {
  key: string;
  fields: Record<string, any>;
};

type JiraCommentResponse = {
  comments?: Array<{
    body?: unknown;
  }>;
};

export async function fetchJiraIssueRequirement(ticketId: string): Promise<JiraIssueRequirement> {
  const config = getJiraConfig();
  const issueUrl = `${config.baseUrl}/rest/api/3/issue/${encodeURIComponent(ticketId)}`;
  const response = await axios.get<JiraIssueResponse>(issueUrl, {
    auth: {
      username: config.email,
      password: config.apiToken,
    },
    params: {
      fields: '*all',
      expand: 'renderedFields',
    },
    timeout: 30_000,
  });

  const issue = response.data;
  const fields = issue.fields ?? {};
  const comments = await fetchComments(config, ticketId, fields.comment);
  const renderedFields = (response.data as any).renderedFields ?? {};
  const description =
    adfToPlainText(fields.description) || htmlToPlainText(renderedFields.description) || '';

  const attachments = extractAttachments(fields.attachment);

  return {
    ticket: issue.key,
    summary: String(fields.summary ?? ''),
    description,
    acceptanceCriteria: extractAcceptanceCriteria(fields, renderedFields),
    comments,
    labels: Array.isArray(fields.labels) ? fields.labels.map(String) : [],
    status: String(fields.status?.name ?? ''),
    priority: String(fields.priority?.name ?? ''),
    issueType: String(fields.issuetype?.name ?? ''),
    attachments: await enrichTextAttachments(config, attachments),
    sourceUrl: `${config.baseUrl}/browse/${encodeURIComponent(issue.key)}`,
    fetchedAt: new Date().toISOString(),
    rawFields: {
      components: fields.components,
      fixVersions: fields.fixVersions,
      customFieldKeys: Object.keys(fields).filter((key) => key.startsWith('customfield_')),
    },
  };
}

async function fetchComments(
  config: ReturnType<typeof getJiraConfig>,
  ticketId: string,
  inlineCommentField: unknown,
): Promise<string[]> {
  const inlineComments = normalizeComments(inlineCommentField);

  try {
    const commentUrl = `${config.baseUrl}/rest/api/3/issue/${encodeURIComponent(ticketId)}/comment`;
    const response = await axios.get<JiraCommentResponse>(commentUrl, {
      auth: {
        username: config.email,
        password: config.apiToken,
      },
      params: {
        orderBy: 'created',
        maxResults: 100,
      },
      timeout: 30_000,
    });

    const fetchedComments = (response.data.comments ?? [])
      .map((comment) => adfToPlainText(comment.body))
      .filter(Boolean);

    return fetchedComments.length ? fetchedComments : inlineComments;
  } catch {
    return inlineComments;
  }
}

function getJiraConfig(): { baseUrl: string; email: string; apiToken: string } {
  const baseUrl = process.env.JIRA_BASE_URL?.replace(/\/$/, '');
  const email = process.env.JIRA_EMAIL;
  const apiToken = process.env.JIRA_API_TOKEN;
  const missing = [
    ['JIRA_BASE_URL', baseUrl],
    ['JIRA_EMAIL', email],
    ['JIRA_API_TOKEN', apiToken],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missing.length) {
    throw new Error(`Missing Jira environment variable(s): ${missing.join(', ')}`);
  }

  return {
    baseUrl: baseUrl!,
    email: email!,
    apiToken: apiToken!,
  };
}

function normalizeComments(commentField: unknown): string[] {
  if (!isRecord(commentField) || !Array.isArray(commentField.comments)) {
    return [];
  }

  return commentField.comments
    .map((comment) => (isRecord(comment) ? adfToPlainText(comment.body) : ''))
    .filter(Boolean);
}

function extractAcceptanceCriteria(
  fields: Record<string, any>,
  renderedFields: Record<string, any>,
): string[] {
  const candidates = Object.entries(fields)
    .filter(([key, value]) => /acceptance|criteria|ac/i.test(key) && value)
    .flatMap(([, value]) => splitLines(adfToPlainText(value)))
    .filter((value) => value !== '[object Object]');

  const renderedCandidates = Object.entries(renderedFields)
    .filter(([key, value]) => /acceptance|criteria|ac/i.test(key) && value)
    .flatMap(([, value]) => splitLines(htmlToPlainText(String(value))))
    .filter((value) => value !== '[object Object]');

  const descriptionCriteria = extractCriteriaFromText(adfToPlainText(fields.description));

  return uniqueStrings([...candidates, ...renderedCandidates, ...descriptionCriteria]);
}

async function enrichTextAttachments(
  config: ReturnType<typeof getJiraConfig>,
  attachments: JiraAttachment[],
): Promise<JiraAttachment[]> {
  const enriched: JiraAttachment[] = [];

  for (const attachment of attachments) {
    if (!attachment.content || !isTextAttachment(attachment)) {
      enriched.push(attachment);
      continue;
    }

    try {
      const response = await axios.get<string>(attachment.content, {
        auth: {
          username: config.email,
          password: config.apiToken,
        },
        responseType: 'text',
        transformResponse: [(data) => data],
        timeout: 30_000,
      });

      enriched.push({
        ...attachment,
        textContent: String(response.data ?? ''),
      });
    } catch {
      enriched.push(attachment);
    }
  }

  return enriched;
}

function isTextAttachment(attachment: JiraAttachment): boolean {
  return (
    /text\/plain|application\/json|text\/csv/i.test(attachment.mimeType ?? '') ||
    /\.(txt|csv|json|md)$/i.test(attachment.filename)
  );
}

function extractCriteriaFromText(text: string): string[] {
  const marker = text.match(/acceptance criteria\s*:?\s*([\s\S]*)/i);

  if (!marker) {
    return [];
  }

  return splitLines(marker[1]).filter((line) => !/^(comments?|notes?)\s*:?$/i.test(line));
}

function extractAttachments(value: unknown): JiraAttachment[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isRecord)
    .map((attachment) => ({
      id: String(attachment.id ?? ''),
      filename: String(attachment.filename ?? ''),
      mimeType: attachment.mimeType ? String(attachment.mimeType) : undefined,
      size: typeof attachment.size === 'number' ? attachment.size : undefined,
      content: attachment.content ? String(attachment.content) : undefined,
    }))
    .filter((attachment) => attachment.id || attachment.filename);
}

export function adfToPlainText(value: unknown): string {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return htmlToPlainText(value);
  }

  if (Array.isArray(value)) {
    return value.map(adfToPlainText).filter(Boolean).join('\n');
  }

  if (!isRecord(value)) {
    return '';
  }

  const nodeType = typeof value.type === 'string' ? value.type : '';
  const parts: string[] = [];

  if (typeof value.text === 'string') {
    parts.push(value.text);
  }

  if (nodeType === 'hardBreak') {
    parts.push('\n');
  }

  if (Array.isArray(value.content)) {
    parts.push(value.content.map(adfToPlainText).filter(Boolean).join(''));
  }

  const joined = parts.join('');

  if (['paragraph', 'heading', 'listItem', 'bulletList', 'orderedList'].includes(nodeType)) {
    return `${joined.trim()}\n`;
  }

  return joined;
}

function htmlToPlainText(value: string | undefined): string {
  if (!value) {
    return '';
  }

  return value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function splitLines(value: string): string[] {
  return value
    .split(/\n|•|- |\d+\.\s/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
