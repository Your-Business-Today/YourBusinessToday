/** The names of the fields a director records an action with on the meeting page. */
export const boardActionFields = {
	itemNumber: 'itemNumber',
	what: 'what',
	owner: 'owner',
	dueOn: 'dueOn',
	projectId: 'projectId',
	department: 'department'
} as const;

/** The meeting page's action form, as the input the one check reads: the item's number as a number. */
export function boardActionInputOf(formData: FormData): Record<string, unknown> {
	const text = (field: string) => String(formData.get(field) ?? '');
	const { what, owner, dueOn, projectId, department } = boardActionFields;
	const input = { what: text(what), owner: text(owner), dueOn: text(dueOn), projectId: text(projectId), department: text(department) };
	return { itemNumber: Number(formData.get(boardActionFields.itemNumber)), ...input };
}

/** Who and where an action can go to, as the meeting page offers them: the organisation's people and its own projects. */
export type BoardActionChoices = { people: { id: string; name: string }[]; projects: { id: string; name: string }[] };

export const noBoardActionChoices: BoardActionChoices = { people: [], projects: [] };
