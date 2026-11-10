<script lang="ts">
	import type { SavedComparison } from '$lib/client/savedComparisons.svelte';
	import ComparisonCard from './ComparisonCard.svelte';
	import SectionHeading from './SectionHeading.svelte';

	let {
		stepNumber,
		comparisons,
		currentTakeHome,
		onLoad,
		onRemove
	}: {
		stepNumber: number;
		comparisons: SavedComparison[];
		currentTakeHome: number | null;
		onLoad: (comparison: SavedComparison) => void;
		onRemove: (comparison: SavedComparison) => void;
	} = $props();
</script>

<section id="my-comparisons" class="flex scroll-mt-16 flex-col gap-6" aria-labelledby="comparisons-heading">
	<SectionHeading {stepNumber} eyebrow="My comparisons" heading="Line up your options." id="comparisons-heading" />
	{#if comparisons.length === 0}
		<div class="rounded-3xl border-2 border-dashed border-hairline p-10 text-center text-chalk/60">
			<p class="font-display text-lg text-chalk">Nothing saved yet</p>
			<p class="mx-auto mt-2 max-w-md text-sm">
				Try a job offer, a pay rise or going self-employed, then press “Save comparison” on your estimate to see
				them side by side. They stay on this device only.
			</p>
		</div>
	{:else}
		<div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
			{#each comparisons as comparison (comparison.id)}
				<ComparisonCard {comparison} {currentTakeHome} onLoad={() => onLoad(comparison)} onRemove={() => onRemove(comparison)} />
			{/each}
		</div>
	{/if}
</section>
