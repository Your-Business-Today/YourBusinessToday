<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import PortalGoalRow from './PortalGoalRow.svelte';
	import { panelEmptyClasses, panelListClasses } from '$lib/components/workspace/workspaceStyles';
	import type { PortalGoal } from '$lib/portal/portalProject';

	let { goals }: { goals: PortalGoal[] } = $props();
</script>

<DashboardPanel title="Current goals" count={goals.length}>
	{#if goals.length === 0}
		<p class={panelEmptyClasses}>No current goals on this project.</p>
	{/if}
	{#if goals.length > 0}
		<ul class={panelListClasses}>
			{#each goals as goal (goal.id)}
				<li class="px-4 py-3">
					<PortalGoalRow {goal} shouldShowMeasure />
				</li>
			{/each}
		</ul>
	{/if}
</DashboardPanel>
