<script lang="ts">
	import { modelLadder, rungIndexFor } from '$lib/data/modelLadder';

	let {
		modelId = $bindable(),
		name = 'modelId'
	}: { modelId: string; name?: string } = $props();

	const lastIndex = modelLadder.length - 1;

	const position = $derived(rungIndexFor(modelId));
	const rung = $derived(modelLadder[position]);

	/** A form reset (use:enhance's update) lands on the chosen rung, not the first. */
	const modelIdAfterReset = $derived(rung.modelId);
	const positionAfterReset = $derived(position);

	function moveTo(event: Event) {
		modelId = modelLadder[Number((event.currentTarget as HTMLInputElement).value)].modelId;
	}
</script>

<div class="flex flex-col gap-3">
	<input type="hidden" {name} value={rung.modelId} defaultValue={modelIdAfterReset} />
	<input
		type="range"
		min="0"
		max={lastIndex}
		step="1"
		value={position}
		defaultValue={positionAfterReset}
		oninput={moveTo}
		aria-label="Model"
		aria-valuetext={rung.name}
		class="w-full accent-signal"
	/>
	<div class="flex justify-between text-[10px] tracking-wider text-chalk/40 uppercase">
		<span>Cheap</span>
		<span>Expensive</span>
	</div>
	<ol class="grid grid-cols-4 text-center text-xs">
		{#each modelLadder as candidate, index (candidate.modelId)}
			<li class={index === position ? 'text-chalk' : 'text-chalk/40'}>{candidate.name}</li>
		{/each}
	</ol>
	<div class="flex items-baseline justify-between gap-3 rounded-xl border border-hairline bg-night px-4 py-3">
		<div class="flex flex-col">
			<span class="font-display text-sm text-chalk">Claude {rung.name}</span>
			<span class="text-xs text-chalk/60">{rung.tagline}</span>
		</div>
		<span class="shrink-0 font-mono text-sm text-chalk">
			from {rung.floorCredits}<span class="text-chalk/50"> credits / question</span>
		</span>
	</div>
</div>
