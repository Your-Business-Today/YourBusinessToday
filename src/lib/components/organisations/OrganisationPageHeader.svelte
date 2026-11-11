<script lang="ts">
	import { page } from '$app/state';
	import TabStrip from '$lib/components/workspace/TabStrip.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { currentOrganisationPage, organisationPageLinks } from './organisationPages';
	import type { Organisation } from '$lib/server/organisations/organisationRecord';
	import type { Snippet } from 'svelte';

	let { organisation, actions, children }: { organisation: Organisation; actions?: Snippet; children?: Snippet } = $props();

	const pageTabs = $derived(organisationPageLinks(organisation.id).map(({ key, label, href }) => ({ key, label, count: null, href })));
	const { url } = $derived(page);
	const selectedKey = $derived(currentOrganisationPage(organisation.id, url.pathname));
</script>

{#snippet pageTabStrip()}
	<TabStrip tabs={pageTabs} {selectedKey} />
{/snippet}

<WorkspaceHeader crumbs={[]} title={organisation.name} {actions} tabs={pageTabStrip}>
	{@render children?.()}
</WorkspaceHeader>
