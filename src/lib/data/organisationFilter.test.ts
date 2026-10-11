import { describe, expect, it } from 'vitest';
import {
	everyOrganisationFilter,
	matchesOrganisationFilter,
	noOrganisationFilter
} from './organisationFilter';

const jewel = { id: 'jewel', parentOrganisationId: null };
const passiveFire = { id: 'pfp', parentOrganisationId: 'jewel' };
const yourBusinessToday = { id: 'ybt', parentOrganisationId: null };
const organisations = [jewel, passiveFire, yourBusinessToday];

describe('the organisation filter on the projects page', () => {
	it('shows every project under all', () => {
		expect(matchesOrganisationFilter('pfp', everyOrganisationFilter, organisations)).toBe(true);
		expect(matchesOrganisationFilter(null, everyOrganisationFilter, organisations)).toBe(true);
	});

	it('shows a parent’s own projects and its sub-organisations’ projects under the parent', () => {
		expect(matchesOrganisationFilter('jewel', 'jewel', organisations)).toBe(true);
		expect(matchesOrganisationFilter('pfp', 'jewel', organisations)).toBe(true);
		expect(matchesOrganisationFilter('ybt', 'jewel', organisations)).toBe(false);
	});

	it('shows only a sub-organisation’s own projects under the sub-organisation', () => {
		expect(matchesOrganisationFilter('pfp', 'pfp', organisations)).toBe(true);
		expect(matchesOrganisationFilter('jewel', 'pfp', organisations)).toBe(false);
	});

	it('shows the projects under no organisation on their own', () => {
		expect(matchesOrganisationFilter(null, noOrganisationFilter, organisations)).toBe(true);
		expect(matchesOrganisationFilter('ybt', noOrganisationFilter, organisations)).toBe(false);
		expect(matchesOrganisationFilter(null, 'ybt', organisations)).toBe(false);
	});
});
