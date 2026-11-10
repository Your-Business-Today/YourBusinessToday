/** The names of the brief form's fields, shared by the form and the action that reads it. */
export const boardBriefFields = {
	itemNumber: 'itemNumber',
	position: 'position',
	mayShare: 'mayShare',
	mustNotShare: 'mustNotShare',
	mustComeBack: 'mustComeBack'
} as const;

function textOf(formData: FormData, name: string): string {
	return String(formData.get(name) ?? '');
}

/** The form as the input a director's Claude gives brief_board_item, so the one check reads both. */
export function boardBriefInputOf(formData: FormData): Record<string, unknown> {
	return {
		itemNumber: Number(textOf(formData, boardBriefFields.itemNumber)),
		position: textOf(formData, boardBriefFields.position),
		mayShare: textOf(formData, boardBriefFields.mayShare),
		mustNotShare: textOf(formData, boardBriefFields.mustNotShare),
		mustComeBack: textOf(formData, boardBriefFields.mustComeBack)
	};
}

/** The four parts of a brief as the form asks for them, the position first and the only one required. */
export const boardBriefParts = [
	{ name: boardBriefFields.position, label: 'My position', hint: 'What you think, in your own words', isRequired: true },
	{ name: boardBriefFields.mayShare, label: 'It may share', hint: 'What your Claude may tell the other directors', isRequired: false },
	{ name: boardBriefFields.mustNotShare, label: 'It must not share', hint: 'What your Claude keeps back', isRequired: false },
	{
		name: boardBriefFields.mustComeBack,
		label: 'Must come back to me',
		hint: 'What your Claude brings back to you before it goes further',
		isRequired: false
	}
] as const;
