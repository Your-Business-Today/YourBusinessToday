<script lang="ts">
	import Badge from '$lib/components/site/Badge.svelte';
	import BoardPaperEntry from './BoardPaperEntry.svelte';
	import AgendaItemBriefing from './AgendaItemBriefing.svelte';
	import ItemRoomTalk from './ItemRoomTalk.svelte';
	import HeldPieceCard from './HeldPieceCard.svelte';
	import type { BoardAgendaItemView } from '$lib/data/boardMeetingView';

	let { item }: { item: BoardAgendaItemView } = $props();

	const papers = $derived(item.papers);
</script>

<li class="flex flex-col gap-3 px-4 py-4 md:px-6">
	<div class="flex flex-wrap items-baseline gap-2">
		<span class="font-display text-sm text-chalk-subtle">{item.number}.</span>
		<span class="min-w-0 flex-1 font-medium break-words text-chalk">{item.title}</span>
		<Badge label={item.purposeWords} />
		{#if item.isAnyOtherBusiness}
			<Badge label="Any other business" tone="warning" />
		{/if}
	</div>
	{#if papers.length > 0}
		<ul class="flex flex-col gap-3">
			{#each papers as paper (paper.id)}
				<BoardPaperEntry {paper} />
			{/each}
		</ul>
	{/if}
	<AgendaItemBriefing itemNumber={item.number} briefing={item.briefing} />
	<ItemRoomTalk room={item.room} />
	{#if item.held !== null}
		<HeldPieceCard held={item.held} />
	{/if}
</li>
