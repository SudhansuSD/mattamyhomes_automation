import { Page, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

export class SearchPage extends HomePage {
    readonly page: Page;

    constructor(page: Page) {
        super(page);
        this.page = page;
    }

    async verifyFilterByPrice(): Promise<void> {

        const communityTab = await this.page.locator('span').filter({ hasText: 'Communities' }).first();
        await communityTab.click();
        const priceFilterBtn = await this.page.getByRole('button', { name: 'Dropdown price filter: ' });
        await priceFilterBtn.waitFor({ state: "visible" });
        await priceFilterBtn.click();
        const minPriceInput = this.page.getByText('$ No min');
        const maxPriceInput = this.page.getByText('$ No Max');
        await minPriceInput.click();
        const priceDropDown = await this.page.locator(".qqqAu");
        await priceDropDown.getByRole("button", { name: "$ 400K" }).click();
        await priceFilterBtn.click();
        await maxPriceInput.click();
        await priceDropDown.getByRole("button", { name: "$ 500K" }).click();

        // Verify total communities displayed are within the selected price range
        if (await this.page.getByRole('heading', { name: 'Communities' }).isVisible()) {
            const communityCards = this.page.locator('.cmVfyU');
            await expect(communityCards).toHaveCount(4);
        }
        else {
            throw new Error("No communities found for the selected price range");
        }
    }
}