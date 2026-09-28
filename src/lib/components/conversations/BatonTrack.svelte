<script lang="ts">
	import BatonStationNode from './BatonStationNode.svelte';
	import type { BatonStation } from './batonStations';

	let {
		stations,
		accent,
		isInFlight
	}: { stations: BatonStation[]; accent: string; isInFlight: boolean } = $props();
</script>

<ol class="flex items-start overflow-x-auto pb-1">
	{#each stations as station, stationIndex (station.key)}
		{#if stationIndex > 0}
			<li aria-hidden="true" class="relative mt-[1.1rem] h-0.5 min-w-8 flex-1">
				<span
					class={`absolute inset-0 rounded-full ${station.isHandOffBefore ? 'baton-line' : 'bg-chalk/20'}`}
				></span>
				{#if station.isHandOffBefore && isInFlight}
					<span class="baton-dot"></span>
				{/if}
			</li>
		{/if}
		<BatonStationNode {station} {accent} />
	{/each}
</ol>

<style>
	.baton-line {
		background-image: linear-gradient(to right, var(--color-chalk) 0 50%, transparent 50% 100%);
		background-size: 8px 2px;
		opacity: 0.4;
	}
	.baton-dot {
		position: absolute;
		top: 50%;
		left: 0;
		height: 0.625rem;
		width: 0.625rem;
		border-radius: 9999px;
		background-color: var(--color-caution);
		box-shadow: 0 0 12px var(--color-caution);
		transform: translate(-50%, -50%);
		animation: baton-run 2.4s ease-in-out infinite;
	}
	@keyframes baton-run {
		from {
			left: 0;
		}
		to {
			left: 100%;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.baton-dot {
			animation: none;
			left: 50%;
		}
	}
</style>
