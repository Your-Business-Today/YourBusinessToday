<script lang="ts">
	import ClientBusinessCard from './ClientBusinessCard.svelte';
	import { caseStudyBusinesses, caseStudyPath } from '$lib/data/caseStudies';
</script>

<section class="mx-auto max-w-6xl px-6 py-20 md:py-24">
	<p class="font-display text-sm tracking-widest text-signal uppercase">Who we have built for</p>
	<h2 class="mt-5 max-w-3xl font-display text-3xl leading-tight font-medium md:text-4xl">
		Three businesses already run on one.
	</h2>
	<p class="mt-6 max-w-3xl text-chalk/70">
		Each portal is built around how that business works and belongs to it. Here is the kind of
		business and what runs on its portal.
	</p>
	<div class="mt-12 grid gap-6 md:grid-cols-3">
		{#each caseStudyBusinesses as business (business.id)}
			<ClientBusinessCard {business} />
		{/each}
	</div>
	<a
		href={caseStudyPath}
		class="mt-10 inline-block rounded-full border border-signal/60 px-6 py-2.5 font-display text-sm
			text-signal transition hover:bg-signal hover:text-night"
	>
		Read the case study
	</a>
</section>
