<script lang="ts">
	import BrandSpinner from '$lib/components/site/BrandSpinner.svelte';
	import LineIcon from '$lib/components/site/LineIcon.svelte';
	import PromoCaptions from './PromoCaptions.svelte';
	import PromoControls from './PromoControls.svelte';
	import PromoEndCard from './PromoEndCard.svelte';
	import type { PromoClock } from './promoClock.svelte';
	import type { PromoSoundtrack } from './promoSoundtrack.svelte';

	let {
		clock,
		soundtrack,
		isFilming,
		isReady
	}: { clock: PromoClock; soundtrack: PromoSoundtrack; isFilming: boolean; isReady: boolean } = $props();

	const isWatching = $derived(!isFilming && isReady);
</script>

<div class="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-night/75 to-transparent"></div>
<PromoCaptions seconds={clock.seconds} />
{#if !isReady}
	<div class="absolute inset-0 grid place-items-center"><BrandSpinner /></div>
{/if}
{#if isWatching}
	{#if clock.hasEnded}
		<PromoEndCard onreplay={() => clock.play()} />
	{/if}
	{#if !soundtrack.isOn}
		<button
			type="button"
			class="absolute top-3 right-3 inline-flex cursor-pointer items-center gap-2 rounded-full bg-night/70 px-4 py-2 text-sm text-chalk backdrop-blur hover:bg-night/90"
			onclick={() => soundtrack.toggle()}
		>
			<LineIcon kind="sound" class="h-4 w-4" />
			Turn sound on
		</button>
	{/if}
	<PromoControls {clock} isSoundOn={soundtrack.isOn} ontogglesound={() => soundtrack.toggle()} />
{/if}
