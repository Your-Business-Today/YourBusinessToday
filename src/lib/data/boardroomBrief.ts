/** What a director tells their Claude on one agenda item: their position, and how far their Claude may go. */
export type BoardBriefWords = {
	position: string;
	mayShare: string | null;
	mustNotShare: string | null;
	mustComeBack: string | null;
};

/** A brief as a director gives it: the agenda item by its number now, and what they tell their Claude. */
export type BoardBriefDraft = BoardBriefWords & { itemNumber: number };

/** One version of one director's brief on one agenda item, as kept. Only that director ever reads it. */
export type BoardroomBrief = BoardBriefWords & {
	id: string;
	organisationId: string;
	meetingId: string;
	agendaItemId: string;
	directorId: string;
	version: number;
	createdAt: string;
};

/** That a director's brief is in on an item, and nothing of what it says. */
export type BriefIn = { agendaItemId: string; directorId: string };

/** What the person reading a meeting knows of its briefs: their seat, their own briefs, and whose briefs are in. */
export type MeetingBriefing = { seatId: string | null; ownBriefs: BoardroomBrief[]; briefsIn: BriefIn[] };

/** Every version of a director's brief on one item, the latest first. */
export function versionsOnItem(briefs: BoardroomBrief[], agendaItemId: string): BoardroomBrief[] {
	const onItem = briefs.filter((brief) => brief.agendaItemId === agendaItemId);
	return onItem.sort((first, second) => second.version - first.version);
}

export function latestOwnBrief(briefing: MeetingBriefing, agendaItemId: string): BoardroomBrief | null {
	return versionsOnItem(briefing.ownBriefs, agendaItemId)[0] ?? null;
}

/** The seats whose brief is in on one item. */
export function seatsBriefedOnItem(briefing: MeetingBriefing, agendaItemId: string): string[] {
	const onItem = briefing.briefsIn.filter((briefIn) => briefIn.agendaItemId === agendaItemId);
	return onItem.map((briefIn) => briefIn.directorId);
}
