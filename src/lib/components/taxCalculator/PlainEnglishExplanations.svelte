<script lang="ts">
	import type { TaxYearRules } from '$lib/data/taxCalculator/taxRuleTypes';
	import { formatPercentage, formatWholePounds } from '$lib/data/taxCalculator/taxCalculatorFormatting';
	import { tradingAllowanceRules } from '$lib/data/taxCalculator/sharedRules';
	import DisclosureMarker from './DisclosureMarker.svelte';
	import { disclosureClasses, disclosureSummaryClasses } from './calculatorStyles';

	let { rules }: { rules: TaxYearRules } = $props();

	const nationalInsurance = $derived(rules.nationalInsurance);
	const { class1, class4 } = $derived(nationalInsurance);
	const explanations = $derived([
		{ question: 'What’s the cash basis?', answer: 'You count income when the money arrives and expenses when you pay them — not when an invoice is sent. It’s the default for most sole traders and subcontractors.' },
		{ question: 'How is mileage worked out?', answer: 'With HMRC’s simplified rates: a flat amount per business mile covering fuel, repairs, insurance and wear, claimed instead of your actual vehicle costs.' },
		{ question: 'What’s the trading allowance?', answer: `Up to ${formatWholePounds(tradingAllowanceRules.allowance)} of self-employed income is tax-free. You can use it instead of your expenses, not as well — we pick whichever is better for you.` },
		{ question: 'What’s Class 1 National Insurance?', answer: `What employees pay through PAYE: ${formatPercentage(class1.mainRate)} on pay between ${formatWholePounds(class1.lowerLimit)} and ${formatWholePounds(class1.upperLimit)}, then ${formatPercentage(class1.additionalRate)} above.` },
		{ question: 'What’s Class 4 National Insurance?', answer: `What the self-employed pay on profits: ${formatPercentage(class4.mainRate)} between ${formatWholePounds(class4.lowerLimit)} and ${formatWholePounds(class4.upperLimit)}, then ${formatPercentage(class4.additionalRate)} above. It’s paid through Self Assessment with your income tax.` },
		{ question: 'How does pension tax relief work here?', answer: 'Workplace pensions come off your pay before income tax. For a personal pension you pay 80% and the government adds 20%; higher-rate relief comes back through Self Assessment.' }
	]);
</script>

<div class="flex flex-col gap-3">
	<h3 class="font-display text-xl font-medium">In plain English</h3>
	<div class="grid gap-3 md:grid-cols-2">
		{#each explanations as explanation (explanation.question)}
			<details class={`${disclosureClasses} self-start`}>
				<summary class={disclosureSummaryClasses}>{explanation.question} <DisclosureMarker /></summary>
				<p class="mt-3 text-chalk/70">{explanation.answer}</p>
			</details>
		{/each}
	</div>
</div>
