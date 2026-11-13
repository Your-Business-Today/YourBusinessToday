<script lang="ts">
	import DomainExplorer from '$lib/components/blueprint/DomainExplorer.svelte';
	import type { BusinessBrainAddresses } from '$lib/data/businessBrainAddresses';
	import type { OrganisationDomain } from '$lib/data/organisationDomain';

	let { domain, addresses }: { domain: OrganisationDomain; addresses: BusinessBrainAddresses } = $props();

	const { model, contextMap } = $derived(domain);
</script>

{#if contextMap !== null}
	<a href={addresses.page(contextMap.pageId)} class="self-start font-display text-sm text-chalk-subtle transition hover:text-chalk">
		How the areas relate
	</a>
{/if}
<DomainExplorer domain={model} siteMap={null} projectId={null} goals={[]} linkedEntityName={null} />
