import { describe, expect, it } from 'vitest';
import { domainWordsOf, glossariesInProse } from './domainWords';
import { glossaryTermsInProse } from './glossaryTermsInProse';
import type { DomainGlossary } from './domainReading';

const listed: DomainGlossary = { pageId: 'listed', areaSlug: 'sales', areaTitle: 'Sales', terms: [{ word: 'PO', meaning: 'Purchase order' }] };
const inProse: DomainGlossary = { pageId: 'prose', areaSlug: 'delivery', areaTitle: 'Delivery', terms: [] };

const proseBody = [
	'The words the site team uses.',
	'- **PVR**: programme valuation report',
	'**Snag:** a fault found at handover',
	'- Fit-out — the work inside a finished shell',
	'- A line with no meaning given'
].join('\n');

describe('the words of a domain', () => {
	it('takes a bold or listed term and its meaning from a glossary’s prose, and leaves other lines out', () => {
		expect(glossaryTermsInProse(proseBody)).toEqual([
			{ word: 'PVR', meaning: 'programme valuation report' },
			{ word: 'Snag', meaning: 'a fault found at handover' },
			{ word: 'Fit-out', meaning: 'the work inside a finished shell' }
		]);
	});

	it('reads only the glossaries that keep no list of words', () => {
		expect(glossariesInProse([listed, inProse])).toEqual([inProse]);
	});

	it('lists every word once, one to a row in alphabetical order, with its area', () => {
		const words = domainWordsOf([listed, inProse, listed], new Map([['prose', proseBody]]));
		expect(words.map((word) => [word.word, word.areaTitle])).toEqual([
			['Fit-out', 'Delivery'],
			['PO', 'Sales'],
			['PVR', 'Delivery'],
			['Snag', 'Delivery']
		]);
	});
});
