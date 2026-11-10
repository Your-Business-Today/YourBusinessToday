<script lang="ts">
	import type { TradingRouteChoices } from '$lib/client/tradingRouteChoices.svelte';
	import type { TakeHomeEstimate } from '$lib/data/taxCalculator/takeHomeEstimate';
	import { formatWholePounds } from '$lib/data/taxCalculator/taxCalculatorFormatting';
	import CompanyPayFields from './CompanyPayFields.svelte';
	import CompanyWorkingDisclosure from './CompanyWorkingDisclosure.svelte';
	import TradingRouteNotes from './TradingRouteNotes.svelte';
	import TradingRouteTiles from './TradingRouteTiles.svelte';
	import { widgetCardClasses } from './calculatorStyles';

	let { estimate, choices }: { estimate: TakeHomeEstimate; choices: TradingRouteChoices } = $props();

	const comparison = $derived(choices.comparisonFor(estimate));
	const company = $derived(comparison.limitedCompany);
</script>

<article class={`${widgetCardClasses} md:col-span-2`} aria-labelledby="trading-routes-heading">
	<p class="font-mono text-[11px] tracking-[0.2em] text-chalk/55 uppercase">Same income, three ways</p>
	<h3 id="trading-routes-heading" class="font-display text-2xl leading-tight font-medium sm:text-3xl">
		Employed, sole trader or limited company?
	</h3>
	<p class="text-sm text-chalk/60">
		{formatWholePounds(estimate.grossEarnings)} a year before tax, worked out three ways for {estimate.taxYear}: as a salary,
		as a sole trader’s profit, and as company income paid out as a director’s salary and dividends.
	</p>
	<TradingRouteTiles {comparison} />
	<CompanyPayFields {choices} {comparison} />
	{#if company}<CompanyWorkingDisclosure {company} rules={comparison.rules} />{/if}
	<TradingRouteNotes />
</article>
