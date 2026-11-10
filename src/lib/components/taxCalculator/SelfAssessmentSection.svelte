<script lang="ts">
	import { class2PositionFor } from '$lib/data/taxCalculator/class2Position';
	import { makingTaxDigitalPositionFor } from '$lib/data/taxCalculator/makingTaxDigitalPosition';
	import { paymentsOnAccountFor } from '$lib/data/taxCalculator/paymentsOnAccount';
	import type { SelfAssessmentBill } from '$lib/data/taxCalculator/selfAssessmentBill';
	import type { TakeHomeEstimate } from '$lib/data/taxCalculator/takeHomeEstimate';
	import Class2Card from './Class2Card.svelte';
	import MakingTaxDigitalCard from './MakingTaxDigitalCard.svelte';
	import PaymentsOnAccountCard from './PaymentsOnAccountCard.svelte';
	import SectionHeading from './SectionHeading.svelte';
	import SelfAssessmentBillCard from './SelfAssessmentBillCard.svelte';

	let {
		stepNumber,
		estimate,
		bill
	}: { stepNumber: number; estimate: TakeHomeEstimate; bill: SelfAssessmentBill } = $props();

	const rules = $derived(estimate.rules);
	const paymentsOnAccount = $derived(paymentsOnAccountFor(bill, rules));
	const { selfEmployment, employment } = $derived(estimate);
	const selfEmploymentIncome = $derived(selfEmployment?.income ?? 0);
	const hasPayroll = $derived(employment.grossPay > 0);
</script>

<section class="flex flex-col gap-6" aria-labelledby="self-assessment-heading">
	<SectionHeading {stepNumber} eyebrow="For the self-employed" heading="Your Self Assessment, sorted." id="self-assessment-heading" />
	<div class="grid gap-5 md:grid-cols-2">
		<SelfAssessmentBillCard {bill} {rules} {hasPayroll} />
		{#if paymentsOnAccount}<PaymentsOnAccountCard payments={paymentsOnAccount} />{/if}
		<MakingTaxDigitalCard position={makingTaxDigitalPositionFor(selfEmploymentIncome, rules.makingTaxDigital)} taxYear={rules.taxYear} />
		<Class2Card position={class2PositionFor(bill, rules.nationalInsurance)} rules={rules.nationalInsurance} taxYear={rules.taxYear} />
	</div>
</section>
