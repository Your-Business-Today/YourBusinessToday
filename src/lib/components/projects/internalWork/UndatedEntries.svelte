<script lang="ts">
	import Badge from '$lib/components/site/Badge.svelte';
	import CalendarEntryLink from './CalendarEntryLink.svelte';
	import type { CalendarEntry } from './internalCalendar';

	let { entries }: { entries: CalendarEntry[] } = $props();
</script>

<aside aria-label="No date" class="flex min-w-0 flex-col gap-2 border-t border-hairline p-4 lg:border-t-0 lg:border-l">
	<h3 class="flex items-center gap-2 font-display text-sm font-semibold text-chalk">
		No date
		<Badge label={entries.length} />
	</h3>
	<ul class="flex flex-col gap-1">
		{#each entries as entry (entry.id)}
			<li><CalendarEntryLink {entry} /></li>
		{:else}
			<li class="text-xs text-chalk-faint">Everything has a due date.</li>
		{/each}
	</ul>
</aside>
