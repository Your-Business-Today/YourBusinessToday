import type { AgendaItem, BoardroomMeeting } from './boardroomMeeting';
import type { BoardroomDirector } from './boardroomDirector';

/** Your Business Today's board and one meeting of it — as the Boardroom tests know them. */
export const meetingId = '6f0e2c1a-3b4d-4e5f-8a9b-0c1d2e3f4a5b';
export const namedOnTheFirst = '2026-11-01T00:00:00.000Z';

export const nigelsSeat: BoardroomDirector = {
	id: 'nigels-seat',
	organisationId: 'ybt',
	accountId: 'nigel',
	name: 'Nigel',
	namedAt: namedOnTheFirst,
	stoodDownAt: null
};
export const jeremysSeat: BoardroomDirector = {
	...nigelsSeat,
	id: 'jeremys-seat',
	accountId: 'jeremy',
	name: 'Jeremy'
};
export const formerSeat: BoardroomDirector = {
	...nigelsSeat,
	id: 'old-seat',
	accountId: 'old',
	name: 'Old',
	stoodDownAt: namedOnTheFirst
};

/** Called by Nigel on 10 Nov 2026 for 10:00 on 12 Nov 2026, with Jeremy in the chair. */
export const calledMeeting: BoardroomMeeting = {
	id: meetingId,
	organisationId: 'ybt',
	meetsAt: '2026-11-12T10:00:00.000Z',
	chairDirectorId: 'jeremys-seat',
	calledByDirectorId: 'nigels-seat',
	calledAt: '2026-11-10T18:00:00.000Z',
	openedAt: null,
	closedAt: null
};

export const dayBeforeTheMeeting = new Date('2026-11-11T10:00:00Z');
export const duringTheMeeting = new Date('2026-11-12T10:30:00Z');

export function agendaItem(position: number, withdrawnAt: string | null = null): AgendaItem {
	return {
		id: `item-${position}`,
		meetingId,
		position,
		title: `Item ${position}`,
		purpose: 'noting',
		isAnyOtherBusiness: false,
		withdrawnAt
	};
}

export const yourBusinessToday = { id: 'ybt', parentOrganisationId: null, name: 'Your Business Today' } as never;
