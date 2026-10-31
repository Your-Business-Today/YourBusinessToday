import { pushState } from '$app/navigation';
import { isPlainClick } from './plainClick';

export type TaskSheetTarget = { projectId: string; taskId: string };

export function taskPagePath({ projectId, taskId }: TaskSheetTarget): string {
	return `/projects/${projectId}/tasks/${taskId}`;
}

/**
 * The task open as a sheet over the board: a plain click on a task's title pushes the task's
 * address and keeps the board beneath, so the browser's back closes the sheet and a reload opens
 * the task's page in full. A form posted from the sheet reloads the board, which clears the
 * pushed state, so the sheet stays open while the address is still the task's.
 */
class TaskSheet {
	target = $state<TaskSheetTarget | null>(null);

	openOnPlainClick(event: MouseEvent, target: TaskSheetTarget): void {
		if (!isPlainClick(event)) return;
		event.preventDefault();
		this.target = target;
		pushState(taskPagePath(target), { taskSheet: target });
	}

	close(): void {
		if (this.target === null) return;
		history.back();
	}

	/** After a step back or forward in the history, or a reload of the board, which task the sheet shows. */
	follow(state: App.PageState, pathname: string): void {
		if (state.taskSheet !== undefined) {
			this.target = state.taskSheet;
			return;
		}
		if (this.target === null) return;
		if (pathname !== taskPagePath(this.target)) this.target = null;
	}
}

export const taskSheet = new TaskSheet();
