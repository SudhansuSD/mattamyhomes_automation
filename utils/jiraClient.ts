import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

function getEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`❌ Missing required environment variable: ${name}`);
    }
    return value;
}

const baseUrl = getEnv('JIRA_BASE_URL');
const email = getEnv('JIRA_EMAIL');
const apiToken = getEnv('JIRA_API_TOKEN');

export class JiraClient {
    static async getIssue(issueKey: string) {
        try {
            const response = await axios.get(
                `${baseUrl}/rest/api/3/issue/${issueKey}`,
                {
                    auth: {
                        username: email,
                        password: apiToken,
                    },
                    headers: {
                        Accept: 'application/json',
                    },
                }
            );

            return response.data;
        } catch (error: any) {
            if (error.response) {
                const status = error.response.status;
                const errorData = error.response.data;

                if (status === 404) {
                    const message = errorData?.errorMessages?.[0] || 'Issue not found';
                    throw new Error(`[404] Jira Issue Not Found: ${message}`);
                }

                throw new Error(`[${status}] Jira API Error: ${JSON.stringify(errorData)}`);
            } else if (error.message) {
                throw new Error(`Jira Client Error: ${error.message}`);
            }

            throw error;
        }
    }
}