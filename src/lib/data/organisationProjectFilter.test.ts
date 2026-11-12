import { describe, expect, it } from 'vitest';
import {
	activeProjectsFilter,
	matchesOrganisationProjectFilter,
	organisationProjectFilterLabel,
	organisationProjectFilterOrder
} from './organisationProjectFilter';

describe("the organisation's project filter", () => {
	it('counts a project as active while it is being scoped, built, tested or maintained', () => {
		expect(matchesOrganisationProjectFilter('scoping', activeProjectsFilter)).toBe(true);
		expect(matchesOrganisationProjectFilter('maintenance', activeProjectsFilter)).toBe(true);
		expect(matchesOrganisationProjectFilter('on_hold', activeProjectsFilter)).toBe(false);
		expect(matchesOrganisationProjectFilter('complete', activeProjectsFilter)).toBe(false);
	});

	it('shows every project under All and one status under its own name', () => {
		expect(matchesOrganisationProjectFilter('on_hold', 'all')).toBe(true);
		expect(matchesOrganisationProjectFilter('on_hold', 'on_hold')).toBe(true);
		expect(matchesOrganisationProjectFilter('building', 'on_hold')).toBe(false);
	});

	it('offers Active first, then All, then each status', () => {
		const labels = organisationProjectFilterOrder.map(organisationProjectFilterLabel);
		expect(labels.slice(0, 3)).toEqual(['Active', 'All', 'Scoping']);
		expect(labels).toContain('On hold');
	});
});
