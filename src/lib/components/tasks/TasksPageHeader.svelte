<script lang="ts">
	import type { TaskListFilter } from '$lib/data/taskListFilter';

	let { filter }: { filter: TaskListFilter } = $props();

	const descriptions: Record<TaskListFilter, string> = {
		open: 'Every project you own, its tasks in one queue ordered by priority — the top row is the next thing to work on.',
		all: 'Every task on the projects you own, done ones included, in queue order.',
		team: 'Tasks assigned to you on projects other people own, soonest due first.'
	};
</script>

<div class="flex flex-wrap items-end justify-between gap-4">
	<div class="flex flex-col gap-2">
		<h1 class="font-display text-3xl font-medium">Tasks</h1>
		<p class="max-w-prose text-chalk/70">{descriptions[filter]}</p>
	</div>
	<a
		href="/projects"
		class="rounded-full border border-hairline px-6 py-2.5 font-display text-sm text-chalk/80
			transition hover:border-go hover:text-go"
	>
		Project view
	</a>
</div>
