import { beforeEach, describe, expect, it, vi } from 'vitest';
import { enterableModules } from './enterableModules';
import { nigelsSeat } from '$lib/data/boardroomMeeting.fixtures';
import type { BoardroomDirector } from '$lib/data/boardroomDirector';
import type { OrganisationModule } from '$lib/data/organisationModules';

const board = vi.hoisted(() => ({ directors: [] as BoardroomDirector[] }));
vi.mock('$lib/server/boardroom/getDirectorsOfOrganisation', () => ({ getDirectorsOfOrganisation: async () => board.directors }));

const switchedOn: OrganisationModule[] = ['books', 'boardroom'];
const place = { organisation: { id: 'ybt' }, switchedOn };
const onYbt = (accountId: string) => [{ organisationId: 'ybt', accountId, isManager: false }];
const nigel = { accountId: 'nigel', isStaff: false, organisationMemberships: onYbt('nigel') };
const jeremy = { accountId: 'jeremy', isStaff: true, organisationMemberships: onYbt('jeremy') };

function modulesFor(visitor: typeof nigel): Promise<OrganisationModule[]> {
	return enterableModules({ supabase: {} } as never, visitor, place, switchedOn);
}

describe('the Boardroom item in the side bar', () => {
	beforeEach(() => {
		board.directors = [nigelsSeat];
	});

	it('shows for a named director of the organisation', async () => {
		expect(await modulesFor(nigel)).toEqual(['books', 'boardroom']);
	});

	it('is hidden from anyone else, staff included, and the other modules stay', async () => {
		expect(await modulesFor(jeremy)).toEqual(['books']);
	});
});
