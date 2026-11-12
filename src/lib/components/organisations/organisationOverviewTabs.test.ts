import { describe, expect, it } from 'vitest';
import { organisationOverviewTabsFor, type OverviewTabFacts } from './organisationOverviewTabs';

const staffedWithBoardroom: OverviewTabFacts = { memberCount: 4, switchedOnModuleCount: 3, hasModulesTab: true, directorCount: 2 };

const tabsOf = (facts: OverviewTabFacts) => organisationOverviewTabsFor(facts).map(({ label, count }) => [label, count]);

describe('organisationOverviewTabsFor', () => {
	it('opens on People, and leaves the projects to the side bar’s own page', () => {
		expect(tabsOf(staffedWithBoardroom)).toEqual([
			['People', 4],
			['Details', null],
			['Modules', 3],
			['Directors', 2]
		]);
	});

	it('shows Modules only to someone who can see one, and Directors only where there is a boardroom', () => {
		const memberWithoutModules = { ...staffedWithBoardroom, hasModulesTab: false, directorCount: null };
		expect(tabsOf(memberWithoutModules)).toEqual([
			['People', 4],
			['Details', null]
		]);
	});

	it('counts nothing on a tab that holds nothing', () => {
		const nobodyNamedYet = { ...staffedWithBoardroom, switchedOnModuleCount: 0, directorCount: 0 };
		expect(tabsOf(nobodyNamedYet).slice(2)).toEqual([
			['Modules', null],
			['Directors', null]
		]);
	});
});
