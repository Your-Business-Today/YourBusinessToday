import { directorsOnMeeting, meetingStage, meetingStages } from './boardroomMeeting';
import { latestOwnBrief, seatsBriefedOnItem, type BoardBriefWords, type MeetingBriefing } from './boardroomBrief';
import { ukMeetingTime } from './ukMeetingTime';
import type { MeetingRecord } from './describeBoardroomMeeting';

/** The reader's own latest brief on an item, as only they see it on the meeting's page. */
export type OwnBriefView = BoardBriefWords & { version: number; writtenWhen: string };

/** One item's briefs as the meeting's page shows them to one director: theirs in full, the others only as in or not. */
export type ItemBriefingView = {
	ownBrief: OwnBriefView | null;
	briefedNames: string[];
	awaitedNames: string[];
	canBrief: boolean;
};

const noBriefing: MeetingBriefing = { seatId: null, ownBriefs: [], briefsIn: [] };

function ownBriefView(briefing: MeetingBriefing, agendaItemId: string): OwnBriefView | null {
	const brief = latestOwnBrief(briefing, agendaItemId);
	if (brief === null) return null;
	const { position, mayShare, mustNotShare, mustComeBack, version } = brief;
	return { position, mayShare, mustNotShare, mustComeBack, version, writtenWhen: ukMeetingTime(brief.createdAt) };
}

export function itemBriefingViewOf(record: MeetingRecord, agendaItemId: string, now: Date): ItemBriefingView {
	const briefing = record.briefing ?? noBriefing;
	const briefedSeats = seatsBriefedOnItem(briefing, agendaItemId);
	const onIt = directorsOnMeeting(record.directors, record.meeting, now);
	const isBriefed = (seatId: string) => briefedSeats.includes(seatId);
	const isStillOpen = meetingStage(record.meeting, now) !== meetingStages.closed;
	return {
		ownBrief: ownBriefView(briefing, agendaItemId),
		briefedNames: onIt.filter((director) => isBriefed(director.id)).map((director) => director.name),
		awaitedNames: onIt.filter((director) => !isBriefed(director.id)).map((director) => director.name),
		canBrief: isStillOpen && briefing.seatId !== null
	};
}
