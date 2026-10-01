<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import TaskDueDate from './TaskDueDate.svelte';
	import { isTaskDone } from '$lib/data/taskStatus';
	import { taskStatusLabelFor } from '$lib/data/taskKind';
	import type { ProjectTask } from '$lib/server/projects/taskRecord';

	let {
		task,
		goalTitle,
		assigneeNames
	}: { task: ProjectTask; goalTitle: string | null; assigneeNames: string[] } = $props();

	const queueLabel = $derived(task.globalPriority === null ? '' : ` · queue ${task.globalPriority}`);
	const facts = $derived([
		{ label: 'Status', value: taskStatusLabelFor(task.kind, task.status) },
		{ label: 'Goal', value: goalTitle ?? '—' },
		{ label: 'Assignees', value: assigneeNames.length > 0 ? assigneeNames.join(', ') : 'Unassigned' },
		{ label: 'Priority', value: `${task.priority}${queueLabel}` },
		{ label: 'Points', value: `${task.storyPoints}` },
		{ label: 'Complete', value: `${task.completionPercent}%` }
	]);
</script>

<DashboardPanel title="Details">
	<dl class="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 px-4 py-3 text-sm">
		{#each facts as fact (fact.label)}
			<dt class="font-display text-xs text-chalk/50">{fact.label}</dt>
			<dd class="min-w-0 font-display break-words">{fact.value}</dd>
		{/each}
		<dt class="font-display text-xs text-chalk/50">Due</dt>
		<dd class="font-display">
			{#if task.dueDate !== null}
				<TaskDueDate dueDate={task.dueDate} isDone={isTaskDone(task.status)} />
			{:else}
				<span class="text-chalk/50">—</span>
			{/if}
		</dd>
	</dl>
</DashboardPanel>
