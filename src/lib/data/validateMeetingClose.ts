import { boardMinutesRefusals } from './boardroomMinutesRules';

/** The chair's word on closing: whether they close while an item or a decision is still waiting. */
export type MeetingCloseDraft = { isClosingWithItemsWaiting: boolean };

/** The close as asked for, checked, or the sentence naming what does not fit. Left out, it is no. */
export function validateMeetingClose(input: Record<string, unknown>): MeetingCloseDraft | string {
	const given = input.closeWithItemsWaiting;
	if (given === undefined || given === null) return { isClosingWithItemsWaiting: false };
	if (typeof given !== 'boolean') return boardMinutesRefusals.confirmNotAnAnswer;
	return { isClosingWithItemsWaiting: given };
}
