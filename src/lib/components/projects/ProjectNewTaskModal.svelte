<script lang="ts">
	import Modal from '$lib/components/site/Modal.svelte';
	import NewInternalTaskForm from './NewInternalTaskForm.svelte';
	import NewTaskForm from './NewTaskForm.svelte';
	import { boardSides, type BoardSide } from '$lib/data/boardSide';
	import { openSiblingsOf } from './openSiblings';
	import type { Department } from '$lib/data/department';
	import type { DevelopmentKind } from '$lib/data/developmentKind';
	import type { Goal } from '$lib/server/goals/goalRecord';
	import type { ProjectPerson } from '$lib/server/members/projectPersonRecord';
	import type { TaskTreeNode } from '$lib/server/projects/buildTaskTree';

	type NewTaskSources = {
		boardSide: BoardSide;
		department: Department;
		developmentKind: DevelopmentKind | null;
		goals: Goal[];
		people: ProjectPerson[];
		taskTree: TaskTreeNode[];
	};

	let {
		isOpen = $bindable(),
		parentTask,
		sources
	}: { isOpen: boolean; parentTask: TaskTreeNode | null; sources: NewTaskSources } = $props();

	const title = $derived(parentTask === null ? 'New task' : `New subtask of “${parentTask.title}”`);
	const hiddenFields = $derived({ department: sources.department, developmentKind: sources.developmentKind ?? '' });
	const sequenceChoices = $derived(openSiblingsOf(parentTask?.subtasks ?? sources.taskTree));
	const parentTaskId = $derived(parentTask?.id ?? null);
	const isInternalSide = $derived(sources.boardSide === boardSides.internal);
	const close = () => (isOpen = false);
</script>

<Modal {title} bind:isOpen>
	{#if isInternalSide}
		<NewInternalTaskForm
			{parentTaskId}
			goals={sources.goals}
			people={sources.people}
			{sequenceChoices}
			{hiddenFields}
			onCreated={close}
		/>
	{:else}
		<NewTaskForm
			{parentTaskId}
			goals={sources.goals}
			{sequenceChoices}
			{hiddenFields}
			developmentKind={sources.developmentKind}
			onCreated={close}
		/>
	{/if}
</Modal>
