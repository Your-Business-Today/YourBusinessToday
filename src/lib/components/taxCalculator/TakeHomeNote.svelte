<script lang="ts">
	import { planPayment } from '$lib/data/taxCalculator/paymentPlan';
	import { selfAssessmentOutcomes } from '$lib/data/taxCalculator/selfAssessmentBill';
	import type { TakeHomeEstimate } from '$lib/data/taxCalculator/takeHomeEstimate';
	import { formatLongDate } from '$lib/data/taxCalculator/taxDates';
	import { formatMoney } from '$lib/data/taxCalculator/taxCalculatorFormatting';

	let { estimate }: { estimate: TakeHomeEstimate } = $props();

	const bill = $derived(estimate.selfAssessment);
	const rules = $derived(estimate.rules);
	const plan = $derived(bill ? planPayment(bill, rules.balancingPaymentDueOn, new Date()) : null);
</script>

<div class="flex items-start gap-3 rounded-2xl border border-chalk/10 bg-night/30 p-4 text-sm text-chalk/75">
	<span class="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-go/20 text-xs text-go" aria-hidden="true">✓</span>
	<p>
		{#if bill?.outcome === selfAssessmentOutcomes.loss}
			Your business made a loss of <strong class="text-chalk">{formatMoney(Math.abs(bill.profit))}</strong>.
			{#if bill.cisDeductions > 0}
				The <strong class="text-chalk">{formatMoney(bill.cisDeductions)}</strong> of CIS taken from your payments
				is normally refunded after your Self Assessment return.
			{/if}
		{:else if plan}
			<strong class="text-chalk">{formatMoney(plan.amountDue)}</strong> of this goes to HMRC by
			{formatLongDate(plan.dueOn)}. Put <strong class="text-chalk">{formatMoney(plan.monthlySetAside)} a month</strong>
			aside and it’s covered.
		{:else if bill && bill.balanceDue < 0}
			You should get about <strong class="text-chalk">{formatMoney(Math.abs(bill.balanceDue))}</strong> back from HMRC
			after your Self Assessment return.
		{:else if bill}
			Nothing more to pay through Self Assessment on these figures.
		{:else}
			Your employer normally takes care of income tax and National Insurance through PAYE.
		{/if}
	</p>
</div>
