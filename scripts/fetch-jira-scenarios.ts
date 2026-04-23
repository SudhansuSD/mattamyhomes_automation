import { JiraToScenario } from '../utils/jiraToScenario';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

(async () => {
    try {
        const issueKey = process.argv[2] || 'MTTMY-2018';

        console.log(`🔎 Fetching Jira issue: ${issueKey}`);

        const scenario = await JiraToScenario.convert(issueKey);

        const outputPath = path.resolve(__dirname, '../data/jira-scenarios.json');
        fs.writeFileSync(outputPath, JSON.stringify(scenario, null, 2));

        console.log(`✅ Scenario file generated at: ${outputPath}`);
    } catch (error: any) {
        console.error('❌ Error:', error.message || error);
    }
})();