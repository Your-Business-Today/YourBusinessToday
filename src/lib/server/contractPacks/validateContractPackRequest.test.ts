import { describe, expect, it } from 'vitest';
import { defaultClauseSlugs } from '$lib/data/contractOptionalClauses';
import { validateContractPackRequest } from './validateContractPackRequest';

const organisationId = '00000000-0000-4000-8000-000000000001';

describe('asking for a client contract pack', () => {
	it('takes every contract document and the default clauses when none are named', () => {
		const request = validateContractPackRequest({ organisationId });
		if (typeof request === 'string') throw new Error(request);
		expect(request.documentSlugs).toContain('master-services-agreement');
		expect(request.documentSlugs).not.toContain('data-breach-procedure');
		expect(request.clauseSlugs).toEqual(defaultClauseSlugs);
	});

	it('refuses an internal procedure, an unknown clause and a clause without the one it needs', () => {
		expect(validateContractPackRequest({ organisationId, documents: ['data-breach-procedure'] })).toContain('not a contract document');
		expect(validateContractPackRequest({ organisationId, clauses: ['free-lunch'] })).toContain('no optional clause "free-lunch"');
		expect(validateContractPackRequest({ organisationId, clauses: ['buy-out'] })).toContain('needs "ybt-owns-the-software"');
	});

	it('refuses a written blank no chosen document holds, and one too long, naming it', () => {
		const homeless = validateContractPackRequest({ organisationId, documents: ['order-form'], values: { 'Date of birth': 'x' } });
		expect(homeless).toContain('[Date of birth]');
		const tooLong = validateContractPackRequest({ organisationId, values: { 'Order number': 'x'.repeat(2001) } });
		expect(tooLong).toContain('[Order number] is 2001 characters');
	});

	it('takes a written blank the documents hold', () => {
		const request = validateContractPackRequest({ organisationId, documents: ['order-form'], values: { 'Order number': 'YBT-0001' } });
		if (typeof request === 'string') throw new Error(request);
		expect(request.writtenValues).toEqual({ 'Order number': 'YBT-0001' });
	});

	it('refuses an organisation id that is not an id', () => {
		expect(validateContractPackRequest({ organisationId: 'conservaqua' })).toContain('organisationId must be an id');
	});
});
