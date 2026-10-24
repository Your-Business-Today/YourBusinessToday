<script lang="ts">
	import SignalBadge from '../site/SignalBadge.svelte';
	import { monthlyRetainerLabel, type OfferStep } from '$lib/data/consultancyOffer';

	let { step, stepNumber }: { step: OfferStep; stepNumber: number } = $props();

	const stepLabel = $derived(stepNumber.toString().padStart(2, '0'));
</script>

<div class="grid gap-3 border-b border-hairline py-8 md:grid-cols-[16rem_1fr] md:gap-10">
	<div class="flex flex-col gap-1">
		<span class="font-display text-xl font-semibold text-signal">{stepLabel}</span>
		<h3 class="font-display text-xl font-medium">{step.name}</h3>
		{#if step.isMonthlyRetainer}
			<span class="w-fit"><SignalBadge label={monthlyRetainerLabel} /></span>
		{/if}
		<p class="mt-1 text-xs leading-relaxed text-chalk/45">{step.timing}</p>
	</div>
	<div class="flex max-w-prose flex-col gap-3">
		<p class="text-chalk/70">{step.description}</p>
		<p class="text-sm text-chalk/60">
			<span class="font-display text-chalk">You get:</span>
			{step.deliverable}
		</p>
	</div>
</div>
