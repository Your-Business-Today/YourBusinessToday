<script lang="ts">
	import BusinessBrainChatbotsPanel from '$lib/components/businessBrain/BusinessBrainChatbotsPanel.svelte';
	import DomainContextsPanel from '$lib/components/organisations/domain/DomainContextsPanel.svelte';
	import DomainExplorer from '$lib/components/blueprint/DomainExplorer.svelte';
	import EmptyState from '$lib/components/site/EmptyState.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { businessBrainAddresses } from '$lib/data/businessBrainAddresses';
	import { framePageLabels } from '$lib/components/frame/moduleFolders';
	import { organisationDomainMessages } from '$lib/components/organisations/domain/organisationDomainMessages';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data } = $props();

	const domainTitle = framePageLabels.domain;
	const { organisation, canManage, brains, domain } = $derived(data);
	const addresses = $derived(businessBrainAddresses(organisation.id));
	const messages = $derived(organisationDomainMessages(organisation.name));
</script>

<svelte:head>
	<title>{domainTitle} — {organisation.name} — Your Business Today</title>
</svelte:head>

<WorkspaceHeader crumbs={[]} title={domainTitle}>
	<p class="text-sm text-chalk-subtle">{messages.introduction}</p>
</WorkspaceHeader>

<div class={workspaceBodyClasses}>
	{#if brains === null}
		<EmptyState message={messages.brainClosed} />
	{:else}
		{#if domain === null}
			<EmptyState message={messages.noDomain} />
		{:else}
			<DomainExplorer domain={domain.model} siteMap={null} projectId={null} goals={[]} linkedEntityName={null} />
			<DomainContextsPanel {domain} {addresses} />
		{/if}
		<BusinessBrainChatbotsPanel chatbots={brains} {canManage} {addresses} isBrainLinked={true} />
	{/if}
</div>
