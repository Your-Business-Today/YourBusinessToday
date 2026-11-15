import { taskDeletionInputs } from '$lib/data/taskDeletion';
import type { TaskDeletionRequest } from './deleteTask';

const saidYes = 'true';

/** What the Delete task form asks for, in the name of whoever sent it. */
export function readTaskDeletionRequest(formData: FormData, deletedByAccountId: string): TaskDeletionRequest {
	const typedTitle = String(formData.get(taskDeletionInputs.keepFinishedUnderTitle) ?? '').trim();
	return {
		completedParentTitle: typedTitle === '' ? null : typedTitle,
		shouldDeleteOpenSubtasks: formData.get(taskDeletionInputs.deleteOpenSubtasks) === saidYes,
		deletedByAccountId
	};
}
