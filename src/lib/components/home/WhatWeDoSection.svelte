<script lang="ts">
	import BrandWordmark from '../site/BrandWordmark.svelte';
	import DiscoveryCallButton from '../site/DiscoveryCallButton.svelte';
	import OfferStepCard from './OfferStepCard.svelte';
	import { companyDetails } from '$lib/data/companyDetails';
	import { consultancyOfferSteps } from '$lib/data/consultancyOffer';
</script>

<section class="border-y border-hairline bg-carriage/40">
	<div class="mx-auto max-w-6xl px-6 py-20 md:py-24">
		<p class="font-display text-sm tracking-[0.3em] text-signal uppercase">Your Business Today</p>
		<h2 class="mt-5 font-display text-4xl leading-tight font-semibold tracking-tight md:text-6xl">
			What we do for<br />your business<span class="text-signal">.</span>
		</h2>
		<p class="mt-5 text-lg text-chalk/60">From the first conversation to long after launch.</p>
		<ol class="mt-12 grid gap-5 md:grid-cols-2">
			{#each consultancyOfferSteps as step, index (step.id)}
				<OfferStepCard {step} stepNumber={index + 1} />
			{/each}
		</ol>
		<div class="mt-14 flex flex-wrap items-end justify-between gap-8">
			<DiscoveryCallButton />
			<div class="flex flex-col items-end gap-1">
				<BrandWordmark fontSize={34} />
				<span class="text-sm text-chalk/60">{companyDetails.websiteHost}</span>
			</div>
		</div>
	</div>
</section>
