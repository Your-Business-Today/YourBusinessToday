<script lang="ts">
	import FormField from '$lib/components/site/FormField.svelte';
	import type { TaxCalculatorForm } from '$lib/client/taxCalculatorForm.svelte';
	import { undergraduatePlanNames } from '$lib/data/taxCalculator/studentLoans';
	import type { UndergraduateLoanPlan } from '$lib/data/taxCalculator/taxRuleTypes';
	import { fieldSelectClasses, helperTextClasses } from './calculatorStyles';

	let { form }: { form: TaxCalculatorForm } = $props();

	const planNames = Object.entries(undergraduatePlanNames) as [UndergraduateLoanPlan, string][];
</script>

<div class="flex flex-col gap-2">
	<FormField label="Student loan">
		<span class={helperTextClasses}>Not sure of your plan? It’s on your Student Loans Company account.</span>
		<select bind:value={form.undergraduatePlan} class={fieldSelectClasses}>
			<option value={null}>No undergraduate loan</option>
			{#each planNames as [plan, planName] (plan)}
				<option value={plan}>{planName}</option>
			{/each}
		</select>
	</FormField>
	<label class="mt-1 flex min-h-11 cursor-pointer items-center gap-3 text-sm text-chalk/80">
		<input type="checkbox" bind:checked={form.hasPostgraduateLoan} class="size-5 accent-signal" />
		I also have a Postgraduate Loan
	</label>
</div>
