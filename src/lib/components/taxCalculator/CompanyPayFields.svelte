<script lang="ts">
	import type { TradingRouteChoices } from '$lib/client/tradingRouteChoices.svelte';
	import FormField from '$lib/components/site/FormField.svelte';
	import { formatWholePounds } from '$lib/data/taxCalculator/taxCalculatorFormatting';
	import type { TradingRouteComparison } from '$lib/data/taxCalculator/tradingRoutes';
	import { fieldControlClasses, helperTextClasses } from './calculatorStyles';

	let { choices, comparison }: { choices: TradingRouteChoices; comparison: TradingRouteComparison } = $props();

	const suggestedSalary = $derived(comparison.suggestedDirectorSalary);
	const hasFieldError = $derived(choices.directorSalaryError !== null || choices.runningCostsError !== null);
	const isUnpayable = $derived(comparison.limitedCompany === null && !hasFieldError);
	const amountClasses = `${fieldControlClasses} w-full px-4`;
</script>

<div class="grid gap-4 sm:grid-cols-2">
	<div class="flex flex-col gap-2">
		<FormField label="Director salary a year">
			<input
				type="number"
				min="0"
				step="1"
				inputmode="numeric"
				placeholder={String(suggestedSalary)}
				bind:value={choices.directorSalary}
				aria-invalid={choices.directorSalaryError !== null || isUnpayable}
				class={amountClasses}
			/>
		</FormField>
		<p class={helperTextClasses}>
			Suggested: {formatWholePounds(suggestedSalary)}, the most that stays free of income tax and employee National
			Insurance. Leave it empty to use the suggestion.
		</p>
		{#if choices.directorSalaryError}<p class="text-sm text-caution">⚠ {choices.directorSalaryError}</p>{/if}
		{#if isUnpayable}<p class="text-sm text-caution">⚠ The company can’t pay that salary and its employer National Insurance from this income.</p>{/if}
	</div>
	<div class="flex flex-col gap-2">
		<FormField label="Extra company running costs a year">
			<input
				type="number"
				min="0"
				step="1"
				inputmode="numeric"
				placeholder="0"
				bind:value={choices.companyRunningCosts}
				aria-invalid={choices.runningCostsError !== null}
				class={amountClasses}
			/>
		</FormField>
		<p class={helperTextClasses}>
			An accountant, the confirmation statement, a business bank account: what a company costs that a sole trader
			doesn’t pay.
		</p>
		{#if choices.runningCostsError}<p class="text-sm text-caution">⚠ {choices.runningCostsError}</p>{/if}
	</div>
</div>
