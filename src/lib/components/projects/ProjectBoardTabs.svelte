<script lang="ts">
	import ProjectBoard from './ProjectBoard.svelte';
	import TabStrip from '$lib/components/workspace/TabStrip.svelte';
	import TeamProjectsSection from './TeamProjectsSection.svelte';
	import { RememberedChoice } from '$lib/client/rememberedChoice.svelte';
	import type { ProjectListView } from '$lib/client/projectListView.svelte';
	import type { ProjectSummary } from '$lib/server/projects/getProjectsForOwner';
	import type { TeamProject } from '$lib/server/members/getTeamProjects';

	let {
		listView,
		teamProjects,
		latestKitVersion,
		onEdit,
		onDelete,
		onSetPriority,
		onSetTeamPriority
	}: {
		listView: ProjectListView;
		teamProjects: TeamProject[];
		latestKitVersion: string;
		onEdit: (project: ProjectSummary) => void;
		onDelete: (project: ProjectSummary) => void;
		onSetPriority: (project: ProjectSummary) => void;
		onSetTeamPriority: (project: TeamProject) => void;
	} = $props();

	const boardTabs = { mine: 'mine', team: 'team' };
	const chosenTab = new RememberedChoice('ybt.projects-tab', boardTabs.mine);
	chosenTab.remember(Object.values(boardTabs));

	const tabs = $derived([
		{ key: boardTabs.mine, label: 'My projects', count: listView.projectCount },
		{ key: boardTabs.team, label: 'Team projects', count: teamProjects.length }
	]);
	const isTeamTab = $derived(chosenTab.key === boardTabs.team);
</script>

<TabStrip {tabs} bind:selectedKey={chosenTab.key} />
{#if isTeamTab}
	<TeamProjectsSection projects={teamProjects} onSetPriority={onSetTeamPriority} />
{:else}
	<ProjectBoard {listView} {latestKitVersion} {onEdit} {onDelete} {onSetPriority} />
{/if}
