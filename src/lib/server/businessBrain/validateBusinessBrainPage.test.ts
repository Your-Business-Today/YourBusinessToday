import { describe, expect, it } from 'vitest';
import { businessBrainLimits } from '$lib/data/businessBrainRules';
import { bodyRefusal, kindRefusal, slugFromTitle, slugRefusal } from './businessBrainFieldRefusals';
import { partRefusal, validateBusinessBrainPage } from './validateBusinessBrainPage';
import { sourceRefusal } from './validateBusinessBrainSource';

const aPage = {
	part: 'process',
	kind: 'process',
	title: 'How Jewel prices a fire door survey',
	summary: 'Surveys are priced per door, with a minimum visit charge.',
	body: 'Each door surveyed is priced at the rate on the schedule of rates.',
	sourceTitle: 'Email from Nigel, 3 Nov 2026',
	sourceOrigin: 'The sales mailbox'
};

describe('a page filed into Your Business Brain', () => {
	it('is taken as given, filed under a slug made from its title', () => {
		expect(validateBusinessBrainPage(aPage)).toEqual({
			part: 'process',
			kind: 'process',
			slug: 'how-jewel-prices-a-fire-door-survey',
			title: aPage.title,
			summary: aPage.summary,
			body: aPage.body,
			source: { title: aPage.sourceTitle, origin: aPage.sourceOrigin, summary: '' }
		});
	});

	it('names the part of the business, one of the four', () => {
		expect(validateBusinessBrainPage({ ...aPage, part: 'finance' })).toBe(partRefusal);
	});

	it('refuses a title longer than its column, never shortening it', () => {
		const title = 'x'.repeat(businessBrainLimits.longestTitle + 1);
		expect(validateBusinessBrainPage({ ...aPage, title })).toMatch(/title is at most 200 characters/);
	});

	it('refuses a summary longer than its column', () => {
		const summary = 'x'.repeat(businessBrainLimits.longestSummary + 1);
		expect(validateBusinessBrainPage({ ...aPage, summary })).toMatch(/summary is at most 1000 characters/);
	});

	it('refuses a kind the column cannot hold', () => {
		expect(validateBusinessBrainPage({ ...aPage, kind: 'Price List' })).toBe(kindRefusal);
	});

	it('refuses a page with no text', () => {
		expect(validateBusinessBrainPage({ ...aPage, body: '  ' })).toBe(bodyRefusal);
	});

	it('refuses a slug the column cannot hold, and asks for one when the title gives none', () => {
		expect(validateBusinessBrainPage({ ...aPage, slug: 'Fire Doors' })).toBe(slugRefusal);
		expect(validateBusinessBrainPage({ ...aPage, title: '£ — £' })).toBe(slugRefusal);
	});

	it('names its source, a new one or an earlier one, never both or neither', () => {
		const { sourceTitle: _title, sourceOrigin: _origin, ...unsourced } = aPage;
		expect(validateBusinessBrainPage(unsourced)).toBe(sourceRefusal);
		expect(validateBusinessBrainPage({ ...aPage, sourceId: '00000000-0000-0000-0000-000000000001' })).toBe(sourceRefusal);
		const fromEarlierSource = validateBusinessBrainPage({ ...unsourced, sourceId: '00000000-0000-0000-0000-000000000001' });
		expect(fromEarlierSource).toMatchObject({ source: { sourceId: '00000000-0000-0000-0000-000000000001' } });
		expect(validateBusinessBrainPage({ ...unsourced, sourceId: 'the-email' })).toMatch(/sourceId must be an id/);
	});

	it('refuses a source origin longer than its column', () => {
		const sourceOrigin = 'x'.repeat(businessBrainLimits.longestOrigin + 1);
		expect(validateBusinessBrainPage({ ...aPage, sourceOrigin })).toMatch(/sourceOrigin is at most 2000 characters/);
	});
});

describe('slugFromTitle', () => {
	it('writes the title in plain lower-case words joined by hyphens', () => {
		expect(slugFromTitle('Café rules: "Opening" hours')).toBe('cafe-rules-opening-hours');
	});

	it('stays within the slug column, ending on a word', () => {
		const slug = slugFromTitle(`${'a'.repeat(119)} b`);
		expect(slug.length).toBeLessThanOrEqual(businessBrainLimits.longestSlug);
		expect(slug.endsWith('-')).toBe(false);
	});
});
