<script lang="ts">
	import DeleteTaskModal from './DeleteTaskModal.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import NewTaskForm from './NewTaskForm.svelte';
	import TaskEditForm from './TaskEditForm.svelte';
	import type { Goal } from '$lib/server/goals/goalRecord';
	import type { ProjectChoice } from '$lib/server/projects/getOtherProjects';
	import type { ProjectTask } from '$lib/server/projects/taskRecord';
	import type { ProjectPerson } from '$lib/server/members/projectPersonRecord';
	import type { TaskDeletionPlan } from '$lib/data/taskDeletion';

	let {
		task,
		parentTask,
		siblingTasks,
		people,
		goals,
		assigneeIds,
		roles,
		otherProjects,
		sequenceChoices,
		subtaskSequenceChoices,
		deletionPlan,
		isEditModalOpen = $bindable(),
		isSubtaskModalOpen = $bindable(),
		isDeleteModalOpen = $bindable()
	}: {
		task: ProjectTask;
		parentTask: ProjectTask | null;
		siblingTasks: ProjectTask[];
		people: ProjectPerson[];
		goals: Goal[];
		assigneeIds: string[];
		roles: string[];
		otherProjects: ProjectChoice[];
		sequenceChoices: ProjectTask[];
		subtaskSequenceChoices: ProjectTask[];
		deletionPlan: TaskDeletionPlan;
		isEditModalOpen: boolean;
		isSubtaskModalOpen: boolean;
		isDeleteModalOpen: boolean;
	} = $props();
</script>

<Modal title="Edit task" maxWidthClass="max-w-2xl" bind:isOpen={isEditModalOpen}>
	<TaskEditForm
		{task}
		{parentTask}
		{siblingTasks}
		{people}
		{goals}
		{assigneeIds}
		{roles}
		{otherProjects}
		{sequenceChoices}
		onSaved={() => (isEditModalOpen = false)}
	/>
</Modal>

<Modal title={`New subtask of “${task.title}”`} bind:isOpen={isSubtaskModalOpen}>
	<NewTaskForm
		createAction="?/addSubtask"
		parentTaskId={task.id}
		{goals}
		goalId={task.goalId}
		sequenceChoices={subtaskSequenceChoices}
		onCreated={() => (isSubtaskModalOpen = false)}
	/>
</Modal>

<DeleteTaskModal plan={deletionPlan} bind:isOpen={isDeleteModalOpen} />
