import { describe, expect, it } from 'vitest';
import { bodyRefusal, kindRefusal } from './businessBrainFieldRefusals';
import { validateBusinessBrainRevision } from './validateBusinessBrainRevision';

const aRevision = {
	pageId: '00000000-0000-0000-0000-00000000000a',
	title: 'How Jewel prices a fire door survey',
	body: 'Each door surveyed is priced at the 2027 rate.',
	sourceId: '00000000-0000-0000-0000-00000000000b'
};

describe('a revision filed into Your Business Brain', () => {
	it('keeps the kind and summary the page has when they are left out', () => {
		expect(validateBusinessBrainRevision(aRevision)).toEqual({
			pageId: aRevision.pageId,
			kind: null,
			title: aRevision.title,
			summary: null,
			body: aRevision.body,
			source: { sourceId: aRevision.sourceId }
		});
	});

	it('takes a summary given as blank as blank, not as kept', () => {
		expect(validateBusinessBrainRevision({ ...aRevision, summary: '' })).toMatchObject({ summary: '' });
	});

	it('names the page by its id', () => {
		expect(validateBusinessBrainRevision({ ...aRevision, pageId: 'fire-doors' })).toMatch(/pageId must be an id/);
	});

	it('refuses a kind the column cannot hold', () => {
		expect(validateBusinessBrainRevision({ ...aRevision, kind: 'price-list' })).toBe(kindRefusal);
	});

	it('refuses a revision with no text', () => {
		expect(validateBusinessBrainRevision({ ...aRevision, body: '' })).toBe(bodyRefusal);
	});
});
