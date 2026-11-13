import { describe, expect, it } from 'vitest';
import { businessBrainTabKeys, businessBrainTabOf, businessBrainTabsFor } from './businessBrainTabs';

const pageAt = (search: string) => new URL(`https://www.yourbusiness.today/organisations/org-1/business-brain${search}`);

describe('the tabs of Your Business Brain', () => {
	it('opens on Pages when the address names no tab, or one the page does not have', () => {
		expect(businessBrainTabOf(pageAt(''))).toBe(businessBrainTabKeys.pages);
		expect(businessBrainTabOf(pageAt('?tab=people'))).toBe(businessBrainTabKeys.pages);
	});

	it('opens on the tab the address names', () => {
		expect(businessBrainTabOf(pageAt('?tab=files'))).toBe(businessBrainTabKeys.files);
		expect(businessBrainTabOf(pageAt('?tab=brains'))).toBe(businessBrainTabKeys.brains);
	});

	it('shows Pages, Files and Brains, each counting what it holds and none counting nothing', () => {
		const tabs = businessBrainTabsFor({ pageCount: 12, fileCount: 0, brainCount: 2 });
		expect(tabs.map(({ label, count, href }) => [label, count, href])).toEqual([
			['Pages', 12, '?tab=pages'],
			['Files', null, '?tab=files'],
			['Brains', 2, '?tab=brains']
		]);
	});
});
