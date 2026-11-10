<script lang="ts">
	import type { PeriodAmount } from '$lib/client/periodAmount.svelte';
	import { amountPeriodOptions, amountPeriods } from '$lib/data/taxCalculator/amountPeriods';
	import { formatMoney, formatWholePounds } from '$lib/data/taxCalculator/taxCalculatorFormatting';
	import { fieldLabelClasses, helperTextClasses } from './calculatorStyles';

	let {
		id,
		label,
		helperText,
		suffix,
		periodAmount,
		sliderMaximum
	}: {
		id: string;
		label: string;
		helperText: string;
		suffix: string;
		periodAmount: PeriodAmount;
		sliderMaximum: number;
	} = $props();

	const sliderStep = 500;
	const sliderValue = $derived(Math.min(periodAmount.annualAmount, sliderMaximum));
	const errorId = $derived(`${id}-error`);

	function setAnnualAmountFromSlider(event: Event & { currentTarget: HTMLInputElement }): void {
		const slider = event.currentTarget;
		periodAmount.setAnnualAmount(Number(slider.value));
	}
</script>

<div class="flex flex-col gap-3">
	<div class="flex items-center justify-between gap-3">
		<label for={id} class={fieldLabelClasses}>{label}</label>
		<select bind:value={periodAmount.period} aria-label={`${label} — how often`} class="rounded-full bg-transparent px-2 py-1 text-sm text-chalk/70 outline-none focus:text-chalk">
			{#each amountPeriodOptions as option (option.period)}
				<option value={option.period} class="bg-carriage">{option.label}</option>
			{/each}
		</select>
	</div>
	<div class="flex items-center gap-3 rounded-2xl border border-hairline bg-night/70 px-5 transition focus-within:border-go">
		<span class="font-display text-2xl text-chalk/50" aria-hidden="true">£</span>
		<input
			{id}
			type="number"
			min="0"
			step="0.01"
			inputmode="decimal"
			placeholder="0"
			bind:value={periodAmount.amount}
			aria-invalid={periodAmount.errorMessage !== null}
			aria-describedby={periodAmount.errorMessage ? errorId : undefined}
			class="min-h-16 w-full min-w-0 bg-transparent font-display text-3xl font-medium text-chalk outline-none sm:text-4xl"
		/>
		<span class="hidden shrink-0 text-xs text-chalk/50 sm:block">{suffix}</span>
	</div>
	<input
		type="range"
		min="0"
		max={sliderMaximum}
		step={sliderStep}
		value={sliderValue}
		oninput={setAnnualAmountFromSlider}
		aria-label={`${label} per year`}
		class="w-full cursor-pointer accent-signal"
	/>
	<div class="flex justify-between font-mono text-[11px] text-chalk/45">
		<span>£0</span><span>{formatWholePounds(sliderMaximum / 2)}</span><span>{formatWholePounds(sliderMaximum)}+</span>
	</div>
	{#if periodAmount.period !== amountPeriods.annual && periodAmount.hasAmount}
		<p class="font-mono text-xs text-go">= {formatMoney(periodAmount.annualAmount)} a year</p>
	{/if}
	<p class={helperTextClasses}>{helperText}</p>
	{#if periodAmount.errorMessage}
		<p id={errorId} class="text-sm text-caution">⚠ {periodAmount.errorMessage}</p>
	{/if}
</div>
