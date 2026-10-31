<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import DeployHistoryEntry from './DeployHistoryEntry.svelte';
	import { panelEmptyClasses, panelListClasses } from '$lib/components/workspace/workspaceStyles';
	import type { Deploy } from '$lib/data/deployHistory';
	import type { ProjectTask } from '$lib/server/projects/taskRecord';

	let { projectId, deploys }: { projectId: string; deploys: Deploy<ProjectTask>[] } = $props();
</script>

<DashboardPanel title="Live in each deploy" count={deploys.length}>
	{#snippet actions()}
		<a href={`/projects/${projectId}/deploys`} class="font-display text-xs text-go hover:brightness-110">
			Deployment history →
		</a>
	{/snippet}
	{#if deploys.length === 0}
		<p class={panelEmptyClasses}>No deploy has carried a task live yet.</p>
	{:else}
		<ul class={panelListClasses}>
			{#each deploys as deploy (deploy.liveAt)}
				<DeployHistoryEntry {deploy} />
			{/each}
		</ul>
	{/if}
</DashboardPanel>
