<script lang="ts">
	import ClientBusinessCard from './ClientBusinessCard.svelte';
	import { clientBusinesses } from '$lib/data/clientBusinesses';
</script>

<section class="mx-auto max-w-6xl px-6 py-20 md:py-24">
	<p class="font-display text-sm tracking-widest text-signal uppercase">Who we have built for</p>
	<h2 class="mt-5 max-w-3xl font-display text-3xl leading-tight font-medium md:text-4xl">
		Three kinds of business already run on one.
	</h2>
	<p class="mt-6 max-w-3xl text-chalk/70">
		Each portal is built around how that business works and belongs to it. Here is the kind of
		business and what runs on its portal.
	</p>
	<div class="mt-12 grid gap-6 md:grid-cols-3">
		{#each clientBusinesses as business (business.id)}
			<ClientBusinessCard {business} />
		{/each}
	</div>
</section>
