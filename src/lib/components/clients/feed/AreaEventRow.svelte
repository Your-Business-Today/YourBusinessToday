<script lang="ts">
	import AreaEventPill from './AreaEventPill.svelte';
	import { areaEventSentence, type AreaEvent } from '$lib/data/areaEvent';
	import { formatBritishTime } from '$lib/data/britishDate';

	let { event }: { event: AreaEvent } = $props();

	const timeLabel = $derived(formatBritishTime(event.createdAt));
	const sentence = $derived(areaEventSentence(event));
	const sectorPath = $derived(event.patchId === null ? null : `/clients/patches/${event.patchId}/sectors/${encodeURIComponent(event.sector)}`);
</script>

<li class="flex items-start gap-3 px-4 py-2.5 sm:items-center">
	<span class="w-12 shrink-0 pt-0.5 font-display text-xs tabular-nums text-chalk/50 sm:pt-0">{timeLabel}</span>
	<AreaEventPill kind={event.kind} />
	<span class="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
		{#if sectorPath !== null}
			<a href={sectorPath} class="min-w-0 font-display text-sm transition hover:text-go">{sentence}</a>
		{:else}
			<span class="min-w-0 font-display text-sm">{sentence}</span>
		{/if}
		<span class="flex shrink-0 items-center gap-2 text-xs text-chalk/60">
			{#if event.clientId !== null}
				<a href={`/clients/${event.clientId}`} class="text-go hover:underline">Open the client</a>
			{/if}
			{#if event.sourceUrl !== ''}
				<a href={event.sourceUrl} target="_blank" rel="noreferrer" class="hover:text-signal">Source</a>
			{/if}
		</span>
	</span>
</li>
