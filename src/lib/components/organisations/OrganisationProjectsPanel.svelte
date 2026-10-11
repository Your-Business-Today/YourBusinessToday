<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import OrganisationProjectRow from './OrganisationProjectRow.svelte';
	import { panelEmptyClasses, panelListClasses } from '$lib/components/workspace/workspaceStyles';
	import type { Organisation } from '$lib/server/organisations/organisationRecord';
	import type { OrganisationProject } from '$lib/server/organisations/getProjectsForOrganisation';

	let { organisation, projects }: { organisation: Organisation; projects: OrganisationProject[] } = $props();

	/** A project under one of the organisation's businesses says which; its own projects need no line. */
	function underLine(project: OrganisationProject): string {
		if (project.organisationId === organisation.id) return '';
		return project.organisationName;
	}
</script>

<DashboardPanel title="Projects" count={projects.length}>
	{#if projects.length === 0}
		<p class={panelEmptyClasses}>
			No projects under {organisation.name} yet. A project names its organisation when it is created or edited.
		</p>
	{:else}
		<ul class={panelListClasses}>
			{#each projects as project (project.id)}
				<OrganisationProjectRow {project} underLine={underLine(project)} />
			{/each}
		</ul>
	{/if}
</DashboardPanel>
