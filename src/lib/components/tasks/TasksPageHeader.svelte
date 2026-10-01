<script lang="ts">
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { headerButtonClasses } from '$lib/components/workspace/workspaceStyles';
	import type { TaskListFilter } from '$lib/data/taskListFilter';

	let { filter }: { filter: TaskListFilter } = $props();

	const descriptions: Record<TaskListFilter, string> = {
		open: 'Every project you own, its tasks in one queue ordered by priority — the top row is the next thing to work on.',
		all: 'Every task on the projects you own, done ones included, in queue order.',
		assigned: 'Every open task assigned to you across the projects you are on, soonest due first.'
	};
</script>

<WorkspaceHeader crumbs={[]} title="Tasks">
	{#snippet actions()}
		<a href="/projects" class={headerButtonClasses}>Project view</a>
	{/snippet}
	<p class="text-sm text-chalk/60">{descriptions[filter]}</p>
</WorkspaceHeader>
