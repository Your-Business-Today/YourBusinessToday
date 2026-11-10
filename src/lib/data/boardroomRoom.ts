/** Where a Claude stands on the wording proposed on an item, each time it speaks. */
export type ContributionStance = 'proposes' | 'supports' | 'objects' | 'comments';

export const contributionStances: ContributionStance[] = ['proposes', 'supports', 'objects', 'comments'];

export const stances = {
	proposes: 'proposes',
	supports: 'supports',
	objects: 'objects',
	comments: 'comments'
} as const;

/** A meeting's room, opened once by a director on it, with how many rounds each item is talked through at most. */
export type BoardroomRoom = {
	meetingId: string;
	roundsLimit: number;
	openedByDirectorId: string;
	openedAt: string;
};

/** One thing a director's Claude said on one item, kept as said; a correction is another one naming it. */
export type BoardContribution = {
	id: string;
	agendaItemId: string;
	directorId: string;
	round: number;
	stance: ContributionStance;
	words: string;
	wording: string | null;
	onProposalId: string | null;
	correctsId: string | null;
	replacesDecisionId: string | null;
	createdAt: string;
};

export type OutcomeKind = 'agreed' | 'not_agreed';

export const outcomeKinds = { agreed: 'agreed', notAgreed: 'not_agreed' } as const;

/** How an item came out of the room, before it is kept: the wording that goes to the directors, or not agreed. */
export type OutcomeDraft = {
	outcome: OutcomeKind;
	proposalId: string | null;
	wording: string | null;
	roundsTaken: number;
};

export type ItemOutcome = OutcomeDraft & { agendaItemId: string; reachedAt: string };

/** Everything said in a meeting's room: the room once open, every contribution in order, and the items come out. */
export type MeetingRoom = {
	room: BoardroomRoom | null;
	contributions: BoardContribution[];
	outcomes: ItemOutcome[];
};

export const emptyMeetingRoom: MeetingRoom = { room: null, contributions: [], outcomes: [] };

/** The meeting's room once it has been opened, or null before. */
export function openRoomOf(meetingRoom: MeetingRoom | undefined): BoardroomRoom | null {
	if (meetingRoom === undefined) return null;
	return meetingRoom.room;
}

export function outcomeOfItem(meetingRoom: MeetingRoom, agendaItemId: string): ItemOutcome | null {
	return meetingRoom.outcomes.find((outcome) => outcome.agendaItemId === agendaItemId) ?? null;
}

/** What was said on one item, in the order it was said: the numbers read_board_item gives. */
export function contributionsOnItem(meetingRoom: MeetingRoom, agendaItemId: string): BoardContribution[] {
	const onItem = meetingRoom.contributions.filter((contribution) => contribution.agendaItemId === agendaItemId);
	return onItem.sort((first, second) => first.createdAt.localeCompare(second.createdAt));
}
