<script lang="ts">
	import type { SavedComparison } from '$lib/client/savedComparisons.svelte';
	import { monthsPerYear } from '$lib/data/taxCalculator/resultPeriods';
	import { formatMoney, signed } from '$lib/data/taxCalculator/taxCalculatorFormatting';

	let {
		comparison,
		currentTakeHome,
		onLoad,
		onRemove
	}: {
		comparison: SavedComparison;
		currentTakeHome: number | null;
		onLoad: () => void;
		onRemove: () => void;
	} = $props();

	const smallestVisibleDifference = 0.01;
	const monthlyDifference = $derived(
		currentTakeHome === null ? null : (comparison.takeHome - currentTakeHome) / monthsPerYear
	);
	const figures = $derived([
		{ label: 'Earnings', amount: comparison.grossEarnings },
		{ label: 'Income tax', amount: comparison.incomeTax },
		{ label: 'National Insurance', amount: comparison.nationalInsurance },
		{ label: 'Student loan', amount: comparison.studentLoan },
		{ label: 'Pension', amount: comparison.pension }
	].filter((figure) => figure.amount > 0));
</script>

<article class="flex min-w-0 flex-col gap-4 rounded-3xl border border-hairline bg-carriage p-6">
	<p class="text-sm text-chalk/65">{comparison.label}</p>
	<p class="font-display text-3xl font-medium">{formatMoney(comparison.takeHome / monthsPerYear)}<span class="ml-1 text-sm text-chalk/50">/ month</span></p>
	{#if monthlyDifference !== null && Math.abs(monthlyDifference) >= smallestVisibleDifference}
		<p class={`text-sm ${monthlyDifference > 0 ? 'text-go' : 'text-caution'}`}>{signed(monthlyDifference)} a month vs. your current estimate</p>
	{:else if monthlyDifference !== null}
		<p class="text-sm text-chalk/55">Matches your current estimate</p>
	{/if}
	<dl class="flex flex-col gap-2 text-sm">
		{#each figures as figure (figure.label)}
			<div class="flex justify-between gap-3 border-b border-hairline/70 pb-2">
				<dt class="text-chalk/60">{figure.label} a year</dt>
				<dd class="font-mono">{formatMoney(figure.amount)}</dd>
			</div>
		{/each}
	</dl>
	<div class="mt-auto flex gap-2">
		<button type="button" onclick={onLoad} class="min-h-11 flex-1 rounded-full bg-signal px-4 font-display text-sm font-medium text-night transition hover:brightness-110">Load these numbers</button>
		<button type="button" onclick={onRemove} class="min-h-11 rounded-full border border-hairline px-4 text-sm text-chalk/70 transition hover:border-caution hover:text-caution" aria-label={`Remove ${comparison.label}`}>Remove</button>
	</div>
</article>
