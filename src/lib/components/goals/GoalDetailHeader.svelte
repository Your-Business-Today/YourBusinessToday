<script lang="ts">
	import GoalStatusPill from './GoalStatusPill.svelte';
	import HeaderFacts from '$lib/components/workspace/HeaderFacts.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { goalHorizonLabels } from '$lib/data/goalHorizon';
	import { isTaskDone } from '$lib/data/taskStatus';
	import { projectCrumbs } from '$lib/components/workspace/projectCrumbs';
	import {
		headerDangerButtonClasses,
		headerPrimaryButtonClasses
	} from '$lib/components/workspace/workspaceStyles';
	import type { Goal } from '$lib/server/goals/goalRecord';
	import type { ProjectTask } from '$lib/server/projects/taskRecord';

	type LinkedProject = { id: string; name: string };

	let {
		goal,
		project,
		tasks,
		onEdit,
		onDelete
	}: {
		goal: Goal;
		project: LinkedProject;
		tasks: ProjectTask[];
		onEdit: () => void;
		onDelete: () => void;
	} = $props();

	const doneCount = $derived(tasks.filter((task) => isTaskDone(task.status)).length);
	const facts = $derived([
		{ label: `${goalHorizonLabels[goal.horizon]} goal` },
		{ label: `Priority ${goal.priority}` },
		{ label: `${doneCount} of ${tasks.length} tasks done` }
	]);
</script>

<WorkspaceHeader crumbs={projectCrumbs(project)} title={goal.title}>
	{#snippet badge()}
		<GoalStatusPill status={goal.status} />
	{/snippet}
	{#snippet actions()}
		<button type="button" onclick={onDelete} class={headerDangerButtonClasses}>Delete</button>
		<button type="button" onclick={onEdit} class={headerPrimaryButtonClasses}>Edit goal</button>
	{/snippet}
	<HeaderFacts {facts} />
</WorkspaceHeader>
