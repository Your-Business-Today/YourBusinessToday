import { beforeEach, describe, expect, it, vi } from 'vitest';
import { requireBoardroomDirector } from './requireBoardroomDirector';
import type { BoardroomDirector } from '$lib/data/boardroomDirector';

const room = vi.hoisted(() => ({ switchedOn: [] as string[], directors: [] as BoardroomDirector[], isStaff: false }));
const ybt = { id: 'ybt', parentOrganisationId: null, name: 'Your Business Today' };
const jeremyOnYbt = [{ organisationId: 'ybt', accountId: 'jeremy', isManager: false }];

vi.mock('./requireOrganisationAccess', () => ({
	requireOrganisationAccess: async () => ({
		user: { id: 'jeremy' },
		organisation: ybt,
		isStaff: room.isStaff,
		canManage: false,
		visitor: { accountId: 'jeremy', isStaff: room.isStaff, organisationMemberships: room.isStaff ? [] : jeremyOnYbt }
	})
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => room.switchedOn }));
vi.mock('$lib/server/boardroom/getDirectorsOfOrganisation', () => ({ getDirectorsOfOrganisation: async () => room.directors }));

const locals = { supabase: {} } as App.Locals;
const jeremysSeat: BoardroomDirector = {
	id: 'seat',
	organisationId: 'ybt',
	accountId: 'jeremy',
	name: 'Jeremy',
	namedAt: '2026-11-10T12:00:00.000Z',
	stoodDownAt: null
};
const notFound = expect.objectContaining({ status: 404 });

describe('a Boardroom page', () => {
	beforeEach(() => {
		room.switchedOn = ['boardroom'];
		room.directors = [jeremysSeat];
		room.isStaff = false;
	});

	it('opens for a sitting director', async () => {
		const access = await requireBoardroomDirector(locals, 'ybt');
		expect(access.organisation).toBe(ybt);
	});

	it('is not found while Boardroom is off, asked before the director check', async () => {
		room.switchedOn = [];
		await expect(requireBoardroomDirector(locals, 'ybt')).rejects.toEqual(notFound);
	});

	it('is not found by someone on the organisation who is not named', async () => {
		room.directors = [];
		await expect(requireBoardroomDirector(locals, 'ybt')).rejects.toEqual(notFound);
	});

	it('is not found by an administrator, who reaches the organisation but is not named', async () => {
		room.isStaff = true;
		room.directors = [];
		await expect(requireBoardroomDirector(locals, 'ybt')).rejects.toEqual(notFound);
	});
});
