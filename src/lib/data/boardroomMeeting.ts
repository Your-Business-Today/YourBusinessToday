import type { BoardroomDirector } from './boardroomDirector';

/** What an agenda item asks of the board: a decision, or only that it notes something. */
export type AgendaPurpose = 'decision' | 'noting';

export const agendaPurposes: AgendaPurpose[] = ['decision', 'noting'];

/** Where a meeting stands: called until it opens, open from its time until it is closed. */
export type MeetingStage = 'called' | 'open' | 'closed';

export const meetingStages = {
	called: 'called',
	open: 'open',
	closed: 'closed'
} as const;

export type AgendaItem = {
	id: string;
	meetingId: string;
	position: number;
	title: string;
	purpose: AgendaPurpose;
	isAnyOtherBusiness: boolean;
	withdrawnAt: string | null;
};

/** One meeting of an organisation's board, as a director called it. */
export type BoardroomMeeting = {
	id: string;
	organisationId: string;
	meetsAt: string;
	chairDirectorId: string;
	calledByDirectorId: string;
	calledAt: string;
	openedAt: string | null;
	closedAt: string | null;
};

export function meetingStage(meeting: BoardroomMeeting, now: Date): MeetingStage {
	if (meeting.closedAt !== null) return meetingStages.closed;
	if (meeting.openedAt !== null) return meetingStages.open;
	const hasItsTimeCome = new Date(meeting.meetsAt).getTime() <= now.getTime();
	return hasItsTimeCome ? meetingStages.open : meetingStages.called;
}

export function isStanding(item: AgendaItem): boolean {
	return item.withdrawnAt === null;
}

/** The agenda as the directors read it, numbered from 1 in order: every item not withdrawn. */
export function standingAgenda(items: AgendaItem[]): AgendaItem[] {
	return items.filter(isStanding).sort((first, second) => first.position - second.position);
}

export function nextAgendaPosition(items: AgendaItem[]): number {
	const positions = items.map((item) => item.position);
	return Math.max(0, ...positions) + 1;
}

function wasSittingAt(director: BoardroomDirector, moment: number): boolean {
	const wasNamed = new Date(director.namedAt).getTime() <= moment;
	if (director.stoodDownAt === null) return wasNamed;
	return wasNamed && new Date(director.stoodDownAt).getTime() > moment;
}

/** Who is on a meeting: the directors sitting when it meets, or sitting now while it is still to come. */
export function directorsOnMeeting(
	directors: BoardroomDirector[],
	meeting: BoardroomMeeting,
	now: Date
): BoardroomDirector[] {
	const moment = Math.min(new Date(meeting.meetsAt).getTime(), now.getTime());
	return directors.filter((director) => wasSittingAt(director, moment));
}

const formerSeatName = 'a director no longer on record';

/** The name of the director who held a seat, sitting or stood down. */
export function nameOfSeat(directors: BoardroomDirector[], seatId: string): string {
	return directors.find((director) => director.id === seatId)?.name ?? formerSeatName;
}
