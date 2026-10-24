<script lang="ts">
	import DiscoveryCallButton from '../site/DiscoveryCallButton.svelte';
	import { discoveryCallPromise } from '$lib/data/discoveryCall';
</script>

<section class="mx-auto flex max-w-3xl flex-col items-center px-6 py-20 text-center md:py-28">
	<h2 class="font-display text-3xl leading-tight font-semibold md:text-5xl">
		Tell us about your business<span class="text-signal">.</span>
	</h2>
	<p class="mx-auto mt-6 max-w-xl text-lg text-chalk/70">{discoveryCallPromise}</p>
	<DiscoveryCallButton isSolid class="mt-8" />
</section>
