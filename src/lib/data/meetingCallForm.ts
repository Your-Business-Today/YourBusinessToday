/** The names of the call-a-meeting form's fields, shared by the form and the action that reads it. */
export const meetingCallFields = {
	date: 'date',
	time: 'time',
	chair: 'chair',
	agendaTitle: 'agendaTitle',
	agendaPurpose: 'agendaPurpose'
} as const;

function textOf(formData: FormData, name: string): string {
	return String(formData.get(name) ?? '');
}

function agendaOf(formData: FormData): Record<string, string>[] {
	const titles = formData.getAll(meetingCallFields.agendaTitle).map(String);
	const purposes = formData.getAll(meetingCallFields.agendaPurpose).map(String);
	return titles.map((title, index) => ({ title, purpose: purposes[index] ?? '' }));
}

/** The form as the input a director's Claude gives call_board_meeting, so the one check reads both. */
export function meetingCallInputOf(formData: FormData): Record<string, unknown> {
	return {
		date: textOf(formData, meetingCallFields.date),
		time: textOf(formData, meetingCallFields.time),
		chair: textOf(formData, meetingCallFields.chair),
		agenda: agendaOf(formData)
	};
}
