<script lang="ts">
	import DiscoveryCallButton from '$lib/components/site/DiscoveryCallButton.svelte';
	import { buildTimeline } from '$lib/data/consultancyOffer';
	import { promoDurationSeconds } from '$lib/promo/promoTimeline';
</script>

<div class="flex flex-col gap-6 px-6 pt-8 pb-16 md:flex-row md:items-end md:justify-between md:px-0 md:pb-0">
	<div class="flex flex-col gap-3">
		<p class="font-display text-sm tracking-widest text-signal uppercase">The film</p>
		<h1 class="font-display text-3xl leading-tight font-medium md:text-4xl">
			Your Business Today in {promoDurationSeconds} seconds
		</h1>
		<p class="max-w-prose text-chalk/70">
			How we map the way your business works, build your app and its AI assistant in the open, and have it
			live in {buildTimeline}. Drag the film to look around it.
		</p>
	</div>
	<DiscoveryCallButton isSolid hasCalendarIcon class="self-start md:self-auto" />
</div>
