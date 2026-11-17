import { describe, expect, it } from 'vitest';
import { leaveOutLeadOrganisations } from './pickableOrganisations';

const yourBusinessToday = { id: 'ybt', name: 'Your Business Today' };
const conservaqua = { id: 'conservaqua', name: 'Conservaqua' };
const everyOrganisation = [conservaqua, yourBusinessToday];
const leadOrganisationIds = new Set([conservaqua.id]);

describe('leaveOutLeadOrganisations', () => {
	it('leaves out an organisation opened for a lead', () => {
		expect(leaveOutLeadOrganisations(everyOrganisation, leadOrganisationIds)).toEqual([yourBusinessToday]);
	});

	it('offers every organisation when none is a lead’s', () => {
		expect(leaveOutLeadOrganisations(everyOrganisation, new Set())).toEqual(everyOrganisation);
	});

	it('keeps the organisation a record already sits in', () => {
		expect(leaveOutLeadOrganisations(everyOrganisation, leadOrganisationIds, conservaqua.id)).toEqual(everyOrganisation);
	});
});
