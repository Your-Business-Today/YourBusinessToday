<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import TeamWorkGroupTable from '$lib/components/organisations/teamWork/TeamWorkGroupTable.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data } = $props();

	const tasksTitle = 'Tasks';
	const { organisation, groups } = $derived(data);
	const openItemCount = $derived(groups.flatMap(({ items }) => items).length);
</script>

<svelte:head>
	<title>{tasksTitle} — {organisation.name} — Your Business Today</title>
</svelte:head>

<WorkspaceHeader crumbs={[]} title={tasksTitle}>
	<p class="text-sm text-chalk-subtle">The team's open jobs across every product of {organisation.name}. Each is changed on its product's Task Management.</p>
</WorkspaceHeader>

<div class={workspaceBodyClasses}>
	<DashboardPanel title="Open jobs" count={openItemCount}>
		{#each groups as group (group.department)}
			<TeamWorkGroupTable {group} />
		{/each}
	</DashboardPanel>
</div>
