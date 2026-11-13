import { describe, expect, it } from 'vitest';
import { businessBrainTabKeys, businessBrainTabOf, businessBrainTabsFor } from './businessBrainTabs';

const pageAt = (search: string) => new URL(`https://www.yourbusiness.today/organisations/org-1/business-brain${search}`);

describe('the tabs of Your Business Brain', () => {
	it('opens on the drawn brain when the address names no tab, or one the page does not have', () => {
		expect(businessBrainTabOf(pageAt(''))).toBe(businessBrainTabKeys.brain);
		expect(businessBrainTabOf(pageAt('?tab=people'))).toBe(businessBrainTabKeys.brain);
		expect(businessBrainTabOf(pageAt('?tab=brains'))).toBe(businessBrainTabKeys.brain);
	});

	it('opens on the tab the address names', () => {
		expect(businessBrainTabOf(pageAt('?tab=pages'))).toBe(businessBrainTabKeys.pages);
		expect(businessBrainTabOf(pageAt('?tab=files'))).toBe(businessBrainTabKeys.files);
	});

	it('shows the drawn brain first, then Pages and Files, each counting what it holds and none counting nothing', () => {
		const tabs = businessBrainTabsFor({ pageCount: 12, fileCount: 0 });
		expect(tabs.map(({ label, count, href }) => [label, count, href])).toEqual([
			['Brain', null, '?tab=brain'],
			['Pages', 12, '?tab=pages'],
			['Files', null, '?tab=files']
		]);
	});
});
