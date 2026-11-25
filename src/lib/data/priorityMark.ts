/** Where a task marked as priority is put among the tasks beside it. */
export const priorityMarkPlace = 1;

export const priorityMarkLabel = 'Priority';

export const priorityMarkRefusal =
	'isPriority is true to mark the task as priority, or false to take the mark off.';

const markByFormWord: Record<string, boolean> = { true: true, false: false };

/** A form's priority mark, sent as the word true or false; anything else is refused. */
export function readPriorityMarkFromForm(value: FormDataEntryValue | null): boolean | undefined {
	return markByFormWord[String(value)];
}

/** A connector's priority mark, sent as a JSON true or false; anything else is refused. */
export function readPriorityMarkFromInput(value: unknown): boolean | undefined {
	if (typeof value !== 'boolean') return undefined;
	return value;
}

/** The mark as a line of a connector reading names it, beside the department tag. */
export function priorityMarkTag(isPriority: boolean): string {
	if (!isPriority) return '';
	return ' [priority]';
}

export function priorityMarkSentence(taskTitle: string, isPriority: boolean): string {
	if (!isPriority) return `"${taskTitle}" is no longer marked as priority; it keeps its place.`;
	return `"${taskTitle}" is marked as priority and now sits first among the tasks beside it.`;
}

export function priorityMarkButtonLabel(isPriority: boolean): string {
	if (!isPriority) return 'Mark as priority';
	return 'Take off priority';
}
