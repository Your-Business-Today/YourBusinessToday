import { beforeEach, describe, expect, it, vi } from 'vitest';
import { actionsFor } from './actionRegistry';
import { boardroomAction, isGatedByDirectorRule, notADirector } from './boardroomGate';
import { moduleNotSwitchedOn } from './organisationModuleGate';
import { objectSchema } from './actionTypes';
import type { AccountStanding } from './resolveAccountStanding';
import type { BoardroomDirector } from '$lib/data/boardroomDirector';
import type { McpCaller } from './resolveMcpCaller';

vi.mock('$env/static/public', () => ({
	PUBLIC_SUPABASE_URL: 'https://files.example/',
	PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'a-publishable-key'
}));
vi.mock('$env/dynamic/private', () => ({ env: {} }));
vi.mock('$env/dynamic/public', () => ({ env: {} }));

const board = vi.hoisted(() => ({ switchedOn: [] as string[], directors: [] as BoardroomDirector[] }));
vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, organisationId: string) =>
		organisationId === 'ybt' ? { id: 'ybt', name: 'Your Business Today' } : null
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => board.switchedOn }));
vi.mock('$lib/server/boardroom/getDirectorsOfOrganisation', () => ({ getDirectorsOfOrganisation: async () => board.directors }));

const anAdministrator = { isAdmin: true, isStaff: true } as AccountStanding;
const jeremyOnYbt = {
	accountId: 'jeremy',
	isStaff: false,
	organisationMemberships: [{ organisationId: 'ybt', accountId: 'jeremy', isManager: false }]
} as McpCaller;
const jamesAsStaff = { accountId: 'james', isStaff: true, organisationMemberships: [] } as unknown as McpCaller;
const jeremysSeat: BoardroomDirector = {
	id: 'seat',
	organisationId: 'ybt',
	accountId: 'jeremy',
	name: 'Jeremy',
	namedAt: '2026-11-10T12:00:00.000Z',
	stoodDownAt: null
};

const enterRoom = boardroomAction({
	name: 'enter_test_boardroom',
	area: 'organisations',
	audience: 'everyone',
	isWrite: false,
	summary: 'a room',
	inputSchema: objectSchema({ organisationId: { type: 'string' } }, ['organisationId']),
	run: async (_caller, _input, organisation) => `In the boardroom of ${organisation.name}.`
});

describe('every connector action of the Boardroom asks both checks', () => {
	it('is built by boardroomAction, so the director check cannot be skipped', () => {
		const boardroomActions = actionsFor(anAdministrator, null).filter((action) => action.module === 'boardroom');
		expect(boardroomActions.length).toBeGreaterThan(0);
		expect(boardroomActions.filter((action) => !isGatedByDirectorRule(action)).map((action) => action.name)).toEqual([]);
	});
});

describe('boardroomAction', () => {
	beforeEach(() => {
		board.switchedOn = ['boardroom'];
		board.directors = [jeremysSeat];
	});

	it('asks the module rule first: a director gets nothing while Boardroom is off', async () => {
		board.switchedOn = [];
		expect(await enterRoom.run(jeremyOnYbt, { organisationId: 'ybt' })).toBe(moduleNotSwitchedOn('boardroom'));
	});

	it('lets a sitting director in', async () => {
		expect(await enterRoom.run(jeremyOnYbt, { organisationId: 'ybt' })).toBe('In the boardroom of Your Business Today.');
	});

	it('keeps out an administrator who is not named', async () => {
		expect(await enterRoom.run(jamesAsStaff, { organisationId: 'ybt' })).toBe(notADirector);
	});

	it('keeps out a director once stood down', async () => {
		board.directors = [{ ...jeremysSeat, stoodDownAt: '2026-11-11T12:00:00.000Z' }];
		expect(await enterRoom.run(jeremyOnYbt, { organisationId: 'ybt' })).toBe(notADirector);
	});
});
