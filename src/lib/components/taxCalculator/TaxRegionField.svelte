<script lang="ts">
	import type { TaxCalculatorForm } from '$lib/client/taxCalculatorForm.svelte';
	import { taxRegions, type TaxRegion } from '$lib/data/taxCalculator/taxRuleTypes';
	import { fieldLabelClasses, fieldSelectClasses, helperTextClasses } from './calculatorStyles';

	let { form }: { form: TaxCalculatorForm } = $props();

	const regionOptions: { region: TaxRegion; label: string }[] = [
		{ region: 'restOfUk', label: 'England, Wales or Northern Ireland' },
		{ region: 'scotland', label: 'Scotland' }
	];
</script>

<div class="flex flex-col gap-2">
	<label for="tax-region" class={fieldLabelClasses}>Where do you pay tax?</label>
	<select id="tax-region" bind:value={form.taxRegion} class={fieldSelectClasses}>
		{#each regionOptions as option (option.region)}
			<option value={option.region}>{option.label}</option>
		{/each}
	</select>
	{#if form.taxRegion === taxRegions.scotland}
		<p class={helperTextClasses}>Scottish income tax bands apply. National Insurance is the same across the UK.</p>
	{/if}
</div>
