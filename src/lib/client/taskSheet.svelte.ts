import { goto, pushState } from '$app/navigation';
import { page } from '$app/state';
import { chosenDepartment } from '$lib/data/departmentBoard';
import { isPlainClick } from './plainClick';
import type { Department } from '$lib/data/department';

export type TaskSheetTarget = { projectId: string; taskId: string };

/** A task named from another task — the one it waits for, a step in its sequence — with the tab it sits on. */
export type TaskReference = TaskSheetTarget & { department: Department };

const projectBoardRoute = '/projects/[projectId]';

export function taskPagePath({ projectId, taskId }: TaskSheetTarget): string {
	return `/projects/${projectId}/tasks/${taskId}`;
}

function boardTabPath({ projectId, department }: TaskReference): string {
	return `/projects/${projectId}?department=${department}`;
}

function isShowingBoardTab({ projectId, department }: TaskReference): boolean {
	const { url } = page;
	const isThisProject = url.pathname === `/projects/${projectId}`;
	return isThisProject && chosenDepartment(url) === department;
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
		this.show(target);
	}

	/**
	 * On a board, a plain click on a task named from another task brings up the tab it sits on and
	 * opens it as the sheet; anywhere else the link goes to the task's page as any link does.
	 */
	openReferenceOnPlainClick(event: MouseEvent, reference: TaskReference): void {
		const { route } = page;
		const isOnABoard = route.id === projectBoardRoute;
		if (!isOnABoard) return;
		if (!isPlainClick(event)) return;
		event.preventDefault();
		void this.openOnItsTab(reference);
	}

	private async openOnItsTab(reference: TaskReference): Promise<void> {
		const isAlreadyOpen = this.target?.taskId === reference.taskId;
		if (isAlreadyOpen) return;
		const isOnItsTab = isShowingBoardTab(reference);
		const tabPath = boardTabPath(reference);
		if (!isOnItsTab) await goto(tabPath, { noScroll: true });
		this.show({ projectId: reference.projectId, taskId: reference.taskId });
	}

	private show(target: TaskSheetTarget): void {
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
