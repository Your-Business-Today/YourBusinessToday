<script lang="ts">
	import Badge from '$lib/components/site/Badge.svelte';
	import { extraLabelOf, tallyLabelOf } from './contentPlanPageWords';
	import type { RhythmTally } from '$lib/brand/plan/planRhythm';

	let { tallies }: { tallies: RhythmTally[] } = $props();

	const noneExtra = 0;
</script>

<ul class="flex flex-wrap items-center gap-2" aria-label="Posts against the rhythm">
	{#each tallies as tally (tally.mediumPath)}
		<li><Badge label={tallyLabelOf(tally)} tone={tally.isShort ? 'warning' : 'positive'} hasDot /></li>
		{#if tally.extra !== noneExtra}
			<li><Badge label={extraLabelOf(tally)} /></li>
		{/if}
	{/each}
</ul>
