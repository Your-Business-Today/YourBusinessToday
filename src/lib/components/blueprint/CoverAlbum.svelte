<script lang="ts" generics="Item">
	import { coverPlacement, steppedIndex } from '$lib/data/blueprint/albumPlacement';
	import { keyboardKeys } from '$lib/client/keyboardKeys';
	import { headerButtonClasses } from '$lib/components/workspace/workspaceStyles';
	import type { CoverPlacement } from '$lib/data/blueprint/albumPlacement';
	import type { Snippet } from 'svelte';

	let {
		items,
		keyOf,
		label,
		chosenIndex = $bindable(),
		cover
	}: {
		items: Item[];
		keyOf: (item: Item) => string;
		label: string;
		chosenIndex: number;
		cover: Snippet<[Item, CoverPlacement, boolean, () => void]>;
	} = $props();

	const swipeDistance = 40;
	const wheelDistance = 30;
	const steps = { back: -1, forward: 1 } as const;
	const stepOfKey: Record<string, number> = { [keyboardKeys.arrowLeft]: steps.back, [keyboardKeys.arrowRight]: steps.forward };

	let swipeStartX: number | null = null;
	let wheelTravel = 0;

	function step(by: number) {
		chosenIndex = steppedIndex(chosenIndex, by, items.length);
	}

	function stepOnArrowKey(event: KeyboardEvent) {
		const by = stepOfKey[event.key];
		if (by === undefined) return;
		event.preventDefault();
		step(by);
	}

	function stepOnSwipeEnd(event: PointerEvent) {
		if (swipeStartX === null) return;
		const travel = event.clientX - swipeStartX;
		swipeStartX = null;
		if (Math.abs(travel) < swipeDistance) return;
		step(travel < 0 ? steps.forward : steps.back);
	}

	function stepOnSidewaysWheel(event: WheelEvent) {
		wheelTravel += event.deltaX;
		if (Math.abs(wheelTravel) < wheelDistance) return;
		step(wheelTravel > 0 ? steps.forward : steps.back);
		wheelTravel = 0;
	}
</script>

<div class="flex flex-col gap-3">
	<div
		role="listbox"
		tabindex="0"
		aria-label={`${label}, flicked through with the arrow keys`}
		onkeydown={stepOnArrowKey}
		onpointerdown={(event) => (swipeStartX = event.clientX)}
		onpointerup={stepOnSwipeEnd}
		onwheel={stepOnSidewaysWheel}
		class="relative h-72 touch-pan-y overflow-hidden rounded-xl border border-hairline bg-gradient-to-b from-night to-carriage outline-none [perspective:1100px] focus-visible:border-go"
	>
		{#each items as item, index (keyOf(item))}
			{@const placement = coverPlacement(index - chosenIndex)}
			{#if placement.isShown}
				{@render cover(item, placement, index === chosenIndex, () => (chosenIndex = index))}
			{/if}
		{/each}
	</div>
	<div class="flex items-center justify-center gap-3 text-sm text-chalk/60">
		<button type="button" class={headerButtonClasses} onclick={() => step(steps.back)} disabled={chosenIndex === 0}>←</button>
		<span>{chosenIndex + 1} of {items.length}</span>
		<button type="button" class={headerButtonClasses} onclick={() => step(steps.forward)} disabled={chosenIndex === items.length - 1}>→</button>
	</div>
</div>
