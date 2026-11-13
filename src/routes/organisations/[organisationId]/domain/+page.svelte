<script lang="ts">
	import BusinessBrainChatbotsPanel from '$lib/components/businessBrain/BusinessBrainChatbotsPanel.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import DomainMapPane from '$lib/components/organisations/domain/DomainMapPane.svelte';
	import DomainRulesTable from '$lib/components/organisations/domain/DomainRulesTable.svelte';
	import DomainThingsPane from '$lib/components/organisations/domain/DomainThingsPane.svelte';
	import DomainWordsTable from '$lib/components/organisations/domain/DomainWordsTable.svelte';
	import EmptyState from '$lib/components/site/EmptyState.svelte';
	import TabStrip from '$lib/components/workspace/TabStrip.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { businessBrainAddresses } from '$lib/data/businessBrainAddresses';
	import { domainTabKeys, domainTabOf, domainTabsFor, domainThingOf } from '$lib/components/organisations/domain/domainTabs';
	import { framePageLabels } from '$lib/components/frame/moduleFolders';
	import { organisationDomainMessages } from '$lib/components/organisations/domain/organisationDomainMessages';
	import { page } from '$app/state';
	import { thingTitlesBySlug } from '$lib/data/domainThingLinks';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data } = $props();

	const domainTitle = framePageLabels.domain;
	const { organisation, canManage, brains, domain, words, thingStations } = $derived(data);
	const addresses = $derived(businessBrainAddresses(organisation.id));
	const messages = $derived(organisationDomainMessages(organisation.name));
	const shownTab = $derived(domainTabOf(page.url));
	const openedSlug = $derived(domainThingOf(page.url));
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
			{@const thingTitles = thingTitlesBySlug(domain.things)}
			<nav aria-label="Domain">
				<TabStrip tabs={domainTabsFor(domain, words)} selectedKey={shownTab} />
			</nav>
			{#if shownTab === domainTabKeys.things}
				<DomainThingsPane {domain} {openedSlug} {thingStations} {thingTitles} organisationId={organisation.id} {addresses} />
			{:else if shownTab === domainTabKeys.rules}
				<DashboardPanel>
					<DomainRulesTable rules={domain.rules} {thingTitles} {addresses} emptyMessage={messages.noRules} />
				</DashboardPanel>
			{:else if shownTab === domainTabKeys.words}
				<DashboardPanel>
					<DomainWordsTable {words} {addresses} />
				</DashboardPanel>
			{:else}
				<DomainMapPane {domain} {addresses} />
			{/if}
		{/if}
		<BusinessBrainChatbotsPanel chatbots={brains} {canManage} {addresses} isBrainLinked={true} />
	{/if}
</div>
