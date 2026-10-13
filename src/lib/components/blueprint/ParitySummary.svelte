<script lang="ts">
	import { hasConnectorTool, parityGapsOf, type McpMap, type StoryDoors } from '$lib/data/blueprint/mcpMap';

	let { mcpMap }: { mcpMap: McpMap } = $props();

	const { stories } = $derived(mcpMap);
	const gaps = $derived(parityGapsOf(mcpMap));

	function missingDoor(story: StoryDoors): string {
		return hasConnectorTool(story) ? 'no screen' : 'no connector tool';
	}
</script>

{#if stories.length > 0}
	<div
		role="status"
		class={[
			'rounded-xl border px-4 py-2.5 text-sm',
			gaps.length === 0 ? 'border-go/40 text-chalk/80' : 'border-caution/50 text-chalk/90'
		]}
	>
		{#if gaps.length === 0}
			Parity holds: every one of the {stories.length} stories has a screen for a person and a connector tool for a Claude.
		{:else}
			<p>Parity gaps: {gaps.length} of {stories.length} stories have only one door.</p>
			<ul class="mt-1.5 flex flex-col gap-0.5 text-xs text-chalk/70">
				{#each gaps as gap (gap.id)}
					<li><span class="font-mono text-caution">{gap.id}</span> {gap.story} has {missingDoor(gap)}.</li>
				{/each}
			</ul>
		{/if}
	</div>
{/if}
