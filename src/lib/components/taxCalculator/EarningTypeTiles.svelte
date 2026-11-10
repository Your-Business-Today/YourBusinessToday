<script lang="ts">
	import type { TaxCalculatorForm } from '$lib/client/taxCalculatorForm.svelte';
	import type { EarningType } from '$lib/data/taxCalculator/takeHomeInputs';
	import EarningTypeIcon from './EarningTypeIcon.svelte';

	let { form }: { form: TaxCalculatorForm } = $props();

	const earningTypeOptions: { earningType: EarningType; label: string; description: string }[] = [
		{ earningType: 'employed', label: 'Employed', description: 'I earn a salary' },
		{ earningType: 'selfEmployed', label: 'Self-employed', description: 'I work for myself' },
		{ earningType: 'both', label: 'A bit of both', description: 'Job + side income' }
	];
</script>

<fieldset class="grid grid-cols-3 gap-2 sm:gap-3">
	<legend class="sr-only">How do you earn?</legend>
	{#each earningTypeOptions as option (option.earningType)}
		<label
			class="group relative flex min-w-0 cursor-pointer flex-col items-start gap-2 rounded-2xl border border-hairline
				bg-night/40 p-3 transition hover:border-chalk/40 has-[:checked]:border-go has-[:checked]:bg-go/10
				has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-go sm:gap-3 sm:p-4"
		>
			<input
				type="radio"
				name="earning-type"
				class="peer sr-only"
				checked={form.earningType === option.earningType}
				onchange={() => form.chooseEarningType(option.earningType)}
			/>
			<span class="text-chalk/60 group-has-[:checked]:text-go"><EarningTypeIcon earningType={option.earningType} /></span>
			<span class="flex flex-col gap-0.5">
				<span class="font-display text-sm leading-tight font-medium text-chalk sm:text-base">{option.label}</span>
				<span class="hidden text-xs text-chalk/55 sm:block md:hidden lg:block">{option.description}</span>
			</span>
			<span
				class="absolute top-3 right-3 size-4 sm:top-4 sm:right-4 rounded-full border border-chalk/40 group-has-[:checked]:border-go
					group-has-[:checked]:bg-go group-has-[:checked]:shadow-[inset_0_0_0_3px_var(--color-night)]"
				aria-hidden="true"
			></span>
		</label>
	{/each}
</fieldset>
