<script lang="ts" generics="Event extends Dated">
	import type { Snippet } from 'svelte';
	import { panelListClasses } from '$lib/components/workspace/workspaceStyles';
	import type { Dated, FeedDay } from '$lib/data/feedDays';

	let { day, row }: { day: FeedDay<Event>; row: Snippet<[Event]> } = $props();
</script>

<section class="flex flex-col gap-2">
	<div class="flex items-baseline justify-between gap-3">
		<h2 class="font-display text-xs tracking-widest text-chalk/50 uppercase">{day.label}</h2>
		<span class="font-display text-xs text-chalk/40">{day.eventCount}</span>
	</div>
	<ol class="{panelListClasses} rounded-xl border border-hairline bg-carriage">
		{#each day.events as event (event.id)}
			{@render row(event)}
		{/each}
	</ol>
</section>
