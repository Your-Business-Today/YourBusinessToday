<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import TabStrip from '$lib/components/workspace/TabStrip.svelte';
	import TeamWorkTable from '$lib/components/organisations/teamWork/TeamWorkTable.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { everyDepartmentTab, teamWorkOnTab, teamWorkTabsFor } from '$lib/components/organisations/teamWork/teamWorkTabs';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data } = $props();

	const tasksTitle = 'Tasks';
	const { organisation, groups } = $derived(data);
	let selectedTab = $state(everyDepartmentTab);
	const tabs = $derived(teamWorkTabsFor(groups));
	const shownItems = $derived(teamWorkOnTab(groups, selectedTab));
</script>

<svelte:head>
	<title>{tasksTitle} — {organisation.name} — Your Business Today</title>
</svelte:head>

<WorkspaceHeader crumbs={[]} title={tasksTitle}>
	<p class="text-sm text-chalk-subtle">The team's open jobs across every product of {organisation.name}. Each is changed on its product's Task Management.</p>
</WorkspaceHeader>

<div class={workspaceBodyClasses}>
	<nav aria-label="Departments">
		<TabStrip {tabs} bind:selectedKey={selectedTab} />
	</nav>
	<DashboardPanel>
		<TeamWorkTable items={shownItems} />
	</DashboardPanel>
</div>
