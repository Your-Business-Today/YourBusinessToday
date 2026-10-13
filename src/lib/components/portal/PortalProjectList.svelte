<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import PortalProjectRow from './PortalProjectRow.svelte';
	import { panelEmptyClasses, panelListClasses } from '$lib/components/workspace/workspaceStyles';
	import type { PortalProject } from '$lib/portal/portalProject';

	let { projects }: { projects: PortalProject[] } = $props();
</script>

<DashboardPanel title="Your projects" count={projects.length}>
	{#if projects.length === 0}
		<p class={panelEmptyClasses}>No projects are shared with you yet.</p>
	{/if}
	{#if projects.length > 0}
		<ul class={panelListClasses}>
			{#each projects as project (project.id)}
				<PortalProjectRow {project} />
			{/each}
		</ul>
	{/if}
</DashboardPanel>
