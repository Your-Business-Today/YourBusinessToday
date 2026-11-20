<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import TabStrip from '$lib/components/workspace/TabStrip.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import CostsTable from '$lib/components/books/CostsTable.svelte';
	import { costTabsOf } from '$lib/components/books/costTabs';
	import { framePageLabels } from '$lib/components/frame/moduleFolders';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';
	import { costsOnTab, describeOwedToSuppliers, type CostTabKey } from '$lib/data/books/page/costRows';

	let { data } = $props();

	const costsTitle = framePageLabels.costs;
	const emptyMessages: Record<CostTabKey, string> = {
		unpaid: 'Nothing is owed to a supplier.',
		paid: 'No cost is paid yet.',
		all: 'The books hold no costs yet. Your Claude records them through the Your Business Today connector.'
	};
	const { costs, booksOrganisation } = $derived(data);
	let selectedTab: CostTabKey = $state('unpaid');
	const tabs = $derived(costTabsOf(costs));
	const shownCosts = $derived(costsOnTab(costs, selectedTab));
</script>

<svelte:head>
	<title>{costsTitle} — {booksOrganisation.name}</title>
</svelte:head>

<WorkspaceHeader crumbs={[]} title={costsTitle}>
	<p class="text-sm text-chalk-subtle">{describeOwedToSuppliers(costs)}</p>
</WorkspaceHeader>

<div class={workspaceBodyClasses}>
	<nav aria-label="Costs by whether they are paid">
		<TabStrip {tabs} bind:selectedKey={() => selectedTab, (key) => (selectedTab = key as CostTabKey)} />
	</nav>
	<DashboardPanel>
		<CostsTable costs={shownCosts} emptyMessage={emptyMessages[selectedTab]} />
	</DashboardPanel>
</div>
