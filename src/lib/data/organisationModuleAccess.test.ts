import { describe, expect, it } from 'vitest';
import { canUseOrganisationModule, usableModules } from './organisationModuleAccess';
import {
	jeremy,
	jewelEnterprises,
	jewelPassiveFire,
	memberships,
	nigel,
	nigelOnJewel,
	stuart,
	yourBusinessToday
} from './organisationAccess.fixtures';
import type { OrganisationVisitor } from './organisationAccess';
import type { ModuleOrganisation } from './organisationModuleAccess';

function personOnTheBoard(accountId: string): OrganisationVisitor {
	return { accountId, isStaff: false, organisationMemberships: memberships };
}

const staff: OrganisationVisitor = { accountId: 'james', isStaff: true, organisationMemberships: [] };
const passiveFireWithBooks: ModuleOrganisation = { organisation: jewelPassiveFire, switchedOn: ['books'] };
const jewelWithEverything: ModuleOrganisation = {
	organisation: jewelEnterprises,
	switchedOn: ['books', 'brand', 'business_brain', 'boardroom']
};

describe('a module that is off', () => {
	it('is used by nobody, staff included', () => {
		expect(canUseOrganisationModule(staff, passiveFireWithBooks, 'brand')).toBe(false);
		expect(canUseOrganisationModule(personOnTheBoard(stuart), passiveFireWithBooks, 'brand')).toBe(false);
	});

	it('is not switched on for a business because it is on for the client above it', () => {
		const passiveFireWithNothing: ModuleOrganisation = { organisation: jewelPassiveFire, switchedOn: [] };
		expect(canUseOrganisationModule(personOnTheBoard(jeremy), passiveFireWithNothing, 'books')).toBe(false);
	});
});

describe('a module that is on', () => {
	it('is used by the people on the organisation', () => {
		expect(canUseOrganisationModule(personOnTheBoard(stuart), passiveFireWithBooks, 'books')).toBe(true);
	});

	it('is used by the people put on it from Jewel Enterprises, as its projects are reached', () => {
		expect(canUseOrganisationModule(personOnTheBoard(jeremy), passiveFireWithBooks, 'books')).toBe(true);
		expect(canUseOrganisationModule(personOnTheBoard(nigel), passiveFireWithBooks, 'books')).toBe(true);
	});

	it('is not used by someone on Jewel Enterprises alone', () => {
		const onJewelAlone: OrganisationVisitor = { accountId: nigel, isStaff: false, organisationMemberships: [nigelOnJewel] };
		expect(canUseOrganisationModule(onJewelAlone, passiveFireWithBooks, 'books')).toBe(false);
	});

	it('is not used by someone on another organisation', () => {
		const yourBusinessTodayWithBooks: ModuleOrganisation = { organisation: yourBusinessToday, switchedOn: ['books'] };
		expect(canUseOrganisationModule(personOnTheBoard(stuart), yourBusinessTodayWithBooks, 'books')).toBe(false);
		expect(canUseOrganisationModule(personOnTheBoard(stuart), jewelWithEverything, 'books')).toBe(false);
	});

	it('is used by staff on any organisation', () => {
		expect(canUseOrganisationModule(staff, passiveFireWithBooks, 'books')).toBe(true);
	});
});

describe('the modules a person sees', () => {
	it('are the switched-on ones they may use, and none where they reach nothing', () => {
		expect(usableModules(personOnTheBoard(nigel), jewelWithEverything)).toEqual(jewelWithEverything.switchedOn);
		expect(usableModules(personOnTheBoard(stuart), jewelWithEverything)).toEqual([]);
	});
});
