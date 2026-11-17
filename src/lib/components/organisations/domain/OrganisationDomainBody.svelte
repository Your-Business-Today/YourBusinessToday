<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import DomainMapPane from './DomainMapPane.svelte';
	import DomainQuestionsTable from './DomainQuestionsTable.svelte';
	import DomainRulesTable from './DomainRulesTable.svelte';
	import DomainThingsPane from './DomainThingsPane.svelte';
	import DomainWordsTable from './DomainWordsTable.svelte';
	import EmptyState from '$lib/components/site/EmptyState.svelte';
	import TabStrip from '$lib/components/workspace/TabStrip.svelte';
	import { businessBrainAddresses } from '$lib/data/businessBrainAddresses';
	import { domainTabKeys, domainTabOf, domainTabsFor, domainThingOf } from './domainTabs';
	import { organisationDomainMessages } from './organisationDomainMessages';
	import { page } from '$app/state';
	import { thingTitlesBySlug } from '$lib/data/domainThingLinks';
	import type { OrganisationDomainReading } from '$lib/server/businessBrain/readDomainForPage';

	let { organisation, reading }: { organisation: { id: string; name: string }; reading: OrganisationDomainReading } = $props();

	const { isBrainOpen, domain, words, thingStations, wordStationCounts, stationNames, questions, thingPage } = $derived(reading);
	const addresses = $derived(businessBrainAddresses(organisation.id));
	const messages = $derived(organisationDomainMessages(organisation.name));
	const shownTab = $derived(domainTabOf(page.url));
	const openedSlug = $derived(domainThingOf(page.url));
</script>

{#if !isBrainOpen}
	<EmptyState message={messages.brainClosed} />
{:else if domain === null}
	<EmptyState message={messages.noDomain} />
{:else}
	{@const thingTitles = thingTitlesBySlug(domain.things)}
	<nav aria-label="Domain">
		<TabStrip tabs={domainTabsFor(domain, words, questions.length)} selectedKey={shownTab} />
	</nav>
	{#if shownTab === domainTabKeys.map}
		<DomainMapPane {domain} {addresses} />
	{:else if shownTab === domainTabKeys.things}
		<DomainThingsPane {domain} {openedSlug} {thingPage} {thingStations} {thingTitles} {stationNames} organisationId={organisation.id} {addresses} />
	{:else if shownTab === domainTabKeys.rules}
		<DashboardPanel>
			<DomainRulesTable rules={domain.rules} names={{ thingTitles, stationNames }} organisationId={organisation.id} {addresses} emptyMessage={messages.noRules} />
		</DashboardPanel>
	{:else if shownTab === domainTabKeys.questions}
		<DashboardPanel>
			<DomainQuestionsTable {questions} {addresses} />
		</DashboardPanel>
	{:else}
		<DashboardPanel>
			<DomainWordsTable {words} {thingTitles} {wordStationCounts} {addresses} />
		</DashboardPanel>
	{/if}
{/if}
