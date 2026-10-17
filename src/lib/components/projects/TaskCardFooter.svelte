<script lang="ts">
	import LifecycleBadgeChip from '$lib/components/lifecycle/LifecycleBadgeChip.svelte';
	import TaskDueDate from './TaskDueDate.svelte';
	import TaskKindTags from './TaskKindTags.svelte';
	import TaskProgressMeter from './TaskProgressMeter.svelte';
	import TaskRaisedDate from './TaskRaisedDate.svelte';
	import type { BuildModel } from '$lib/data/buildModels';
	import type { LifecycleBadge } from '$lib/data/lifecycleBadge';
	import type { TaskTreeNode } from '$lib/server/projects/buildTaskTree';

	let {
		task,
		isDone,
		goalTitle,
		isAutocomplete,
		lifecycle,
		buildModel
	}: {
		task: TaskTreeNode;
		isDone: boolean;
		goalTitle: string | null;
		isAutocomplete: boolean;
		lifecycle: LifecycleBadge | null;
		buildModel: BuildModel | null;
	} = $props();

	const hasBranch = $derived(task.branchName !== '');
	const chipClasses = 'rounded-full border border-hairline px-2 py-0.5 font-display text-xs text-chalk/60';
</script>

<div
	class="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-hairline/70 pt-3 text-chalk/60"
>
	<TaskKindTags {task} />
	<span title={goalTitle ?? 'Not under a goal'} class={`max-w-48 truncate ${chipClasses}`}>
		{goalTitle ?? 'No goal'}
	</span>
	<span title="Story points — how big the task is" class={`whitespace-nowrap ${chipClasses}`}>
		{task.storyPoints} pts
	</span>
	{#if !isAutocomplete}
		<span title="Autocomplete is off — a person gives input before an AI completes it" class={`whitespace-nowrap ${chipClasses}`}>
			Not autocomplete
		</span>
	{/if}
	{#if buildModel !== null}
		<span title="Buildable — a model may build it unattended" class={`whitespace-nowrap ${chipClasses}`}>
			Buildable · {buildModel.label}
		</span>
	{/if}
	{#if lifecycle !== null}
		<LifecycleBadgeChip badge={lifecycle} />
	{/if}
	{#if hasBranch}
		<span title={`Worked on ${task.branchName}`} class={`max-w-40 truncate ${chipClasses}`}>
			⎇ {task.branchName}
		</span>
	{/if}
	<TaskProgressMeter completionPercent={task.completionPercent} />
	<span class="ml-auto flex flex-wrap items-center gap-x-3 gap-y-1">
		{#if task.dueDate !== null}
			<TaskDueDate dueDate={task.dueDate} {isDone} isLabelled />
		{/if}
		<TaskRaisedDate createdAt={task.createdAt} />
	</span>
</div>
