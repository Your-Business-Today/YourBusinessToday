<script lang="ts">
	import { appMockupTiles } from '$lib/data/home/appMockup';
</script>

<div class="grid grid-cols-4 gap-1.5">
	{#each appMockupTiles as tile (tile.label)}
		<div class="rounded-md border border-hairline bg-carriage p-1.5">
			<p class="text-[0.38rem] text-chalk/50">{tile.label}</p>
			<p class="font-display text-[0.65rem] font-semibold">{tile.value}</p>
			<p class="text-[0.36rem] text-go">{tile.note}</p>
		</div>
	{/each}
</div>
