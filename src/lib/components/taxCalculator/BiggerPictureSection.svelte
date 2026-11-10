<script lang="ts">
	import type { TakeHomeEstimate } from '$lib/data/taxCalculator/takeHomeEstimate';
	import LivingCostsCard from './LivingCostsCard.svelte';
	import SectionHeading from './SectionHeading.svelte';
	import WhatIfCard from './WhatIfCard.svelte';

	let {
		estimate,
		extraIncome = $bindable(),
		livingCosts = $bindable()
	}: { estimate: TakeHomeEstimate; extraIncome: number; livingCosts: number | null } = $props();
</script>

<section class="flex flex-col gap-6" aria-labelledby="bigger-picture-heading">
	<SectionHeading stepNumber={2} eyebrow="See the bigger picture" heading="A little planning goes a long way." id="bigger-picture-heading" />
	<div class="grid gap-5 md:grid-cols-2">
		<WhatIfCard {estimate} bind:extraIncome />
		<LivingCostsCard takeHome={estimate.takeHome} bind:livingCosts />
	</div>
</section>
