<script lang="ts">
	import Badge from '$lib/components/site/Badge.svelte';
	import StatusBoardCard from './StatusBoardCard.svelte';
	import { statusBoardColumnsOf } from './statusBoardColumns';
	import type { InternalItem } from './internalWorkGroups';
	import type { TaskRowActions } from '../taskRowActions';

	let { items, actions }: { items: InternalItem[]; actions: TaskRowActions } = $props();

	const columns = $derived(statusBoardColumnsOf(items));
</script>

<div class="grid gap-3 p-4 sm:grid-cols-2 md:p-6 xl:grid-cols-4">
	{#each columns as column (column.value)}
		<section aria-label={column.label} class="flex min-w-0 flex-col gap-3 rounded-lg bg-night/30 p-3">
			<header class="flex items-center justify-between gap-2">
				<Badge label={column.label} tone={column.tone} hasDot />
				<span class="font-display text-xs text-chalk-subtle">{column.itemCount}</span>
			</header>
			<ul class="flex max-h-144 flex-col gap-2 overflow-y-auto">
				{#each column.items as item (item.id)}
					<StatusBoardCard {item} owners={actions.assigneesFor(item.id)} />
				{:else}
					<li class="px-1 py-2 text-xs text-chalk-faint">Nothing here.</li>
				{/each}
			</ul>
		</section>
	{/each}
</div>
