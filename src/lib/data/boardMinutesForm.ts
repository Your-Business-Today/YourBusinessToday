/** The names of the fields the meeting page closes a meeting and answers its minutes with. */
export const boardMinutesFields = {
	closeWithItemsWaiting: 'closeWithItemsWaiting',
	version: 'version',
	answer: 'answer',
	changeWords: 'changeWords'
} as const;

const tickedValue = 'on';

/** The close form, as the input the one check reads: the tick as true or false. */
export function meetingCloseInputOf(formData: FormData): Record<string, unknown> {
	return { closeWithItemsWaiting: formData.get(boardMinutesFields.closeWithItemsWaiting) === tickedValue };
}

/** The minutes answer form, as the input the one check reads: the version's number as a number. */
export function minutesAnswerInputOf(formData: FormData): Record<string, unknown> {
	const version = Number(formData.get(boardMinutesFields.version));
	const answer = String(formData.get(boardMinutesFields.answer) ?? '');
	const changeWords = String(formData.get(boardMinutesFields.changeWords) ?? '');
	return { version, answer, changeWords };
}
