<script lang="ts">
	import DangerConfirmModal from '$lib/components/site/DangerConfirmModal.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import NewTaskForm from './NewTaskForm.svelte';
	import TaskEditForm from './TaskEditForm.svelte';
	import type { Goal } from '$lib/server/goals/goalRecord';
	import type { ProjectChoice } from '$lib/server/projects/getOtherProjects';
	import type { ProjectTask } from '$lib/server/projects/taskRecord';
	import type { ProjectPerson } from '$lib/server/members/projectPersonRecord';

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

<DangerConfirmModal
	title="Delete task"
	description={`This permanently deletes “${task.title}”, its subtasks, and their conversations. This cannot be undone.`}
	action="?/deleteTask"
	fields={{}}
	submitLabel="Delete task"
	bind:isOpen={isDeleteModalOpen}
/>
