import { describe, expect, it } from 'vitest';
import {
	everyOrganisationFilter,
	matchesOrganisationFilter,
	noOrganisationFilter
} from './organisationFilter';

describe('the organisation filter on the projects page', () => {
	it('shows every project under all', () => {
		expect(matchesOrganisationFilter('pfp', everyOrganisationFilter)).toBe(true);
		expect(matchesOrganisationFilter(null, everyOrganisationFilter)).toBe(true);
	});

	it('shows only the projects of the one organisation chosen', () => {
		expect(matchesOrganisationFilter('jewel', 'jewel')).toBe(true);
		expect(matchesOrganisationFilter('pfp', 'jewel')).toBe(false);
		expect(matchesOrganisationFilter('jewel', 'pfp')).toBe(false);
	});

	it('shows the projects under no organisation on their own', () => {
		expect(matchesOrganisationFilter(null, noOrganisationFilter)).toBe(true);
		expect(matchesOrganisationFilter('ybt', noOrganisationFilter)).toBe(false);
		expect(matchesOrganisationFilter(null, 'ybt')).toBe(false);
	});
});
