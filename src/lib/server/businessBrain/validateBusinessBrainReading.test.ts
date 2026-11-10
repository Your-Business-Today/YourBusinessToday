import { describe, expect, it } from 'vitest';
import { businessBrainReadLimits } from '$lib/data/businessBrainRules';
import {
	validateBusinessBrainPageAsked,
	validateBusinessBrainPart,
	validateBusinessBrainSearch
} from './validateBusinessBrainReading';

const aPageId = '00000000-0000-0000-0000-00000000000a';

describe('what a reading of Your Business Brain is asked for', () => {
	it('lists the whole brain when no part is given, and one part when one is', () => {
		expect(validateBusinessBrainPart({})).toEqual({ part: null });
		expect(validateBusinessBrainPart({ part: 'people' })).toEqual({ part: 'people' });
	});

	it('refuses a part the brain is not kept in, naming the parts it is', () => {
		expect(validateBusinessBrainPart({ part: 'gossip' })).toContain('expertise, experience, process, people');
	});

	it('refuses a blank search, and one longer than the limit rather than cutting it', () => {
		expect(validateBusinessBrainSearch({ search: '  ' })).toContain('search is required');
		const tooLong = 'a'.repeat(businessBrainReadLimits.longestSearch + 1);
		expect(validateBusinessBrainSearch({ search: tooLong })).toContain(`at most ${businessBrainReadLimits.longestSearch}`);
		expect(validateBusinessBrainSearch({ search: ' fire doors ' })).toEqual({ searchText: 'fire doors' });
	});

	it('refuses a page id that is not an id', () => {
		expect(validateBusinessBrainPageAsked({ pageId: 'opening-hours' })).toContain('pageId must be an id');
	});

	it('reads the page as it now reads unless a revision is named', () => {
		expect(validateBusinessBrainPageAsked({ pageId: aPageId })).toEqual({ pageId: aPageId, revisionId: null });
		expect(validateBusinessBrainPageAsked({ pageId: aPageId, revisionId: '12' })).toEqual({ pageId: aPageId, revisionId: 12 });
	});

	it('refuses a revision id that is not a plain whole number', () => {
		for (const revisionId of ['0', '-3', '1.5', '1e3', 'latest']) {
			expect(validateBusinessBrainPageAsked({ pageId: aPageId, revisionId })).toContain('whole number');
		}
	});
});
