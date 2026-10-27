<script lang="ts">
	import DiscoveryCallButton from '../site/DiscoveryCallButton.svelte';
	import LineIcon from '../site/LineIcon.svelte';
	import HeroChecklist from './HeroChecklist.svelte';
	import HeroPromiseRow from './HeroPromiseRow.svelte';
	import HeroMockup from './mockup/HeroMockup.svelte';
	import { heroAudience, heroPromises } from '$lib/data/home/heroCopy';
</script>

<section class="border-t border-hairline">
	<div
		class="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-[1.1fr_1fr] md:py-24"
	>
		<div class="flex flex-col gap-6">
			<span
				class="inline-flex w-fit items-center gap-2 rounded-lg border border-signal/60 px-3 py-1.5
					font-display text-sm text-chalk"
			>
				<LineIcon kind="briefcase" class="h-4 w-4 text-signal" />
				{heroAudience}
			</span>
			<h2 class="font-display text-4xl leading-tight font-semibold tracking-tight md:text-6xl">
				We Build Your Business App Or Platform In 2–4 Weeks<span class="text-signal">.</span>
			</h2>
			<HeroChecklist />
			<p class="max-w-prose text-lg text-chalk/80">
				Your own app, built around how
				<strong class="font-semibold text-chalk">your</strong> business works, plus an
				<strong class="font-semibold text-chalk">AI assistant</strong> your team can simply talk to.
			</p>
			<DiscoveryCallButton hasCalendarIcon class="w-fit px-6 py-4 text-base md:text-lg" />
			<div class="mt-2 flex flex-col gap-3">
				{#each heroPromises as promise (promise.id)}
					<HeroPromiseRow {promise} />
				{/each}
			</div>
		</div>
		<HeroMockup />
	</div>
</section>
