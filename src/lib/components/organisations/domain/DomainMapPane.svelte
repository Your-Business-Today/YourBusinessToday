<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import DomainAreaRelationshipsTable from './DomainAreaRelationshipsTable.svelte';
	import DomainAreasTable from './DomainAreasTable.svelte';
	import DomainExplorer from '$lib/components/blueprint/DomainExplorer.svelte';
	import type { BusinessBrainAddresses } from '$lib/data/businessBrainAddresses';
	import type { OrganisationDomain } from '$lib/data/organisationDomain';

	let { domain, addresses }: { domain: OrganisationDomain; addresses: BusinessBrainAddresses } = $props();

	const { model, contexts, contextMap, areaRelationships } = $derived(domain);
</script>

<DomainExplorer domain={model} siteMap={null} projectId={null} goals={[]} linkedEntityName={null} />
<DashboardPanel title="Areas" count={contexts.length}>
	<DomainAreasTable areas={contexts} {addresses} />
</DashboardPanel>
<DashboardPanel title="How the areas relate" count={areaRelationships.length}>
	{#snippet actions()}
		{#if contextMap !== null}
			<a href={addresses.page(contextMap.pageId)} class="font-display text-sm text-chalk-subtle transition hover:text-chalk">Read the page</a>
		{/if}
	{/snippet}
	<DomainAreaRelationshipsTable relationships={areaRelationships} />
</DashboardPanel>
