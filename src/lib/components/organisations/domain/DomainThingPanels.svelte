<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import DomainGroupMembersTable from './DomainGroupMembersTable.svelte';
	import DomainRulesTable from './DomainRulesTable.svelte';
	import DomainThingFacts from './DomainThingFacts.svelte';
	import DomainThingFieldsTable from './DomainThingFieldsTable.svelte';
	import DomainThingLifecycleTable from './DomainThingLifecycleTable.svelte';
	import DomainThingStationsTable from './DomainThingStationsTable.svelte';
	import { domainPageKinds } from '$lib/data/businessBrainDomain';
	import { domainKindsWithFields } from '$lib/data/businessBrainDomainRules';
	import { lifecycleRowsOf } from '$lib/data/domainLifecycleRows';
	import { membersOf } from '$lib/data/domainGroups';
	import { rulesGoverning, stationsNaming, thingNamed } from '$lib/data/domainThingLinks';
	import { thingKindWord } from './domainPlainWords';
	import type { BusinessBrainAddresses } from '$lib/data/businessBrainAddresses';
	import type { DomainRule, DomainThing } from '$lib/data/domainReading';
	import type { ThingStation } from '$lib/data/workflowMap/thingStations';

	let {
		thing,
		things,
		rules,
		thingStations,
		thingTitles,
		organisationId,
		addresses
	}: {
		thing: DomainThing;
		things: DomainThing[];
		rules: DomainRule[];
		thingStations: ThingStation[];
		thingTitles: Map<string, string>;
		organisationId: string;
		addresses: BusinessBrainAddresses;
	} = $props();

	const { pageId, slug, kind, title, summary, areaTitle, fields, groupSlug } = $derived(thing);
	const isGroup = $derived(kind === domainPageKinds.aggregate);
	const hasLifecycle = $derived(domainKindsWithFields.includes(kind));
	const governingRules = $derived(rulesGoverning(rules, slug));
	const stations = $derived(stationsNaming(thingStations, slug));
	const lifecycleRows = $derived(lifecycleRowsOf(thing, thingStations));
	const members = $derived(membersOf(things, thing));
	const group = $derived(thingNamed(things, groupSlug));
</script>

<DashboardPanel {title} isPadded>
	{#snippet actions()}
		<a href={addresses.page(pageId)} class="font-display text-sm text-chalk-subtle transition hover:text-chalk">Open its page</a>
	{/snippet}
	<div class="flex flex-col gap-3 text-sm">
		<p class="text-chalk-muted">{thingKindWord(kind)} in {areaTitle}. {summary}</p>
		<DomainThingFacts {thing} {group} />
	</div>
</DashboardPanel>
{#if isGroup}
	<DashboardPanel title="Members" count={members.length}>
		<DomainGroupMembersTable {members} />
	</DashboardPanel>
{:else if hasLifecycle}
	<DashboardPanel title="Lifecycle" count={lifecycleRows.length}>
		<DomainThingLifecycleTable rows={lifecycleRows} {organisationId} />
	</DashboardPanel>
{/if}
<DashboardPanel title="Fields" count={fields.length}>
	<DomainThingFieldsTable {fields} {thingTitles} />
</DashboardPanel>
<DashboardPanel title="Rules" count={governingRules.length}>
	<DomainRulesTable rules={governingRules} {thingTitles} {addresses} emptyMessage="No rule governs it yet." />
</DashboardPanel>
<DashboardPanel title="Stations" count={stations.length}>
	<DomainThingStationsTable {stations} {organisationId} />
</DashboardPanel>
