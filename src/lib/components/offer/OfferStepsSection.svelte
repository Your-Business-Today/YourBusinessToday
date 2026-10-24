<script lang="ts">
	import DiscoveryCallButton from '../site/DiscoveryCallButton.svelte';
	import OfferStepCard from './OfferStepCard.svelte';
	import { consultancyOfferSteps, offerDocumentPath } from '$lib/data/consultancyOffer';
</script>

<section class="mx-auto max-w-6xl px-6 py-20 md:py-24">
	<p class="font-display text-sm tracking-[0.3em] text-signal uppercase">The offer</p>
	<h1 class="mt-5 font-display text-4xl leading-tight font-semibold tracking-tight md:text-6xl">
		What we do for<br />your business<span class="text-signal">.</span>
	</h1>
	<p class="mt-5 text-lg text-chalk/60">From the first conversation to long after launch.</p>
	<ol class="mt-12 grid gap-5 md:grid-cols-2">
		{#each consultancyOfferSteps as step, index (step.id)}
			<OfferStepCard {step} stepNumber={index + 1} />
		{/each}
	</ol>
	<div class="mt-14 flex flex-wrap items-center gap-6">
		<DiscoveryCallButton />
		<a
			href={offerDocumentPath}
			download
			class="font-display text-sm text-chalk/50 underline-offset-4 transition hover:text-chalk
				hover:underline"
		>
			Download the offer as a PDF
		</a>
	</div>
</section>
