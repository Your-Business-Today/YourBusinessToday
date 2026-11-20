<script lang="ts">
	import BusinessBrainFilesPanel from '$lib/components/businessBrain/BusinessBrainFilesPanel.svelte';
	import BusinessBrainHistoryPanel from '$lib/components/businessBrain/BusinessBrainHistoryPanel.svelte';
	import BusinessBrainLinksPanel from '$lib/components/businessBrain/BusinessBrainLinksPanel.svelte';
	import BusinessBrainPageText from '$lib/components/businessBrain/BusinessBrainPageText.svelte';
	import BusinessBrainSourcePanel from '$lib/components/businessBrain/BusinessBrainSourcePanel.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import Badge from '$lib/components/site/Badge.svelte';
	import { businessBrainAddresses } from '$lib/data/businessBrainAddresses';
	import { businessBrainPageCrumbs } from '$lib/components/businessBrain/businessBrainCrumbs';
	import { businessBrainPartNames } from '$lib/data/businessBrainRules';
	import { dashboardGridClasses, workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';
	import { pageAsShown } from '$lib/components/businessBrain/businessBrainPageShown';
	import { partBadgeTones } from '$lib/components/businessBrain/businessBrainIndex';

	let { data } = $props();

	const { organisation, page, history, links, files, parentPage, revision } = $derived(data);
	const addresses = $derived(businessBrainAddresses(organisation.id));
	const shown = $derived(pageAsShown(page, revision));
	const noFilesMessage = 'This page names no source file.';
</script>

<svelte:head>
	<title>{shown.title} — Your Business Brain — Your Business Today</title>
</svelte:head>

<WorkspaceHeader crumbs={businessBrainPageCrumbs(organisation)} title={shown.title}>
	{#snippet badge()}
		<Badge label={businessBrainPartNames[page.partKind]} tone={partBadgeTones[page.partKind]} />
	{/snippet}
	<p class="text-sm text-chalk-muted">{shown.summary}</p>
</WorkspaceHeader>

<div class={workspaceBodyClasses}>
	<div class={dashboardGridClasses}>
		<div class="flex min-w-0 flex-col gap-4">
			<BusinessBrainPageText {shown} currentHref={addresses.page(page.pageId)} />
		</div>
		<aside class="flex min-w-0 flex-col gap-4">
			<BusinessBrainSourcePanel source={shown.source} />
			<BusinessBrainFilesPanel title="Source files" {files} fileCount={files.length} emptyMessage={noFilesMessage} {addresses} />
			<BusinessBrainHistoryPanel {page} {history} revisionShown={revision} {addresses} />
			<BusinessBrainLinksPanel parent={parentPage} {links} {addresses} />
		</aside>
	</div>
</div>
