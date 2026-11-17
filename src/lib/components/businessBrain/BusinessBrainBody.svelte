<script lang="ts">
	import BusinessBrainDrawn from './BusinessBrainDrawn.svelte';
	import BusinessBrainFilesTable from './BusinessBrainFilesTable.svelte';
	import BusinessBrainQuestionRecordLinks from './BusinessBrainQuestionRecordLinks.svelte';
	import BusinessBrainPagesTable from './BusinessBrainPagesTable.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import TabStrip from '$lib/components/workspace/TabStrip.svelte';
	import { businessBrainAddresses } from '$lib/data/businessBrainAddresses';
	import { businessBrainTabKeys, businessBrainTabOf, businessBrainTabsFor } from './businessBrainTabs';
	import { filesListedSentence, pagesListedSentence } from './businessBrainSentences';
	import { page } from '$app/state';
	import { panelEmptyClasses } from '$lib/components/workspace/workspaceStyles';
	import type { BusinessBrainForPage } from '$lib/server/businessBrain/readBusinessBrainForPage';

	let { organisationId, brain }: { organisationId: string; brain: BusinessBrainForPage } = $props();

	const { index, listedFiles, drawing, brainsWithRecords } = $derived(brain);
	const { entries: pages, pageCount } = $derived(index);
	const { files, fileCount } = $derived(listedFiles);
	const addresses = $derived(businessBrainAddresses(organisationId));
	const tabs = $derived(businessBrainTabsFor({ pageCount, fileCount }));
	const shownTab = $derived(businessBrainTabOf(page.url));
	const hasMorePages = $derived(pages.length < pageCount);
	const hasMoreFiles = $derived(files.length < fileCount);
	const nothingFiledYet = 'Nothing is filed yet. Ask your Claude to file what the business knows through the connector.';
</script>

<nav aria-label="Your Business Brain">
	<TabStrip {tabs} selectedKey={shownTab} />
</nav>
<DashboardPanel>
	{#if shownTab === businessBrainTabKeys.brain}
		<BusinessBrainDrawn {drawing} {addresses} />
		<BusinessBrainQuestionRecordLinks brains={brainsWithRecords} {addresses} />
	{:else if shownTab === businessBrainTabKeys.files}
		<BusinessBrainFilesTable {files} {addresses} />
		{#if hasMoreFiles}
			<p class={panelEmptyClasses}>{filesListedSentence(files.length, fileCount)}</p>
		{/if}
	{:else if shownTab === businessBrainTabKeys.pages}
		<BusinessBrainPagesTable {pages} {addresses} emptyMessage={nothingFiledYet} />
		{#if hasMorePages}
			<p class={panelEmptyClasses}>{pagesListedSentence(pages.length, pageCount)}</p>
		{/if}
	{/if}
</DashboardPanel>
