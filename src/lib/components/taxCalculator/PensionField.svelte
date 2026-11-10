<script lang="ts">
	import type { TaxCalculatorForm } from '$lib/client/taxCalculatorForm.svelte';
	import { fieldControlClasses, fieldLabelClasses, helperTextClasses } from './calculatorStyles';

	let { form }: { form: TaxCalculatorForm } = $props();

	const explanation = $derived(
		form.isEmployed
			? 'The share of your pay going into a workplace pension. It comes off before income tax.'
			: 'The share of your profit you pay into a personal pension. The government tops it up with tax relief.'
	);
</script>

<div class="flex flex-col gap-2">
	<label for="pension-percentage" class={fieldLabelClasses}>
		Pension contribution — % of {form.isEmployed ? 'salary' : 'profit'}
	</label>
	<p class={helperTextClasses}>{explanation}</p>
	<div class="relative max-w-40">
		<input id="pension-percentage" type="number" min="0" max="100" step="0.5" inputmode="decimal" placeholder="0" bind:value={form.pensionPercentage} class={`${fieldControlClasses} w-full pr-9 pl-4`} />
		<span class="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-chalk/50" aria-hidden="true">%</span>
	</div>
</div>
