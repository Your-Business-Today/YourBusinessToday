<script lang="ts">
	import DiscoveryCallButton from '../site/DiscoveryCallButton.svelte';
	import HeroChecklist from './HeroChecklist.svelte';
	import HeroPromiseRow from './HeroPromiseRow.svelte';
	import HeroMockup from './mockup/HeroMockup.svelte';
	import { buildTimeline } from '$lib/data/consultancyOffer';
	import { heroAudience, heroPromises } from '$lib/data/home/heroCopy';
</script>

<section class="border-y border-hairline bg-carriage/60">
	<div
		class="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-[1.1fr_1fr] md:py-24"
	>
		<div class="flex flex-col gap-6">
			<p class="font-display text-sm tracking-widest text-signal uppercase">{heroAudience}</p>
			<h2 class="max-w-xl font-display text-3xl leading-tight font-medium md:text-4xl">
				We build your business app or platform in {buildTimeline}<span class="text-signal">.</span>
			</h2>
			<HeroChecklist />
			<p class="max-w-prose text-lg text-chalk/70">
				Your own app, built around how
				<strong class="font-semibold text-chalk">your</strong> business works, plus an
				<strong class="font-semibold text-chalk">AI assistant</strong> your team can simply talk to.
			</p>
			<DiscoveryCallButton hasCalendarIcon class="w-fit" />
			<div class="mt-2 flex flex-col gap-3">
				{#each heroPromises as promise (promise.id)}
					<HeroPromiseRow {promise} />
				{/each}
			</div>
		</div>
		<HeroMockup />
	</div>
</section>
