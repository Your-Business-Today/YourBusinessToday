import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setBoardroomDirector } from './setBoardroomDirector';
import { boardroomDirectorRefusals } from '$lib/data/boardroomDirectorRules';
import type { BoardroomDirector } from '$lib/data/boardroomDirector';

const board = vi.hoisted(() => ({
	switchedOn: [] as string[],
	directors: [] as BoardroomDirector[],
	named: [] as unknown[],
	stoodDown: [] as string[]
}));
const jeremy = { id: 'jeremy', name: 'Jeremy', email: 'jeremy@example.com', isManager: false, since: '' };

vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => board.switchedOn }));
vi.mock('./getDirectorsOfOrganisation', () => ({ getDirectorsOfOrganisation: async () => board.directors }));
vi.mock('$lib/server/organisations/getMembersOfOrganisation', async (importOriginal) => ({
	...(await importOriginal<object>()),
	getMembersOfOrganisation: async () => [jeremy]
}));
vi.mock('./nameBoardroomDirector', () => ({ nameBoardroomDirector: async (_supabase: unknown, naming: unknown) => board.named.push(naming) }));
vi.mock('./standDownBoardroomDirector', () => ({
	standDownBoardroomDirector: async (_supabase: unknown, directorId: string) => board.stoodDown.push(directorId)
}));

const supabase = {} as never;
const ybt = { id: 'ybt', name: 'Your Business Today' } as never;
const jeremysSeat: BoardroomDirector = {
	id: 'seat',
	organisationId: 'ybt',
	accountId: 'jeremy',
	name: 'Jeremy',
	namedAt: '2026-11-10T12:00:00.000Z',
	stoodDownAt: null
};

function change(member: string, isDirector: boolean) {
	return { member, isDirector, changedBy: 'james' };
}

describe('naming a director', () => {
	beforeEach(() => {
		board.switchedOn = ['boardroom'];
		board.directors = [];
		board.named = [];
		board.stoodDown = [];
	});

	it('is refused while Boardroom is off', async () => {
		board.switchedOn = [];
		expect(await setBoardroomDirector(supabase, ybt, change('jeremy', true))).toEqual({
			isRefusal: true,
			message: boardroomDirectorRefusals.boardroomIsOff
		});
	});

	it('is refused for someone not on the organisation itself', async () => {
		const outcome = await setBoardroomDirector(supabase, ybt, change('nigel@example.com', true));
		expect(outcome.message).toBe(boardroomDirectorRefusals.notOnTheOrganisation);
		expect(board.named).toEqual([]);
	});

	it('seats someone on the organisation, by email, with their name kept', async () => {
		const outcome = await setBoardroomDirector(supabase, ybt, change('jeremy@example.com', true));
		expect(outcome.isRefusal).toBe(false);
		expect(board.named).toEqual([{ organisationId: 'ybt', accountId: 'jeremy', name: 'Jeremy', namedBy: 'james' }]);
	});

	it('is refused for a sitting director, so nobody holds two seats', async () => {
		board.directors = [jeremysSeat];
		expect((await setBoardroomDirector(supabase, ybt, change('jeremy', true))).isRefusal).toBe(true);
	});
});

describe('standing a director down', () => {
	beforeEach(() => {
		board.switchedOn = ['boardroom'];
		board.directors = [jeremysSeat];
		board.stoodDown = [];
	});

	it('dates their seat, deleting nothing', async () => {
		const outcome = await setBoardroomDirector(supabase, ybt, change('Jeremy', false));
		expect(outcome.isRefusal).toBe(false);
		expect(board.stoodDown).toEqual(['seat']);
	});

	it('is refused for someone who is not sitting', async () => {
		board.directors = [{ ...jeremysSeat, stoodDownAt: '2026-11-11T12:00:00.000Z' }];
		expect((await setBoardroomDirector(supabase, ybt, change('jeremy', false))).isRefusal).toBe(true);
		expect(board.stoodDown).toEqual([]);
	});
});
