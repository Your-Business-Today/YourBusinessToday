import { readDay } from './days';
import { parseTodoStatus, todoLimits, todoStatusOrder, type TodoStatus } from './todo';

export type TodoChanges = {
	title?: string;
	notes?: string | null;
	status?: TodoStatus;
	dueDate?: string | null;
};

const titleRefusal = `A to-do's title is 1 to ${todoLimits.longestTitle} characters.`;
const notesRefusal = `A to-do's notes are at most ${todoLimits.longestNotes} characters.`;
const statusRefusal = `A to-do's status is one of ${todoStatusOrder.join(', ')}.`;
const dueDateRefusal = 'A due date is a real day written YYYY-MM-DD.';

/** The changes as given, each checked against its column, or a sentence naming the field that does not fit. */
export function validateTodoChanges(fields: Record<string, unknown>): TodoChanges | string {
	const changes: TodoChanges = {};
	if ('title' in fields) {
		const title = String(fields.title ?? '').trim();
		if (title === '' || title.length > todoLimits.longestTitle) return titleRefusal;
		changes.title = title;
	}
	if ('notes' in fields) {
		const notes = String(fields.notes ?? '').trim();
		if (notes.length > todoLimits.longestNotes) return notesRefusal;
		changes.notes = notes === '' ? null : notes;
	}
	if ('status' in fields) {
		const status = parseTodoStatus(fields.status);
		if (status === null) return statusRefusal;
		changes.status = status;
	}
	if ('dueDate' in fields) {
		const dueDate = readDay(fields.dueDate);
		if (dueDate === undefined) return dueDateRefusal;
		changes.dueDate = dueDate;
	}
	return changes;
}
