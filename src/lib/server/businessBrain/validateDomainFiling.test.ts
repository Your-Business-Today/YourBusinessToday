import { describe, expect, it } from 'vitest';
import { validateDomainFiling } from './validateDomainFiling';

const source = { sourceTitle: 'Staff handbook 2026', sourceOrigin: 'SharePoint: Handbook.docx' };
const clientWork = { slug: 'client-work', name: 'Client work', summary: 'Jobs done for clients', isCoreDomain: true };
const job = {
	kind: 'entity',
	slug: 'job',
	title: 'Job',
	summary: 'A piece of work for a client',
	body: 'A job is…',
	contextSlug: 'client-work',
	fields: [{ name: 'client', type: 'ref', ref: 'client', isRequired: true }],
	statuses: ['quoted', 'won']
};

describe('validateDomainFiling', () => {
	it('takes a source, its contexts and its pages, an entity with its fields and statuses as facts', () => {
		const filing = validateDomainFiling({ ...source, contexts: [clientWork], pages: [job] });
		if (typeof filing === 'string') throw new Error(filing);
		const [jobGiven] = filing.pages;
		expect(filing.contexts).toEqual([
			{ slug: 'client-work', title: 'Client work', summary: 'Jobs done for clients', body: 'Jobs done for clients', isCoreDomain: true }
		]);
		expect(jobGiven.facts).toEqual({
			fields: [{ name: 'client', label: 'client', type: 'ref', ref: 'client', isRequired: true, notes: '' }],
			statuses: ['quoted', 'won'],
			aggregateRootSlug: null
		});
	});

	it('refuses more pages than one source may write, never cutting the list', () => {
		const pages = Array.from({ length: 11 }, (_unused, index) => ({ ...job, slug: `job-${index}` }));
		expect(validateDomainFiling({ ...source, pages })).toBe('The pages are a list of at most 10 from one source.');
	});

	it('refuses a field of type ref that names no entity, naming the page and the field', () => {
		const pages = [{ ...job, fields: [{ name: 'client', type: 'ref' }] }];
		expect(validateDomainFiling({ ...source, pages })).toContain('pages 1, field 1: a field of type ref names the entity');
	});

	it('refuses a bounded context written as a page, and a page placed in no context', () => {
		expect(validateDomainFiling({ ...source, pages: [{ ...job, kind: 'bounded_context' }] })).toContain('a bounded context goes in contexts');
		expect(validateDomainFiling({ ...source, pages: [{ ...job, contextSlug: '' }] })).toContain('contextSlug names the bounded context');
	});

	it('refuses two core domains, a slug written twice and a retire folded into a page not written', () => {
		const otherCore = { ...clientWork, slug: 'money' };
		expect(validateDomainFiling({ ...source, contexts: [clientWork, otherCore] })).toContain('Exactly one context is the core domain');
		expect(validateDomainFiling({ ...source, pages: [job, job] })).toContain('The slug job is written twice');
		const retires = [{ slug: 'elm-court-job', foldedIntoSlug: 'contract' }];
		expect(validateDomainFiling({ ...source, pages: [job], retires })).toContain('contract is not one');
	});

	it('needs a source named', () => {
		expect(validateDomainFiling({ pages: [job] })).toContain('Name where this came from');
	});
});
