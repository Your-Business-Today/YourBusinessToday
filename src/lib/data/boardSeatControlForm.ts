/** The names of the fields a director uses to steer, pause and answer for their own Claude on the meeting page. */
export const seatControlFields = {
	words: 'words',
	setting: 'setting',
	isOn: 'isOn',
	heldId: 'heldId',
	answer: 'answer'
} as const;

/** The load dependency the meeting page re-reads while it is open, so it follows the meeting as it happens. */
export const boardMeetingDependency = 'ybt:board-meeting';

/** How often the meeting page follows the meeting: shorter than a feed's beat, since the Claudes speak in turns. */
export const boardMeetingRefreshMilliseconds = 10_000;

/** The meeting page's form, as the input the one check reads. */
export function seatControlInputOf(formData: FormData): Record<string, unknown> {
	const names = Object.values(seatControlFields);
	return Object.fromEntries(names.map((name) => [name, String(formData.get(name) ?? '')]));
}
