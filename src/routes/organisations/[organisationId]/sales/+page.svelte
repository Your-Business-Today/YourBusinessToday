<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import SalesPagesTable from '$lib/components/sales/SalesPagesTable.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { salesPages } from '$lib/data/salesPages';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data } = $props();

	const salesTitle = 'Sales';
	const { salesOrganisation: organisation } = $derived(data);
</script>

<svelte:head>
	<title>{salesTitle} — {organisation.name}</title>
</svelte:head>

<WorkspaceHeader crumbs={[]} title={salesTitle}>
	<p class="text-sm text-chalk-subtle">{organisation.name}’s sales work, gathered in one place.</p>
</WorkspaceHeader>

<div class={workspaceBodyClasses}>
	<DashboardPanel title="Sales pages" count={salesPages.length}>
		<SalesPagesTable pages={salesPages} />
	</DashboardPanel>
</div>
