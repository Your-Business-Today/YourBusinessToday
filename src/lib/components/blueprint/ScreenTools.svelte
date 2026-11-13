<script lang="ts">
	import { toolsServingRoute, type McpMap } from '$lib/data/blueprint/mcpMap';

	let { mcpMap, route }: { mcpMap: McpMap; route: string } = $props();

	const toolNames = $derived(toolsServingRoute(mcpMap, route));
</script>

<section class="flex flex-col gap-1.5">
	<h3 class="font-display text-xs tracking-widest text-chalk/50 uppercase">What a Claude can do here</h3>
	{#if toolNames.length === 0}
		<p class="text-xs text-chalk/50">No story in the parity audit names this screen, so no connector tool is paired with it.</p>
	{:else}
		<ul class="flex flex-wrap gap-1.5">
			{#each toolNames as toolName (toolName)}
				<li class="rounded-full border border-hairline px-2.5 py-0.5 font-mono text-xs text-chalk/70">{toolName}</li>
			{/each}
		</ul>
	{/if}
</section>
