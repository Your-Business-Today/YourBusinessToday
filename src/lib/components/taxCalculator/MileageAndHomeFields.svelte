<script lang="ts">
	import FormField from '$lib/components/site/FormField.svelte';
	import type { TaxCalculatorForm } from '$lib/client/taxCalculatorForm.svelte';
	import { vehicleTypes } from '$lib/data/taxCalculator/takeHomeInputs';
	import { formatMiles } from '$lib/data/taxCalculator/taxCalculatorFormatting';
	import { fieldSelectClasses, helperTextClasses } from './calculatorStyles';
	import PeriodAmountField from './PeriodAmountField.svelte';

	let { form }: { form: TaxCalculatorForm } = $props();

	const vehicleOptions = [
		{ vehicleType: 'none', label: 'No business mileage' },
		{ vehicleType: 'carOrVan', label: 'Car or van' },
		{ vehicleType: 'motorcycle', label: 'Motorcycle' },
		{ vehicleType: 'bicycle', label: 'Bicycle' }
	] as const;

	const homeWorkingOptions = [
		{ band: 'under25Hours', label: 'Under 25 hours a month' },
		{ band: '25To50Hours', label: '25 to 50 hours a month' },
		{ band: '51To100Hours', label: '51 to 100 hours a month' },
		{ band: '101HoursOrMore', label: '101 hours or more a month' }
	] as const;
</script>

<div class="grid gap-5 sm:grid-cols-2">
	<FormField label="Business vehicle">
		<select bind:value={form.vehicleType} class={fieldSelectClasses}>
			{#each vehicleOptions as option (option.vehicleType)}
				<option value={option.vehicleType}>{option.label}</option>
			{/each}
		</select>
	</FormField>
	<FormField label="Working from home">
		<select bind:value={form.homeWorkingBand} class={fieldSelectClasses}>
			{#each homeWorkingOptions as option (option.band)}
				<option value={option.band}>{option.label}</option>
			{/each}
		</select>
	</FormField>
</div>
{#if form.vehicleType !== vehicleTypes.none}
	<PeriodAmountField id="business-miles" label="Business miles" helperText="Ordinary commuting to a regular workplace doesn’t count." periodAmount={form.businessMiles} formatAnnual={formatMiles} isCurrency={false} />
{/if}
<p class={helperTextClasses}>Mileage and working from home use HMRC’s simplified flat rates.</p>
