<script lang="ts">
	import type { CoverPlacement } from '$lib/data/blueprint/albumPlacement';
	import type { Snippet } from 'svelte';

	let {
		label,
		caption,
		subcaption,
		placement,
		isChosen,
		onChoose,
		children
	}: {
		label: string;
		caption: string;
		subcaption: string;
		placement: CoverPlacement;
		isChosen: boolean;
		onChoose: () => void;
		children: Snippet;
	} = $props();
</script>

<button
	type="button"
	onclick={onChoose}
	aria-current={isChosen ? 'true' : undefined}
	aria-label={label}
	style:transform={placement.transform}
	style:z-index={placement.zIndex}
	class={[
		'absolute top-4 left-1/2 flex h-56 w-48 flex-col overflow-hidden rounded-lg border bg-carriage text-left shadow-2xl transition-transform duration-300 ease-out',
		isChosen ? 'border-go' : 'border-hairline'
	]}
>
	<div class="min-h-0 flex-1 overflow-hidden bg-night/60">{@render children()}</div>
	<div class="border-t border-hairline px-2.5 py-1.5">
		<p class="truncate font-mono text-[11px] text-chalk/80">{caption}</p>
		<p class="truncate text-[10px] text-chalk/40">{subcaption}</p>
	</div>
</button>
