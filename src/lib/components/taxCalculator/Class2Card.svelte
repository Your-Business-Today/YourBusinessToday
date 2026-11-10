<script lang="ts">
	import { class2Positions, type Class2Position } from '$lib/data/taxCalculator/class2Position';
	import type { NationalInsuranceRules, TaxYearName } from '$lib/data/taxCalculator/taxRuleTypes';
	import { formatMoney, formatWholePounds } from '$lib/data/taxCalculator/taxCalculatorFormatting';
	import WidgetIcon from './WidgetIcon.svelte';
	import { widgetCardClasses } from './calculatorStyles';

	let {
		position,
		rules,
		taxYear
	}: { position: Class2Position; rules: NationalInsuranceRules; taxYear: TaxYearName } = $props();

	const threshold = $derived(formatWholePounds(rules.smallProfitsThreshold));
</script>

<article class={widgetCardClasses}>
	<WidgetIcon name="shield" />
	<h3 class="font-display text-xl font-medium">Your State Pension record</h3>
	{#if position === class2Positions.creditedAutomatically}
		<p class="text-sm text-chalk/70">
			Nothing to pay. Profit of {threshold} or more earns National Insurance credits towards your State Pension
			automatically.
		</p>
	{:else}
		<p class="text-sm text-chalk/70">
			{position === 'tradingLoss' ? 'With a trading loss' : `With profit under ${threshold}`} you won’t get credits
			automatically. You can choose to pay voluntary Class 2 at {formatMoney(rules.class2WeeklyRate)} a week for
			{taxYear}. Check your National Insurance record first — it may already be full.
		</p>
	{/if}
</article>
