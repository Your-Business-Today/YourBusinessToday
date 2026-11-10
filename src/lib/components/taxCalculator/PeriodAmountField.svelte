<script lang="ts">
	import type { PeriodAmount } from '$lib/client/periodAmount.svelte';
	import { amountPeriodOptions, amountPeriods } from '$lib/data/taxCalculator/amountPeriods';
	import { fieldControlClasses, fieldLabelClasses, helperTextClasses } from './calculatorStyles';

	let {
		id,
		label,
		helperText,
		periodAmount,
		formatAnnual,
		isCurrency = true
	}: {
		id: string;
		label: string;
		helperText?: string;
		periodAmount: PeriodAmount;
		formatAnnual: (annualAmount: number) => string;
		isCurrency?: boolean;
	} = $props();

	const errorId = $derived(`${id}-error`);
	const isShowingAnnualEquivalent = $derived(periodAmount.period !== amountPeriods.annual && periodAmount.hasAmount);
</script>

<div class="flex min-w-0 flex-col gap-2">
	<label for={id} class={fieldLabelClasses}>{label}</label>
	{#if helperText}<p class={helperTextClasses}>{helperText}</p>{/if}
	<div class="flex gap-2">
		<div class="relative min-w-0 flex-1">
			{#if isCurrency}
				<span class="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-chalk/50" aria-hidden="true">£</span>
			{/if}
			<input
				{id}
				type="number"
				min="0"
				step={isCurrency ? '0.01' : '1'}
				inputmode={isCurrency ? 'decimal' : 'numeric'}
				placeholder="0"
				bind:value={periodAmount.amount}
				aria-invalid={periodAmount.errorMessage !== null}
				aria-describedby={periodAmount.errorMessage ? errorId : undefined}
				class={`${fieldControlClasses} w-full ${isCurrency ? 'pr-4 pl-8' : 'px-4'}`}
			/>
		</div>
		<select bind:value={periodAmount.period} aria-label={`${label} — how often`} class={`${fieldControlClasses} w-32 shrink-0 px-3 sm:w-36`}>
			{#each amountPeriodOptions as option (option.period)}
				<option value={option.period}>{option.label}</option>
			{/each}
		</select>
	</div>
	{#if isShowingAnnualEquivalent}
		<p class="font-mono text-xs text-go">= {formatAnnual(periodAmount.annualAmount)} a year</p>
	{/if}
	{#if periodAmount.errorMessage}
		<p id={errorId} class="text-sm text-caution">⚠ {periodAmount.errorMessage}</p>
	{/if}
</div>
