<script lang="ts">
	import FlashMessage from '$lib/components/workspace/FlashMessage.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import NewTaskForm from '$lib/components/projects/NewTaskForm.svelte';
	import ProjectDashboard from '$lib/components/projects/ProjectDashboard.svelte';
	import ProjectDetailHeader from '$lib/components/projects/ProjectDetailHeader.svelte';
	import TaskRowModals from '$lib/components/projects/TaskRowModals.svelte';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';
	import type { TaskTreeNode } from '$lib/server/projects/buildTaskTree';

	let { data, form } = $props();

	let isTaskModalOpen = $state(false);
	let isStatusModalOpen = $state(false);
	let isGoalModalOpen = $state(false);
	let isPriorityModalOpen = $state(false);
	let subtaskParent = $state<TaskTreeNode | null>(null);
	let statusTask = $state<TaskTreeNode | null>(null);
	let goalTask = $state<TaskTreeNode | null>(null);
	let priorityTask = $state<TaskTreeNode | null>(null);

	function openNewTaskModal() {
		subtaskParent = null;
		isTaskModalOpen = true;
	}

	function openSubtaskModal(parentTask: TaskTreeNode) {
		subtaskParent = parentTask;
		isTaskModalOpen = true;
	}

	function openStatusModal(task: TaskTreeNode) {
		statusTask = task;
		isStatusModalOpen = true;
	}

	function openGoalModal(task: TaskTreeNode) {
		goalTask = task;
		isGoalModalOpen = true;
	}

	function openPriorityModal(task: TaskTreeNode) {
		priorityTask = task;
		isPriorityModalOpen = true;
	}

	const taskModalTitle = $derived(
		subtaskParent === null ? 'New task' : `New subtask of “${subtaskParent.title}”`
	);
</script>

<svelte:head>
	<title>{data.project.name} — Projects — Your Business Today</title>
</svelte:head>

<ProjectDetailHeader
	project={data.project}
	cadenceLine={data.cadenceLine}
	latestKitVersion={data.latestKitVersion}
	onAddTask={openNewTaskModal}
/>

<div class={workspaceBodyClasses}>
	<FlashMessage message={form?.message} />
	<ProjectDashboard
		projectId={data.project.id}
		sources={data}
		handlers={{
			onAddSubtask: openSubtaskModal,
			onChangeStatus: openStatusModal,
			onChangeGoal: openGoalModal,
			onSetPriority: openPriorityModal
		}}
	/>
</div>

<Modal title={taskModalTitle} bind:isOpen={isTaskModalOpen}>
	<NewTaskForm
		parentTaskId={subtaskParent?.id ?? null}
		goals={data.goals}
		onCreated={() => (isTaskModalOpen = false)}
	/>
</Modal>

<TaskRowModals
	{statusTask}
	{goalTask}
	{priorityTask}
	goals={data.goals}
	bind:isStatusModalOpen
	bind:isGoalModalOpen
	bind:isPriorityModalOpen
/>
