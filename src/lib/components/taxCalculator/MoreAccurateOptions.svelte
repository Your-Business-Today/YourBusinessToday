<script lang="ts">
	import type { TaxCalculatorForm } from '$lib/client/taxCalculatorForm.svelte';
	import { formatMoney } from '$lib/data/taxCalculator/taxCalculatorFormatting';
	import { disclosureSummaryClasses } from './calculatorStyles';
	import DisclosureMarker from './DisclosureMarker.svelte';
	import MileageAndHomeFields from './MileageAndHomeFields.svelte';
	import PensionField from './PensionField.svelte';
	import PeriodAmountField from './PeriodAmountField.svelte';
	import StudentLoanFields from './StudentLoanFields.svelte';

	let { form }: { form: TaxCalculatorForm } = $props();
</script>

<details class="group rounded-2xl border border-hairline bg-night/30 px-5 py-4">
	<summary class={disclosureSummaryClasses}>
		<span class="flex flex-col gap-0.5">
			<span>Make it more accurate</span>
			<span class="text-xs font-normal text-chalk/55">Pension, student loan{form.isEmployed ? ', bonus' : ''}{form.isSelfEmployed ? ', mileage, working from home' : ''}</span>
		</span>
		<DisclosureMarker />
	</summary>
	<div class="mt-5 flex flex-col gap-5">
		<PensionField {form} />
		<StudentLoanFields {form} />
		{#if form.isEmployed}
			<PeriodAmountField id="bonus" label="Bonus or overtime" helperText="Anything paid on top of your salary this tax year." periodAmount={form.bonus} formatAnnual={formatMoney} />
		{/if}
		{#if form.isSelfEmployed}
			<MileageAndHomeFields {form} />
		{/if}
	</div>
</details>
