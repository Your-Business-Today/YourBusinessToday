<script lang="ts">
	import { scaleFor } from '$lib/data/taxCalculator/breakdownRow';
	import { effectiveTaxRate } from '$lib/data/taxCalculator/highIncomeSignals';
	import { resultPeriodOption, resultPeriods, type ResultPeriod } from '$lib/data/taxCalculator/resultPeriods';
	import type { TakeHomeEstimate } from '$lib/data/taxCalculator/takeHomeEstimate';
	import { takeHomeBreakdown } from '$lib/data/taxCalculator/takeHomeBreakdown';
	import { formatPercentage } from '$lib/data/taxCalculator/taxCalculatorFormatting';
	import BandsDisclosure from './BandsDisclosure.svelte';
	import BreakdownTable from './BreakdownTable.svelte';
	import EstimateExclusions from './EstimateExclusions.svelte';
	import QuarterlyViewNote from './QuarterlyViewNote.svelte';
	import { widgetCardClasses } from './calculatorStyles';

	let { estimate, period }: { estimate: TakeHomeEstimate; period: ResultPeriod } = $props();

	const effectiveRateFractionDigits = 1;
	const scale = $derived(scaleFor(resultPeriodOption(period).periodsPerYear));
	const periodAdjective = $derived(period === 'yearly' ? 'annual' : period);
	const rate = $derived(effectiveTaxRate(estimate));
	const rules = $derived(estimate.rules);
</script>

<article class={widgetCardClasses}>
	<div class="flex items-center justify-between gap-3">
		<h3 class="font-display text-xl font-medium">Your {periodAdjective} breakdown</h3>
		<span class="rounded-md border border-hairline px-2 py-1 font-mono text-xs text-chalk/60">{estimate.taxYear}</span>
	</div>
	{#if period === resultPeriods.quarterly}<QuarterlyViewNote dueOn={rules.balancingPaymentDueOn} />{/if}
	<BreakdownTable rows={takeHomeBreakdown(estimate, scale)} label={`Your ${periodAdjective} breakdown`} />
	{#if rate !== null}
		<p class="rounded-2xl bg-night/50 px-4 py-3 text-sm text-chalk/70">
			Your effective tax rate is <strong class="text-chalk">{formatPercentage(rate, effectiveRateFractionDigits)}</strong>
			— income tax and National Insurance as a share of what you earn.
		</p>
	{/if}
	<BandsDisclosure {estimate} {scale} />
	<EstimateExclusions />
</article>
