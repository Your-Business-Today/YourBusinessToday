<script lang="ts">
	import OrganisationFilterChips from '$lib/components/organisations/OrganisationFilterChips.svelte';
	import ProjectBoard from './ProjectBoard.svelte';
	import TabStrip from '$lib/components/workspace/TabStrip.svelte';
	import TeamProjectsSection from './TeamProjectsSection.svelte';
	import { RememberedChoice } from '$lib/client/rememberedChoice.svelte';
	import { matchesOrganisationFilter } from '$lib/data/organisationFilter';
	import type { Organisation } from '$lib/server/organisations/organisationRecord';
	import type { ProjectListView } from '$lib/client/projectListView.svelte';
	import type { ProjectSummary } from '$lib/server/projects/getProjectsForOwner';
	import type { TeamProject } from '$lib/server/members/getTeamProjects';

	let {
		listView,
		teamProjects,
		organisations,
		latestKitVersion,
		onEdit,
		onDelete,
		onSetPriority,
		onSetTeamPriority
	}: {
		listView: ProjectListView;
		teamProjects: TeamProject[];
		organisations: Organisation[];
		latestKitVersion: string;
		onEdit: (project: ProjectSummary) => void;
		onDelete: (project: ProjectSummary) => void;
		onSetPriority: (project: ProjectSummary) => void;
		onSetTeamPriority: (project: TeamProject) => void;
	} = $props();

	const boardTabs = { mine: 'mine', team: 'team' };
	const chosenTab = new RememberedChoice('ybt.projects-tab', boardTabs.mine);
	chosenTab.remember(Object.values(boardTabs));

	/** The organisation chip narrows both boards at once. */
	const teamProjectsUnderFilter = $derived(
		teamProjects.filter((project) =>
			matchesOrganisationFilter(project.organisationId, listView.selectedOrganisation, organisations)
		)
	);
	const hasProjectsUnderNone = $derived(
		[...listView.filteredProjects, ...teamProjects].some((project) => project.organisationId === null)
	);

	const tabs = $derived([
		{ key: boardTabs.mine, label: 'My projects', count: listView.projectCount },
		{ key: boardTabs.team, label: 'Team projects', count: teamProjectsUnderFilter.length }
	]);
	const isTeamTab = $derived(chosenTab.key === boardTabs.team);
</script>

<OrganisationFilterChips {organisations} {hasProjectsUnderNone} bind:selectedFilter={listView.selectedOrganisation} />
<TabStrip {tabs} bind:selectedKey={chosenTab.key} />
{#if isTeamTab}
	<TeamProjectsSection projects={teamProjectsUnderFilter} onSetPriority={onSetTeamPriority} />
{:else}
	<ProjectBoard {listView} {latestKitVersion} {onEdit} {onDelete} {onSetPriority} />
{/if}
