<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import OrganisationPageHeader from '$lib/components/organisations/OrganisationPageHeader.svelte';
	import TeamWorkGroupTable from '$lib/components/organisations/teamWork/TeamWorkGroupTable.svelte';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data } = $props();

	const { organisation, groups } = $derived(data);
	const openItemCount = $derived(groups.flatMap(({ items }) => items).length);
</script>

<svelte:head>
	<title>Task Management — {organisation.name} — Your Business Today</title>
</svelte:head>

<OrganisationPageHeader {organisation}>
	<p class="text-sm text-chalk-subtle">The team's open jobs across every product of {organisation.name}. Each is changed on its product's Task Management.</p>
</OrganisationPageHeader>

<div class={workspaceBodyClasses}>
	<DashboardPanel title="Open jobs" count={openItemCount}>
		{#each groups as group (group.department)}
			<TeamWorkGroupTable {group} />
		{/each}
	</DashboardPanel>
</div>
