<script lang="ts">
	import BusinessBrainBrainsTable from '$lib/components/businessBrain/BusinessBrainBrainsTable.svelte';
	import BusinessBrainFilesTable from '$lib/components/businessBrain/BusinessBrainFilesTable.svelte';
	import BusinessBrainPagesTable from '$lib/components/businessBrain/BusinessBrainPagesTable.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import TabStrip from '$lib/components/workspace/TabStrip.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { businessBrainAddresses } from '$lib/data/businessBrainAddresses';
	import { businessBrainCrumbs } from '$lib/components/businessBrain/businessBrainCrumbs';
	import { businessBrainTabKeys, businessBrainTabOf, businessBrainTabsFor } from '$lib/components/businessBrain/businessBrainTabs';
	import { filesListedSentence, pagesListedSentence } from '$lib/components/businessBrain/businessBrainSentences';
	import { page } from '$app/state';
	import { panelEmptyClasses, workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data } = $props();

	const { organisation, canManage, index, brains, listedFiles } = $derived(data);
	const { entries: pages, pageCount } = $derived(index);
	const { files, fileCount } = $derived(listedFiles);
	const addresses = $derived(businessBrainAddresses(organisation.id));
	const tabs = $derived(businessBrainTabsFor({ pageCount, fileCount, brainCount: brains.length }));
	const shownTab = $derived(businessBrainTabOf(page.url));
	const hasMorePages = $derived(pages.length < pageCount);
	const hasMoreFiles = $derived(files.length < fileCount);
	const nothingFiledYet = 'Nothing is filed yet. Ask your Claude to file what the business knows through the connector.';
</script>

<svelte:head>
	<title>Your Business Brain — {organisation.name} — Your Business Today</title>
</svelte:head>

<WorkspaceHeader crumbs={businessBrainCrumbs(organisation)} title="Your Business Brain">
	<p class="text-sm text-chalk-muted">What {organisation.name} knows, filed by your Claude through the connector.</p>
</WorkspaceHeader>

<div class={workspaceBodyClasses}>
	<nav aria-label="Your Business Brain">
		<TabStrip {tabs} selectedKey={shownTab} />
	</nav>
	<DashboardPanel>
		{#if shownTab === businessBrainTabKeys.files}
			<BusinessBrainFilesTable {files} {addresses} />
			{#if hasMoreFiles}
				<p class={panelEmptyClasses}>{filesListedSentence(files.length, fileCount)}</p>
			{/if}
		{:else if shownTab === businessBrainTabKeys.brains}
			<BusinessBrainBrainsTable {brains} canReadQuestions={canManage} {addresses} />
		{:else}
			<BusinessBrainPagesTable {pages} {addresses} emptyMessage={nothingFiledYet} />
			{#if hasMorePages}
				<p class={panelEmptyClasses}>{pagesListedSentence(pages.length, pageCount)}</p>
			{/if}
		{/if}
	</DashboardPanel>
</div>
