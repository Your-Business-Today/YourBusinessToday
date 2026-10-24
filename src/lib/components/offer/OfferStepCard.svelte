<script lang="ts">
	import SignalBadge from '../site/SignalBadge.svelte';
	import { monthlyRetainerLabel, type OfferStep } from '$lib/data/consultancyOffer';

	let { step, stepNumber }: { step: OfferStep; stepNumber: number } = $props();

	const stepLabel = $derived(stepNumber.toString().padStart(2, '0'));
</script>

<li
	class={[
		'flex gap-4 rounded-2xl border p-6',
		step.isMonthlyRetainer ? 'border-signal/60 bg-signal/10 md:col-span-2' : 'border-hairline bg-carriage/80'
	]}
>
	<span class="font-display text-xl font-semibold text-signal">{stepLabel}</span>
	<div class="flex flex-col gap-1.5">
		<h3 class="flex flex-wrap items-center gap-3 font-display text-xl font-semibold">
			{step.name}
			{#if step.isMonthlyRetainer}
				<SignalBadge label={monthlyRetainerLabel} />
			{/if}
		</h3>
		<p class="text-chalk/60">{step.summary}</p>
	</div>
</li>
