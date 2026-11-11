<script lang="ts">
	import FlashMessage from '$lib/components/workspace/FlashMessage.svelte';
	import ProjectDashboard from '$lib/components/projects/ProjectDashboard.svelte';
	import BoardSideSwitch from '$lib/components/projects/BoardSideSwitch.svelte';
	import DepartmentTabs from '$lib/components/projects/DepartmentTabs.svelte';
	import ProjectDetailHeader from '$lib/components/projects/ProjectDetailHeader.svelte';
	import ProjectNewTaskModal from '$lib/components/projects/ProjectNewTaskModal.svelte';
	import TaskRowModals from '$lib/components/projects/TaskRowModals.svelte';
	import TaskSheet from './TaskSheet.svelte';
	import { fade } from 'svelte/transition';
	import { tabSwap } from '$lib/client/motion';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';
	import { TaskRowDialogs } from '$lib/client/taskRowDialogs.svelte';
	import type { TaskTreeNode } from '$lib/server/projects/buildTaskTree';

	let { data, form } = $props();

	const { project } = $derived(data);

	let isTaskModalOpen = $state(false);
	let subtaskParent = $state<TaskTreeNode | null>(null);
	const dialogs = new TaskRowDialogs();

	function openNewTaskModal() {
		subtaskParent = null;
		isTaskModalOpen = true;
	}

	function openSubtaskModal(parentTask: TaskTreeNode) {
		subtaskParent = parentTask;
		isTaskModalOpen = true;
	}
</script>

<svelte:head>
	<title>{project.name} — Projects — Your Business Today</title>
</svelte:head>

<ProjectDetailHeader
	{project}
	organisations={data.organisations}
	latestKitVersion={data.latestKitVersion}
	onAddTask={openNewTaskModal}
/>

<div class={workspaceBodyClasses}>
	<FlashMessage message={form?.message} />
	<BoardSideSwitch sides={data.sideTabs} selected={data.boardSide} />
	<DepartmentTabs tabs={data.departmentTabs} selected={data.boardTab} />
	{#key data.boardTab}
		<div in:fade={tabSwap} class="flex flex-col gap-4">
			<ProjectDashboard
				projectId={project.id}
				sources={data}
				handlers={{
					onAddSubtask: openSubtaskModal,
					onChangeStatus: (task) => dialogs.status.open(task),
					onChangeGoal: (task) => dialogs.goal.open(task),
					onSetPriority: (task) => dialogs.priority.open(task),
					onChangeStoryPoints: (task) => dialogs.storyPoints.open(task),
					onChangeAutocomplete: (task) => dialogs.autocomplete.open(task)
				}}
			/>
		</div>
	{/key}
</div>

<ProjectNewTaskModal bind:isOpen={isTaskModalOpen} parentTask={subtaskParent} sources={data} />

<TaskRowModals {dialogs} goals={data.goals} canTurnOnAutocomplete={data.canTurnOnAutocomplete} />
<TaskSheet />
