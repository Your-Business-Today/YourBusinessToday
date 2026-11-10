<script lang="ts">
	import type { MakingTaxDigitalPosition } from '$lib/data/taxCalculator/makingTaxDigitalPosition';
	import { earliestMakingTaxDigitalRules } from '$lib/data/taxCalculator/sharedRules';
	import { formatLongDate } from '$lib/data/taxCalculator/taxDates';
	import type { TaxYearName } from '$lib/data/taxCalculator/taxRuleTypes';
	import { formatWholePounds } from '$lib/data/taxCalculator/taxCalculatorFormatting';
	import QuarterlyDeadlines from './QuarterlyDeadlines.svelte';
	import WidgetIcon from './WidgetIcon.svelte';
	import { widgetCardClasses } from './calculatorStyles';

	let { position, taxYear }: { position: MakingTaxDigitalPosition; taxYear: TaxYearName } = $props();

	const earliest = earliestMakingTaxDigitalRules;
	const isInScope = $derived(position.isBroughtInByThisIncome || position.isOverEarliestThreshold);
</script>

<article class={widgetCardClasses}>
	<WidgetIcon name="digital" toneClasses="bg-sky/15 text-sky" />
	<h3 class="font-display text-xl font-medium">Making Tax Digital</h3>
	<p class="text-sm text-chalk/70">
		{#if position.isBroughtInByThisIncome}
			Self-employed income over {formatWholePounds(position.qualifyingIncomeThreshold)} in {taxYear} brings you in from
			<strong class="text-chalk">{formatLongDate(position.appliesFrom)}</strong>: digital records and a short quarterly update to HMRC.
		{:else}
			{taxYear} on its own doesn’t bring you in — that takes more than {formatWholePounds(position.qualifyingIncomeThreshold)}.
		{/if}
		If your 2024/25 income was over {formatWholePounds(earliest.qualifyingIncomeThreshold)}, it has applied since
		{formatLongDate(earliest.appliesFrom)}.
	</p>
	{#if isInScope}
		<ul class="flex list-disc flex-col gap-1 pl-5 text-sm text-chalk/70">
			<li>Keep digital records of business income and expenses</li>
			<li>Send four quarterly updates a year from compatible software</li>
			<li>Send a final declaration by 31 January after the tax year</li>
		</ul>
		<QuarterlyDeadlines />
		<p class="text-xs text-chalk/55">
			Updates are summaries, not payments. Your Business Today keeps the digital records for you —
			<a href="/contact" class="text-chalk underline underline-offset-4 hover:text-signal">talk to us</a>.
		</p>
	{/if}
</article>
