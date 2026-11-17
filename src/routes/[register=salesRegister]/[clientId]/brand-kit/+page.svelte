<script lang="ts">
	import BrandKitPanels from '$lib/components/brand/BrandKitPanels.svelte';
	import LeadWorkspaceHeader from '$lib/components/clients/leadTabs/LeadWorkspaceHeader.svelte';
	import NoLeadOrganisation from '$lib/components/clients/leadTabs/NoLeadOrganisation.svelte';
	import { leadTabKeys } from '$lib/components/clients/leadTabs/leadTabs';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data } = $props();

	const { client, kit } = $derived(data);
</script>

<svelte:head>
	<title>Brand — {client.name} — Your Business Today</title>
</svelte:head>

<LeadWorkspaceHeader company={client} shownTab={leadTabKeys.brand}>
	<p class="text-sm text-chalk-muted">{client.name}’s brand as it holds everywhere: colours, type, voice and who it speaks to.</p>
</LeadWorkspaceHeader>

<div class={workspaceBodyClasses}>
	{#if kit === null}
		<NoLeadOrganisation company={client} />
	{:else}
		<BrandKitPanels {kit} />
	{/if}
</div>
