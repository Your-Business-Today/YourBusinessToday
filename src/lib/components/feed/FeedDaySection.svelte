<script lang="ts">
	import FeedEventRow from './FeedEventRow.svelte';
	import { panelListClasses } from '$lib/components/workspace/workspaceStyles';
	import type { FeedDay } from '$lib/data/feedDays';

	let { day, viewerId }: { day: FeedDay; viewerId: string } = $props();
</script>

<section class="flex flex-col gap-2">
	<div class="flex items-baseline justify-between gap-3">
		<h2 class="font-display text-xs tracking-widest text-chalk/50 uppercase">{day.label}</h2>
		<span class="font-display text-xs text-chalk/40">{day.eventCount}</span>
	</div>
	<ol class="{panelListClasses} rounded-xl border border-hairline bg-carriage">
		{#each day.events as event (event.id)}
			<FeedEventRow {event} {viewerId} />
		{/each}
	</ol>
</section>
