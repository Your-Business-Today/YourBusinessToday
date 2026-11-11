import type { TaskTreeNode } from '$lib/server/projects/buildTaskTree';
import type { TaskRowHandlers } from '$lib/components/projects/taskRowActions';

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

	/** What a task card's actions do on the page: each opens its dialog, and adding a subtask opens the page's own form. */
	handlersWith(onAddSubtask: (parentTask: TaskTreeNode) => void): TaskRowHandlers {
		return {
			onAddSubtask,
			onChangeStatus: (task) => this.status.open(task),
			onChangeGoal: (task) => this.goal.open(task),
			onSetPriority: (task) => this.priority.open(task),
			onChangeStoryPoints: (task) => this.storyPoints.open(task),
			onChangeAutocomplete: (task) => this.autocomplete.open(task)
		};
	}
}
