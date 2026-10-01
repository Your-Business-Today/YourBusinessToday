<script lang="ts">
	import {
		taskListFilterLabels,
		taskListFilterOrder,
		taskListHref,
		type TaskListFilter
	} from '$lib/data/taskListFilter';

	let { filter }: { filter: TaskListFilter } = $props();
</script>

<div class="flex flex-wrap items-center gap-2">
	{#each taskListFilterOrder as option (option)}
		<a
			href={taskListHref(option)}
			class={`shrink-0 rounded-full border px-3 py-1 font-display text-xs transition ${
				option === filter
					? 'border-go bg-go/10 text-go'
					: 'border-hairline text-chalk/60 hover:border-chalk/40 hover:text-chalk'
			}`}
		>
			{taskListFilterLabels[option]}
		</a>
	{/each}
</div>
