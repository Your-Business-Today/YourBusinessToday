import { describe, expect, it } from 'vitest';
import { validateDomainFiling } from './validateDomainFiling';

const source = { sourceTitle: 'Staff handbook 2026', sourceOrigin: 'SharePoint: Handbook.docx' };
const insuredAward = {
	kind: 'rule',
	slug: 'award-only-when-insured',
	title: 'A work order is awarded only when the subcontractor’s insurance is in date.',
	summary: 'Nobody works uninsured on site',
	body: 'An uninsured subcontractor leaves the business carrying the risk.',
	contextSlug: 'client-work',
	governs: ['work-order', 'subcontractor']
};
const glossary = {
	kind: 'glossary',
	slug: 'client-work-glossary',
	title: 'Client work glossary',
	summary: 'The words of client work',
	body: 'PVR is the programme valuation report.',
	contextSlug: 'client-work',
	terms: [{ word: 'PVR', meaning: 'Programme valuation report' }]
};

function pagesOf(pages: Record<string, unknown>[]) {
	const filing = validateDomainFiling({ ...source, pages });
	if (typeof filing === 'string') throw new Error(filing);
	return filing.pages;
}

describe('validating the facts a rule and a glossary carry', () => {
	it('takes a rule with the things it governs, and a glossary with its words one to a row', () => {
		const [rule, words] = pagesOf([insuredAward, glossary]);
		expect(rule.facts).toEqual({ governs: ['work-order', 'subcontractor'] });
		expect(words.facts).toEqual({ terms: [{ word: 'PVR', meaning: 'Programme valuation report' }] });
	});

	it('takes a glossary that lists no words, as one filed before words were kept did', () => {
		const [words] = pagesOf([{ ...glossary, terms: undefined }]);
		expect(words.facts).toEqual({ terms: [] });
	});

	it('refuses a rule that governs nothing, or names a thing twice', () => {
		expect(validateDomainFiling({ ...source, pages: [{ ...insuredAward, governs: [] }] })).toContain('pages 1: A rule names the things it governs');
		expect(validateDomainFiling({ ...source, pages: [{ ...insuredAward, governs: ['job', 'job'] }] })).toContain('each once');
	});

	it('refuses a governed thing that is not a slug, and a word with no meaning, naming where', () => {
		expect(validateDomainFiling({ ...source, pages: [{ ...insuredAward, governs: ['Work order'] }] })).toContain('pages 1: governs. The slug is');
		const wordless = { ...glossary, terms: [{ word: 'PVR', meaning: '' }] };
		expect(validateDomainFiling({ ...source, pages: [wordless] })).toBe('pages 1, term 1: The meaning is required, at most 1000 characters.');
	});
});
