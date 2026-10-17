import type { TaskTreeNode } from '$lib/server/projects/buildTaskTree';

/** One dialog a task card opens: which task it is about, and whether it is showing. */
export class TaskRowDialog {
	task = $state<TaskTreeNode | null>(null);
	isOpen = $state(false);

	open(task: TaskTreeNode): void {
		this.task = task;
		this.isOpen = true;
	}
}

/** The dialogs a task card's actions open on a project's task list. */
export class TaskRowDialogs {
	status = new TaskRowDialog();
	goal = new TaskRowDialog();
	priority = new TaskRowDialog();
	storyPoints = new TaskRowDialog();
	autocomplete = new TaskRowDialog();
}
