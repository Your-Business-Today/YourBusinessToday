<script lang="ts">
	import { filterWhenTasksOpen, type TaskListFilter } from '$lib/data/taskListFilter';

	let {
		pageNumber,
		pageCount,
		filter
	}: { pageNumber: number; pageCount: number; filter: TaskListFilter } = $props();

	const hasPreviousPage = $derived(pageNumber > 1);
	const hasNextPage = $derived(pageNumber < pageCount);

	function pageHref(targetPageNumber: number): string {
		const parameters = new URLSearchParams();
		if (targetPageNumber > 1) parameters.set('page', String(targetPageNumber));
		if (filter !== filterWhenTasksOpen) parameters.set('status', filter);
		const query = parameters.toString();
		if (query === '') return '/tasks';
		return `/tasks?${query}`;
	}
</script>

{#if pageCount > 1}
	<nav aria-label="Task pages" class="flex items-center justify-between gap-4">
		{#if hasPreviousPage}
			<a
				href={pageHref(pageNumber - 1)}
				class="rounded-full border border-hairline px-4 py-1.5 font-display text-sm text-chalk/70
					transition hover:border-go hover:text-go"
			>
				← Previous
			</a>
		{:else}
			<span></span>
		{/if}
		<span class="font-display text-sm text-chalk/50">Page {pageNumber} of {pageCount}</span>
		{#if hasNextPage}
			<a
				href={pageHref(pageNumber + 1)}
				class="rounded-full border border-hairline px-4 py-1.5 font-display text-sm text-chalk/70
					transition hover:border-go hover:text-go"
			>
				Next →
			</a>
		{:else}
			<span></span>
		{/if}
	</nav>
{/if}
