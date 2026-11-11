<script lang="ts">
	import Badge from '$lib/components/site/Badge.svelte';
	import ScrumCardItem from './ScrumCardItem.svelte';
	import { buildStageMeanings } from '$lib/data/buildStage';
	import { cardCountPhrase, type ScrumColumn } from '$lib/data/scrumBoard';
	import { buildStageTones } from './scrumBoardStyles';

	let { column }: { column: ScrumColumn } = $props();

	const tally = $derived(`${cardCountPhrase(column.cardCount)}, ${column.totalPoints} points`);
</script>

<section aria-label={column.label} title={buildStageMeanings[column.stage]} class="flex min-w-0 flex-col gap-3 rounded-lg bg-night/30 p-3">
	<header class="flex items-center justify-between gap-2">
		<Badge label={column.label} tone={buildStageTones[column.stage]} hasDot />
		<span title={tally} class="font-display text-xs whitespace-nowrap text-chalk-subtle">
			{column.cardCount} · {column.totalPoints} pts
		</span>
	</header>
	<ul class="flex max-h-144 flex-col gap-2 overflow-y-auto">
		{#each column.cards as card (card.id)}
			<ScrumCardItem {card} />
		{:else}
			<li class="px-1 py-2 text-xs text-chalk-faint">Nothing here.</li>
		{/each}
	</ul>
</section>
