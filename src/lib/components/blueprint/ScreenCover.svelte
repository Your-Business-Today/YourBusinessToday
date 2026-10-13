<script lang="ts">
	import Wireframe from './Wireframe.svelte';
	import type { CoverPlacement } from '$lib/data/blueprint/albumPlacement';
	import type { Screen } from '$lib/data/blueprint/siteMap';

	let {
		screen,
		placement,
		isChosen,
		onChoose
	}: { screen: Screen; placement: CoverPlacement; isChosen: boolean; onChoose: () => void } = $props();
</script>

<button
	type="button"
	onclick={onChoose}
	aria-current={isChosen ? 'true' : undefined}
	aria-label={screen.route}
	style:transform={placement.transform}
	style:z-index={placement.zIndex}
	class={[
		'absolute top-4 left-1/2 flex h-56 w-48 flex-col overflow-hidden rounded-lg border bg-carriage text-left shadow-2xl transition-transform duration-300 ease-out',
		isChosen ? 'border-go' : 'border-hairline'
	]}
>
	<div class="min-h-0 flex-1 overflow-hidden bg-night/60">
		<Wireframe layout={screen.layout} />
	</div>
	<div class="border-t border-hairline px-2.5 py-1.5">
		<p class="truncate font-mono text-[11px] text-chalk/80">{screen.route}</p>
		<p class="truncate text-[10px] text-chalk/40">{screen.entityName ?? screen.section}</p>
	</div>
</button>
