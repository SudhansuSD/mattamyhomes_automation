import { Locator, Page, expect } from '@playwright/test';
import { HomePage } from './HomePage';

export class QMIPage extends HomePage {
    // -----------------------------
    // QMI Home Search
    // -----------------------------
    async verifySearchByQMI() {
        const heading = this.page.locator('h1');    
        // Ensure page content is ready
        await expect(heading).toBeVisible({ timeout: 20000 });
        const countryContainer = this.page.locator('#countryContainer');
        await expect(countryContainer).toBeVisible({ timeout: 10000 });
        const countryText = (await countryContainer.textContent())?.toUpperCase() || '';
        if (countryText.includes('CANADA')) {
            await expect(heading).toContainText(/1230 148 Avenue NW/i);
        } else if (countryText.includes('USA')) {
            await expect(heading).toContainText(/123 Appalachian Trail/i);
        } else {
            throw new Error(`Unknown country detected: ${countryText}`);
        }
    }
}