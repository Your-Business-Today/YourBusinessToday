<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import GuideDetails from './GuideDetails.svelte';
	import McpEntryFace from './McpEntryFace.svelte';
	import RaiseChangeButton from './RaiseChangeButton.svelte';
	import ToolDoors from './ToolDoors.svelte';
	import { mcpEntryKinds, type McpEntry } from '$lib/data/blueprint/mcpEntries';
	import type { Goal } from '$lib/server/goals/goalRecord';
	import type { SiteMap } from '$lib/data/blueprint/siteMap';

	let {
		entry,
		siteMap,
		projectId,
		goals
	}: { entry: McpEntry; siteMap: SiteMap | null; projectId: string; goals: Goal[] } = $props();
</script>

<DashboardPanel title={entry.name}>
	{#snippet actions()}
		<RaiseChangeButton subject={{ kind: entry.kind, name: entry.name }} {goals} />
	{/snippet}
	<div class="grid gap-4 px-4 py-4 text-sm md:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
		<div class="h-48 overflow-hidden rounded-lg border border-hairline bg-night/60">
			<McpEntryFace {entry} />
		</div>
		{#if entry.kind === mcpEntryKinds.tool}
			<ToolDoors tool={entry.tool} {siteMap} {projectId} />
		{:else}
			<GuideDetails guide={entry.guide} />
		{/if}
	</div>
</DashboardPanel>
