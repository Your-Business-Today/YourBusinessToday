<script lang="ts">
	import { asCssColour, kindColourOf } from './constellation/constellationPalette';
	import { keyedNeuronKinds, neuronKindLabel } from './neuronKinds';

	let isOpen = $state(false);
</script>

<div class="pointer-events-auto hidden flex-col items-start gap-2 sm:flex">
	<button
		type="button"
		onclick={() => (isOpen = !isOpen)}
		aria-expanded={isOpen}
		class="rounded-full border border-hairline bg-night/70 px-3 py-1 font-display text-xs
			text-chalk/60 backdrop-blur transition hover:border-chalk/40 hover:text-chalk"
	>
		{isOpen ? 'Key ✕' : 'Key'}
	</button>
	{#if isOpen}
		<ul class="flex flex-col gap-1 rounded-xl border border-hairline bg-night/70 p-3 backdrop-blur">
			{#each keyedNeuronKinds as kind (kind)}
				<li class="flex items-center gap-2 text-xs text-chalk/70">
					<span class="h-2 w-2 rounded-full" style={`background-color: ${asCssColour(kindColourOf(kind))}`}></span>
					{neuronKindLabel(kind)}
				</li>
			{/each}
		</ul>
	{/if}
</div>
