<script lang="ts">
	import { planPayment } from '$lib/data/taxCalculator/paymentPlan';
	import { selfAssessmentOutcomes, type SelfAssessmentBill } from '$lib/data/taxCalculator/selfAssessmentBill';
	import { selfAssessmentRows } from '$lib/data/taxCalculator/selfAssessmentRows';
	import type { TaxYearRules } from '$lib/data/taxCalculator/taxRuleTypes';
	import BreakdownTable from './BreakdownTable.svelte';
	import PaymentTimeline from './PaymentTimeline.svelte';
	import WidgetIcon from './WidgetIcon.svelte';
	import { widgetCardClasses } from './calculatorStyles';
	import { formatMoney } from '$lib/data/taxCalculator/taxCalculatorFormatting';

	let { bill, rules, hasPayroll }: { bill: SelfAssessmentBill; rules: TaxYearRules; hasPayroll: boolean } = $props();

	const plan = $derived(planPayment(bill, rules.balancingPaymentDueOn, new Date()));
	const hasCis = $derived(bill.cisDeductions > 0);
</script>

<article class={`${widgetCardClasses} md:row-span-2`}>
	<WidgetIcon name="calendar" toneClasses="bg-caution/15 text-caution" />
	<h3 class="font-display text-xl font-medium">What you owe HMRC, and when</h3>
	{#if plan}
		<PaymentTimeline {plan} profit={bill.profit} />
	{:else if bill.outcome === selfAssessmentOutcomes.loss}
		<p class="text-chalk/75">
			A trading loss of <strong class="text-caution">{formatMoney(Math.abs(bill.profit))}</strong> means no income tax or
			Class 4 on the business this year{hasCis ? ', and the CIS taken from your payments should come back to you' : ''}.
		</p>
	{:else}
		<p class="text-chalk/75">
			{bill.balanceDue < 0 ? 'On these figures HMRC owes you money back.' : 'Nothing to pay through Self Assessment on these figures.'}
		</p>
	{/if}
	<BreakdownTable rows={selfAssessmentRows(bill, hasPayroll)} label="Self Assessment bill" />
	{#if hasCis}
		<p class="rounded-2xl bg-night/60 p-4 text-sm text-chalk/70">
			<strong class="text-chalk">For CIS subcontractors:</strong> most of your tax keeps being taken at source while you stay in
			CIS. Putting 5–10% of your gross income aside is a sensible buffer for the difference.
		</p>
	{/if}
</article>
