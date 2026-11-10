<script lang="ts">
	import type { Snippet } from 'svelte';
	import { shareKept } from '$lib/data/taxCalculator/highIncomeSignals';
	import { perPeriod, resultPeriodOption, type ResultPeriod } from '$lib/data/taxCalculator/resultPeriods';
	import type { TakeHomeEstimate } from '$lib/data/taxCalculator/takeHomeEstimate';
	import { takeHomeSegments } from '$lib/data/taxCalculator/takeHomeSegments';
	import { splitIntoPoundsAndPence } from '$lib/data/taxCalculator/taxCalculatorFormatting';
	import ResultPeriodToggle from './ResultPeriodToggle.svelte';
	import SegmentLegend from './SegmentLegend.svelte';
	import TakeHomeDonut from './TakeHomeDonut.svelte';
	import TakeHomeNote from './TakeHomeNote.svelte';

	let {
		estimate,
		period = $bindable(),
		actions
	}: { estimate: TakeHomeEstimate; period: ResultPeriod; actions: Snippet } = $props();

	const isLoss = $derived(estimate.takeHome < 0);
	const amount = $derived(splitIntoPoundsAndPence(perPeriod(Math.abs(estimate.takeHome), period)));
	const segments = $derived(takeHomeSegments(estimate));
</script>

<div class="@container flex flex-col gap-6">
	<div class="flex flex-col gap-2">
		<p class={`font-display text-6xl leading-none font-medium tracking-tight sm:text-7xl ${isLoss ? 'text-caution' : 'text-chalk'}`}>
			{amount.pounds}<span class="text-3xl text-chalk/55 sm:text-4xl">{amount.pence}</span>
		</p>
		<p class="text-sm text-chalk/65">
			{isLoss ? 'lost' : 'in your pocket'} every {resultPeriodOption(period).noun}
		</p>
	</div>
	<div><ResultPeriodToggle bind:period isSelfEmployed={estimate.selfEmployment !== null} /></div>
	<hr class="border-chalk/10" />
	{#if !isLoss}
		<div class="flex flex-col items-center gap-6 @sm:flex-row">
			<TakeHomeDonut {segments} shareKept={shareKept(estimate)} />
			<SegmentLegend {segments} {period} />
		</div>
	{/if}
	<TakeHomeNote {estimate} />
	{@render actions()}
</div>
