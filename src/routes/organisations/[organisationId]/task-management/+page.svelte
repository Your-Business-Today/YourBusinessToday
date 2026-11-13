<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import TabStrip from '$lib/components/workspace/TabStrip.svelte';
	import TeamWorkFilterBar from '$lib/components/organisations/teamWork/TeamWorkFilterBar.svelte';
	import TeamWorkTable from '$lib/components/organisations/teamWork/TeamWorkTable.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { everyDepartmentTab, teamWorkOnTab, teamWorkTabsFor } from '$lib/components/organisations/teamWork/teamWorkTabs';
	import { everyJob, jobsShownBy } from '$lib/data/teamWorkFilter';
	import { teamPeopleOf } from '$lib/data/teamPeople';
	import { teamWorkAcross } from '$lib/data/organisationTeamWork';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data } = $props();

	const tasksTitle = 'Tasks';
	const { organisation, groups, peopleByProduct, viewerId } = $derived(data);
	let selectedTab = $state(everyDepartmentTab);
	let filter = $state(everyJob);
	const filteredGroups = $derived(groups.map((group) => ({ ...group, items: jobsShownBy(group.items, filter) })));
	const tabs = $derived(teamWorkTabsFor(filteredGroups));
	const shownItems = $derived(teamWorkOnTab(filteredGroups, selectedTab));
	const filterSource = $derived({
		tabJobs: teamWorkOnTab(groups, selectedTab),
		everyJob: teamWorkAcross(groups),
		people: teamPeopleOf(peopleByProduct),
		viewerId
	});
</script>

<svelte:head>
	<title>{tasksTitle} — {organisation.name} — Your Business Today</title>
</svelte:head>

<WorkspaceHeader crumbs={[]} title={tasksTitle}>
	<p class="text-sm text-chalk-subtle">The team's open jobs across every product of {organisation.name}. Put your name on one from its Owner cell.</p>
</WorkspaceHeader>

<div class={workspaceBodyClasses}>
	<nav aria-label="Departments">
		<TabStrip {tabs} bind:selectedKey={selectedTab} />
	</nav>
	<TeamWorkFilterBar source={filterSource} bind:filter />
	<DashboardPanel>
		<TeamWorkTable items={shownItems} {peopleByProduct} />
	</DashboardPanel>
</div>
