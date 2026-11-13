<script lang="ts">
	import Badge from '$lib/components/site/Badge.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import DomainRulesTable from './DomainRulesTable.svelte';
	import DomainThingFieldsTable from './DomainThingFieldsTable.svelte';
	import DomainThingStationsTable from './DomainThingStationsTable.svelte';
	import { rulesGoverning, stationsNaming } from '$lib/data/domainThingLinks';
	import { thingKindWord } from './domainPlainWords';
	import type { BusinessBrainAddresses } from '$lib/data/businessBrainAddresses';
	import type { DomainRule, DomainThing } from '$lib/data/domainReading';
	import type { ThingStation } from '$lib/data/workflowMap/thingStations';

	let {
		thing,
		rules,
		thingStations,
		thingTitles,
		organisationId,
		addresses
	}: {
		thing: DomainThing;
		rules: DomainRule[];
		thingStations: ThingStation[];
		thingTitles: Map<string, string>;
		organisationId: string;
		addresses: BusinessBrainAddresses;
	} = $props();

	const { pageId, slug, kind, title, summary, areaTitle, fields, statuses } = $derived(thing);
	const governingRules = $derived(rulesGoverning(rules, slug));
	const stations = $derived(stationsNaming(thingStations, slug));
</script>

<DashboardPanel {title} isPadded>
	{#snippet actions()}
		<a href={addresses.page(pageId)} class="font-display text-sm text-chalk-subtle transition hover:text-chalk">Open its page</a>
	{/snippet}
	<div class="flex flex-col gap-3 text-sm">
		<p class="text-chalk-muted">{thingKindWord(kind)} in {areaTitle}. {summary}</p>
		{#if statuses.length > 0}
			<ul class="flex flex-wrap gap-1.5" aria-label="Statuses">
				{#each statuses as status (status)}
					<li><Badge label={status} /></li>
				{/each}
			</ul>
		{/if}
	</div>
</DashboardPanel>
<DashboardPanel title="Fields" count={fields.length}>
	<DomainThingFieldsTable {fields} {thingTitles} />
</DashboardPanel>
<DashboardPanel title="Rules" count={governingRules.length}>
	<DomainRulesTable rules={governingRules} {thingTitles} {addresses} emptyMessage="No rule governs it yet." />
</DashboardPanel>
<DashboardPanel title="Stations" count={stations.length}>
	<DomainThingStationsTable {stations} {organisationId} />
</DashboardPanel>
