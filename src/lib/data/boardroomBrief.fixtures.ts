import { meetingId } from './boardroomMeeting.fixtures';
import type { BoardroomBrief } from './boardroomBrief';

/** Nigel's brief on item 1 of the fixtures' meeting, as he first wrote it. */
export const nigelsFirstBrief: BoardroomBrief = {
	id: 'nigels-first-brief',
	organisationId: 'ybt',
	meetingId,
	agendaItemId: 'item-1',
	directorId: 'nigels-seat',
	version: 1,
	position: 'Against the new hire until March.',
	mayShare: 'That cash is tight.',
	mustNotShare: 'The bank balance.',
	mustComeBack: 'Any offer over £40,000.',
	createdAt: '2026-11-10T19:00:00.000Z'
};

/** Nigel's second thoughts on the same item, kept beside the first. */
export const nigelsSecondBrief: BoardroomBrief = {
	...nigelsFirstBrief,
	id: 'nigels-second-brief',
	version: 2,
	position: 'For the new hire from January.',
	mayShare: null,
	createdAt: '2026-11-11T09:00:00.000Z'
};

/** Jeremy's brief on item 1: nothing of it is ever shown to Nigel. */
export const jeremysBrief: BoardroomBrief = {
	...nigelsFirstBrief,
	id: 'jeremys-brief',
	directorId: 'jeremys-seat',
	position: "Jeremy's private position.",
	mayShare: null,
	mustNotShare: "Jeremy's secret.",
	mustComeBack: null
};
