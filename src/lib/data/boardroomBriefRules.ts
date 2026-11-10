/** The limits of boardroom_briefs (migration 0181), stated once for the service and the form. */
export const boardBriefLimits = { longestPart: 4000 } as const;

const { longestPart } = boardBriefLimits;

export const boardBriefRefusals = {
	itemNumberNotANumber: 'itemNumber is the number of an agenda item as read_board_meeting gives it now: a whole number from 1.',
	positionMissing: `position is the director's own position on the item, in their words: required, at most ${longestPart} characters.`,
	mayShareTooLong: `mayShare is what their Claude may share in the room: at most ${longestPart} characters, or left out.`,
	mustNotShareTooLong: `mustNotShare is what their Claude must keep back: at most ${longestPart} characters, or left out.`,
	mustComeBackTooLong: `mustComeBack is what must come back to the director before it goes further: at most ${longestPart} characters, or left out.`,
	versionNotANumber: 'version is the number of one of your briefs on the item, a whole number from 1; leave it out for the latest.',
	itemNotOnAgenda: 'That number is not an item on the agenda as read_board_meeting gives it now.',
	meetingHasClosed: 'The meeting has closed; its briefs are kept as they stood.',
	callerHasNoSeat: 'Only a sitting director of the board briefs their Claude for its meetings.',
	noBriefYet: 'You have not briefed your Claude on that item yet. Brief it with brief_board_item.',
	noSuchVersion: 'You have no brief on that item with that version. read_board_brief without a version gives the latest and lists the others.'
} as const;

export function isFittingBriefPart(text: string): boolean {
	return text.length <= longestPart;
}
