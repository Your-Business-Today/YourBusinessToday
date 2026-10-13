<script lang="ts">
	import { mcpEntryHref } from './blueprintViews';
	import { toolsServingRoute, type McpMap } from '$lib/data/blueprint/mcpMap';

	let { mcpMap, route, projectId }: { mcpMap: McpMap; route: string; projectId: string } = $props();

	const toolNames = $derived(toolsServingRoute(mcpMap, route));
	const linkClasses =
		'rounded-full border border-hairline px-2.5 py-0.5 font-mono text-xs text-chalk/70 hover:border-go hover:text-go';
</script>

<section class="flex flex-col gap-1.5">
	<h3 class="font-display text-xs tracking-widest text-chalk/50 uppercase">What a Claude can do here</h3>
	{#if toolNames.length === 0}
		<p class="text-xs text-chalk/50">No story in the parity audit names this screen, so no connector tool is paired with it.</p>
	{:else}
		<ul class="flex flex-wrap gap-1.5">
			{#each toolNames as toolName (toolName)}
				<li><a href={mcpEntryHref(projectId, toolName)} class={linkClasses}>{toolName}</a></li>
			{/each}
		</ul>
	{/if}
</section>
