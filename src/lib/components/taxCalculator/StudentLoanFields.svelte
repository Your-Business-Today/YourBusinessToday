<script lang="ts">
	import type { TaxCalculatorForm } from '$lib/client/taxCalculatorForm.svelte';
	import { undergraduatePlanNames } from '$lib/data/taxCalculator/studentLoans';
	import type { UndergraduateLoanPlan } from '$lib/data/taxCalculator/taxRuleTypes';
	import { fieldLabelClasses, fieldSelectClasses, helperTextClasses } from './calculatorStyles';

	let { form }: { form: TaxCalculatorForm } = $props();

	const planNames = Object.entries(undergraduatePlanNames) as [UndergraduateLoanPlan, string][];
</script>

<div class="flex flex-col gap-2">
	<label for="student-loan-plan" class={fieldLabelClasses}>Student loan</label>
	<p class={helperTextClasses}>Not sure of your plan? It’s on your Student Loans Company account.</p>
	<select id="student-loan-plan" bind:value={form.undergraduatePlan} class={fieldSelectClasses}>
		<option value={null}>No undergraduate loan</option>
		{#each planNames as [plan, planName] (plan)}
			<option value={plan}>{planName}</option>
		{/each}
	</select>
	<label class="mt-1 flex min-h-11 cursor-pointer items-center gap-3 text-sm text-chalk/80">
		<input type="checkbox" bind:checked={form.hasPostgraduateLoan} class="size-5 accent-signal" />
		I also have a Postgraduate Loan
	</label>
</div>
