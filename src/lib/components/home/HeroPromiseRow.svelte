<script lang="ts">
	import LineIcon from '../site/LineIcon.svelte';
	import SignalBadge from '../site/SignalBadge.svelte';
	import type { HeroPromise } from '$lib/data/home/heroCopy';

	let { promise }: { promise: HeroPromise } = $props();

	const hasBadge = $derived(promise.badge !== '');
</script>

<div
	class={[
		'flex items-start gap-4 rounded-xl px-4 py-3',
		promise.isHighlighted && 'border border-signal/50 bg-signal/10'
	]}
>
	<LineIcon kind={promise.icon} class="mt-0.5 h-7 w-7 shrink-0 text-signal" />
	<div class="flex flex-col gap-0.5">
		<p class="flex flex-wrap items-center gap-2 font-display text-lg font-medium">
			{promise.title}
			{#if hasBadge}
				<SignalBadge label={promise.badge} />
			{/if}
		</p>
		<p class="text-sm text-chalk/60">{promise.line}</p>
	</div>
</div>
