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
