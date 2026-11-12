<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import DomainContextRow from './DomainContextRow.svelte';
	import { panelListClasses } from '$lib/components/workspace/workspaceStyles';
	import type { BusinessBrainAddresses } from '$lib/data/businessBrainAddresses';
	import type { OrganisationDomain } from '$lib/data/organisationDomain';

	let { domain, addresses }: { domain: OrganisationDomain; addresses: BusinessBrainAddresses } = $props();

	const { contexts, contextMap } = $derived(domain);
</script>

<DashboardPanel title="Bounded contexts" count={contexts.length}>
	{#snippet actions()}
		{#if contextMap !== null}
			<a href={addresses.page(contextMap.pageId)} class="font-display text-sm text-chalk-subtle transition hover:text-chalk">
				How they relate
			</a>
		{/if}
	{/snippet}
	<ul class={panelListClasses}>
		{#each contexts as context (context.pageId)}
			<DomainContextRow {context} {addresses} />
		{/each}
	</ul>
</DashboardPanel>
