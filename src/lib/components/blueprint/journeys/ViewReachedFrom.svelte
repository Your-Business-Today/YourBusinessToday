<script lang="ts">
	import { journeySiteMapMessages, unreachedStepWords } from './journeySiteMapWords';
	import type { ViewRow } from './journeyViewRows';

	let { row }: { row: ViewRow } = $props();

	const { arrivesBy, reachedFrom, unreachedSteps } = $derived(row);
	const isReachedAtAll = $derived(arrivesBy.length > 0 || reachedFrom.length > 0);
</script>

<span class="flex flex-col gap-0.5">
	{#each arrivesBy as way (way)}
		<span>Where a person arrives, by {way}</span>
	{/each}
	{#if reachedFrom.length > 0}
		<span>{reachedFrom.join(', ')}</span>
	{/if}
	{#if !isReachedAtAll}
		<span class="text-chalk-subtle">{journeySiteMapMessages.nothingLinksHere}</span>
	{/if}
	{#each unreachedSteps as step, index (index)}
		<span class="text-xs text-caution">{unreachedStepWords(step)}</span>
	{/each}
</span>
