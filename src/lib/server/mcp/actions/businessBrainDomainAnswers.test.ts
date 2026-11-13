import { describe, expect, it } from 'vitest';
import { filingGapAnswer } from './businessBrainDomainAnswers';
import type { DomainHolder } from './domainHolder';

const holder = { readAction: 'read_business_brain_domain' } as DomainHolder;

describe('why a group’s members were refused', () => {
	it('names the member the domain does not hold, and the group naming it', () => {
		const answer = filingGapAnswer(holder, { groupSlug: 'lead-group', unknownMemberSlug: 'meeting-note' });
		expect(answer).toBe(
			'The group lead-group names meeting-note as a member, which is no record or detail the domain holds or this call writes. File it first or in the same call, or name what the domain has (read_business_brain_domain). Nothing was filed.'
		);
	});

	it('names a record two groups claim, and both groups', () => {
		const answer = filingGapAnswer(holder, { memberSlug: 'conversation-log', groupSlugs: ['client-group', 'lead-group'] });
		expect(answer).toBe('conversation-log is named a member of client-group and lead-group; a record belongs to one group at most. Name it in one group only. Nothing was filed.');
	});
});

describe('why an event or a rule was refused', () => {
	it('names the page and what it names that the domain will not hold', () => {
		const filedNothing = 'File it first or in the same call, or name what the domain has (read_business_brain_domain). Nothing was filed.';
		expect(filingGapAnswer(holder, { pageSlug: 'job-won', unknownRecordSlug: 'job' })).toBe(`job-won names the record job, which is no record the domain holds or this call writes. ${filedNothing}`);
		const unknownStatus = { pageSlug: 'job-won', recordSlug: 'job', unknownStatus: 'Won', statuses: ['Open'] };
		expect(filingGapAnswer(holder, unknownStatus)).toBe(`job-won names job in Won, which is not a status of it: its statuses are Open. ${filedNothing}`);
		expect(filingGapAnswer(holder, { pageSlug: 'invoice-on-win', unknownEventSlug: 'job-won' })).toContain('invoice-on-win follows the event job-won, which is no event');
		expect(filingGapAnswer(holder, { pageSlug: 'job-won', unknownRuleSlug: 'chase' })).toContain('names the rule chase as reacting');
		expect(filingGapAnswer(holder, { pageSlug: 'job-won', unknownWord: 'Director' })).toContain('names the word "Director", which no glossary lists');
	});
});
