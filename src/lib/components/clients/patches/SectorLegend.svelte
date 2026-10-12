<script lang="ts">
	import { coverageStateLabels, coverageStateOrder } from '$lib/data/sectorCoverage';
	import { sectorTones } from './sectorTones';
</script>

<ul class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-chalk/60">
	{#each coverageStateOrder as state (state)}
		<li class="flex items-center gap-1.5">
			<span
				class={`inline-block h-2.5 w-2.5 rounded-sm border ${sectorTones[state].isDashed ? 'border-dashed' : ''}`}
				style={`border-color: var(${sectorTones[state].colourToken}); background-color: var(${sectorTones[state].colourToken}); opacity: ${Math.max(sectorTones[state].fillOpacity, 0.3)}`}
			></span>
			{coverageStateLabels[state]}
		</li>
	{/each}
</ul>
