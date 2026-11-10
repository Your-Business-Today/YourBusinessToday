<script lang="ts">
	import type { TaxCalculatorForm } from '$lib/client/taxCalculatorForm.svelte';
	import BigAmountField from './BigAmountField.svelte';
	import EarningTypeTiles from './EarningTypeTiles.svelte';
	import MoreAccurateOptions from './MoreAccurateOptions.svelte';
	import SelfEmploymentFields from './SelfEmploymentFields.svelte';
	import TaxRegionField from './TaxRegionField.svelte';
	import { widgetCardClasses } from './calculatorStyles';

	let { form }: { form: TaxCalculatorForm } = $props();

	const salarySliderMaximum = 150000;
</script>

<form class={`${widgetCardClasses} gap-7`} onsubmit={(event) => event.preventDefault()} novalidate>
	<div class="flex flex-wrap items-baseline justify-between gap-2">
		<h2 class="font-display text-xl font-medium sm:text-2xl">How do you earn?</h2>
		<p class="text-xs text-chalk/50">No sign-up. Just answers.</p>
	</div>
	<EarningTypeTiles {form} />
	{#if form.isEmployed}
		<BigAmountField
			id="salary"
			label="What’s your salary?"
			helperText="Your full salary before pension or other deductions. Type any amount above the slider’s range."
			suffix="before tax"
			periodAmount={form.salary}
			sliderMaximum={salarySliderMaximum}
		/>
	{/if}
	{#if form.isSelfEmployed}
		<SelfEmploymentFields {form} />
	{/if}
	<TaxRegionField {form} />
	<MoreAccurateOptions {form} />
</form>
