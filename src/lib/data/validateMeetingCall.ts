import { readDay } from './days';
import { momentOnUkClock } from './ukClock';
import { boardroomMeetingRefusals } from './boardroomMeetingRules';
import { validateAgendaItemDrafts, type AgendaItemDraft } from './validateAgendaItem';

/** A board meeting as a director calls it: when it meets, who chairs it (null for the caller) and its agenda. */
export type MeetingCall = {
	meetsAt: string;
	chair: string | null;
	agenda: AgendaItemDraft[];
};

const clockTimePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

function readMeetingTime(input: Record<string, unknown>, now: Date): string | { refusal: string } {
	const date = readDay(input.date);
	if (typeof date !== 'string') return { refusal: boardroomMeetingRefusals.dateNotADay };
	const time = String(input.time ?? '').trim();
	if (!clockTimePattern.test(time)) return { refusal: boardroomMeetingRefusals.timeNotATime };
	const moment = momentOnUkClock({ date, time });
	if (moment === null) return { refusal: boardroomMeetingRefusals.timeNotOnTheClock };
	if (moment.getTime() <= now.getTime()) return { refusal: boardroomMeetingRefusals.timeHasPassed };
	return moment.toISOString();
}

/** The call as given, every value checked against its column, or the sentence naming the one that does not fit. */
export function validateMeetingCall(input: Record<string, unknown>, now: Date): MeetingCall | string {
	const meetsAt = readMeetingTime(input, now);
	if (typeof meetsAt !== 'string') return meetsAt.refusal;
	const agenda = validateAgendaItemDrafts(input.agenda);
	if (typeof agenda === 'string') return agenda;
	if (agenda.length === 0) return boardroomMeetingRefusals.agendaMissing;
	const chair = String(input.chair ?? '').trim();
	return { meetsAt, chair: chair === '' ? null : chair, agenda };
}
