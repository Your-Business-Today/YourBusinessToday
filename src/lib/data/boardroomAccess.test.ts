import { describe, expect, it } from 'vitest';
import { canEnterBoardroom, type Boardroom } from './boardroomAccess';
import { jeremy, jeremyManagesJewel, jewelEnterprises, jewelPassiveFire, memberships, nigel, stuart } from './organisationAccess.fixtures';
import type { BoardroomDirector } from './boardroomDirector';
import type { OrganisationVisitor } from './organisationAccess';

const namedOn = '2026-11-10T12:00:00.000Z';
const stoodDownOn = '2026-11-11T12:00:00.000Z';

function director(accountId: string, organisationId: string, stoodDownAt: string | null = null): BoardroomDirector {
	return { id: `${accountId}-seat`, organisationId, accountId, name: accountId, namedAt: namedOn, stoodDownAt };
}

function personOnTheBoard(accountId: string): OrganisationVisitor {
	return { accountId, isStaff: false, organisationMemberships: memberships };
}

const jamesAsStaff: OrganisationVisitor = { accountId: 'james', isStaff: true, organisationMemberships: [] };
const jewelBoardroom: Boardroom = {
	organisation: jewelEnterprises,
	switchedOn: ['boardroom'],
	directors: [director(jeremy, 'jewel'), director(nigel, 'jewel', stoodDownOn)]
};

describe('who enters a boardroom', () => {
	it('is a sitting director on the organisation itself', () => {
		expect(canEnterBoardroom(personOnTheBoard(jeremy), jewelBoardroom)).toBe(true);
	});

	it('is nobody while Boardroom is off, the module rule being asked first', () => {
		const switchedOff = { ...jewelBoardroom, switchedOn: [] };
		expect(canEnterBoardroom(personOnTheBoard(jeremy), switchedOff)).toBe(false);
	});

	it('is not someone on the organisation who was never named', () => {
		expect(canEnterBoardroom(personOnTheBoard(stuart), jewelBoardroom)).toBe(false);
	});

	it('is not a director who was stood down', () => {
		expect(canEnterBoardroom(personOnTheBoard(nigel), jewelBoardroom)).toBe(false);
	});

	it('is not an administrator who is not named, though staff reach every organisation', () => {
		expect(canEnterBoardroom(jamesAsStaff, jewelBoardroom)).toBe(false);
	});

	it('is not someone on another organisation alone, even named, because a director sits on the organisation itself', () => {
		const passiveFireBoardroom: Boardroom = {
			organisation: jewelPassiveFire,
			switchedOn: ['boardroom'],
			directors: [director(jeremy, 'jewel-pfp'), director(stuart, 'jewel-pfp')]
		};
		const jeremyOnJewelAlone: OrganisationVisitor = { accountId: jeremy, isStaff: false, organisationMemberships: [jeremyManagesJewel] };
		expect(canEnterBoardroom(jeremyOnJewelAlone, passiveFireBoardroom)).toBe(false);
		expect(canEnterBoardroom(personOnTheBoard(stuart), passiveFireBoardroom)).toBe(true);
	});
});
