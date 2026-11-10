import { agendaPurposes } from './boardroomMeeting';

/** The limits of boardroom_agenda_items (migration 0158), stated once for the service and any form. */
export const agendaItemTitleMaximumLength = 300;

export const boardroomMeetingRefusals = {
	dateNotADay: 'date is the day the meeting meets, a real day written YYYY-MM-DD.',
	timeNotATime: 'time is when the meeting starts on the UK clock, written HH:MM in 24 hours.',
	timeNotOnTheClock: 'That time does not exist on the UK clock that day, as the clocks go forward; choose another.',
	timeHasPassed: 'A board meeting is called for a time still to come.',
	agendaMissing: 'agenda is a list of at least one item, each with a title and a purpose.',
	itemNotAnObject: 'Each agenda item is an object with a title and a purpose.',
	titleMissing: 'Each agenda item needs a title saying what is to be decided or noted.',
	titleTooLong: `An agenda item's title is at most ${agendaItemTitleMaximumLength} characters.`,
	purposeUnknown: `An agenda item's purpose is one of ${agendaPurposes.join(', ')}.`,
	chairNotADirector: 'The chair is a sitting director of this organisation: name them by account id, email or name.',
	callerHasNoSeat: 'Only a sitting director calls a board meeting.',
	noSuchMeeting: 'This organisation has no board meeting with that id. Call list_board_meetings for its meetings.',
	nothingToChange: 'Give at least one of add, reword or withdraw.',
	numberNotOnAgenda: 'Each number is one on the agenda as read_board_meeting gives it now.',
	numberTwice: 'Each agenda item is reworded or withdrawn once in a call.',
	rewordNotAnObject: 'Each item to reword is an object with its number, and a new title, purpose or both.',
	withdrawNotNumbers: 'withdraw is a list of agenda item numbers.',
	meetingHasOpened:
		'The meeting has opened, so nothing on its agenda is reworded or withdrawn; add an item and it is taken as any other business.',
	meetingHasClosed: 'The meeting has closed; its agenda is kept as it stood.'
} as const;

export function agendaItemTitleRefusal(title: string): string | null {
	if (title.length === 0) return boardroomMeetingRefusals.titleMissing;
	if (title.length <= agendaItemTitleMaximumLength) return null;
	return boardroomMeetingRefusals.titleTooLong;
}
