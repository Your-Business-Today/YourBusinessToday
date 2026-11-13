<script lang="ts">
	import ConstellationLegend from './ConstellationLegend.svelte';
	import { sceneHintPosition, sceneHudPillClass, sceneHudPosition } from './sceneHud';
	import type { BrainContext, BrainPageSummary } from '$lib/data/brainTypes';

	let {
		contexts,
		pageIndex,
		focusedContextSlug,
		selectedSlug,
		onReturnToModel,
		onReturnToContext
	}: {
		contexts: BrainContext[];
		pageIndex: BrainPageSummary[];
		focusedContextSlug: string | null;
		selectedSlug: string | null;
		onReturnToModel: () => void;
		onReturnToContext: () => void;
	} = $props();

	const focusedContextName = $derived(
		contexts.find((context) => context.slug === focusedContextSlug)?.name ?? null
	);
	const selectedTitle = $derived(
		pageIndex.find((page) => page.slug === selectedSlug)?.title ?? null
	);
</script>

<div class={[sceneHudPosition, 'pointer-events-none flex flex-col items-start gap-2']}>
	<nav class="pointer-events-auto flex flex-wrap items-center gap-2 font-display text-sm">
		<button type="button" onclick={onReturnToModel} class={sceneHudPillClass}>Whole brain</button>
		{#if focusedContextName !== null}
			<span class="text-chalk/40">/</span>
			<button type="button" onclick={onReturnToContext} class={sceneHudPillClass}>
				{focusedContextName}
			</button>
		{/if}
		{#if selectedTitle !== null}
			<span class="text-chalk/40">/</span>
			<span class="rounded-full border border-signal/50 bg-night/70 px-3 py-1 text-signal backdrop-blur">
				{selectedTitle}
			</span>
		{/if}
	</nav>
	<ConstellationLegend />
</div>
<p class={[sceneHintPosition, 'font-display text-xs tracking-wide text-chalk/40']}>
	Drag to orbit · scroll to zoom · click a neuron to drill in
</p>
