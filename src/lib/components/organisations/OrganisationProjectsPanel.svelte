<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import OrganisationProjectFilterSelect from './OrganisationProjectFilterSelect.svelte';
	import OrganisationProjectRow from './OrganisationProjectRow.svelte';
	import { panelEmptyClasses, panelListClasses } from '$lib/components/workspace/workspaceStyles';
	import {
		activeProjectsFilter,
		matchesOrganisationProjectFilter,
		type OrganisationProjectFilter
	} from '$lib/data/organisationProjectFilter';
	import type { Organisation } from '$lib/server/organisations/organisationRecord';
	import type { ReachableOrganisationProject } from '$lib/server/organisations/markReachableProjects';

	let { organisation, projects }: { organisation: Organisation; projects: ReachableOrganisationProject[] } = $props();

	let selectedFilter = $state<OrganisationProjectFilter>(activeProjectsFilter);

	const shownProjects = $derived(
		projects.filter((project) => matchesOrganisationProjectFilter(project.status, selectedFilter))
	);
</script>

<DashboardPanel title="Projects" count={shownProjects.length}>
	{#snippet toolbar()}
		<OrganisationProjectFilterSelect bind:selectedFilter />
	{/snippet}
	{#if projects.length === 0}
		<p class={panelEmptyClasses}>
			No projects under {organisation.name} yet. A project names its organisation when it is created or edited.
		</p>
	{:else if shownProjects.length === 0}
		<p class={panelEmptyClasses}>No projects under {organisation.name} match this filter.</p>
	{:else}
		<ul class={panelListClasses}>
			{#each shownProjects as project (project.id)}
				<OrganisationProjectRow {project} />
			{/each}
		</ul>
	{/if}
</DashboardPanel>
