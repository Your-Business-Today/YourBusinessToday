<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import DomainThingPanels from './DomainThingPanels.svelte';
	import DomainThingsTable from './DomainThingsTable.svelte';
	import { thingNamed } from '$lib/data/domainThingLinks';
	import type { BusinessBrainAddresses } from '$lib/data/businessBrainAddresses';
	import type { OrganisationDomain } from '$lib/data/organisationDomain';
	import type { ThingStation } from '$lib/data/workflowMap/thingStations';

	let {
		domain,
		openedSlug,
		thingStations,
		thingTitles,
		organisationId,
		addresses
	}: {
		domain: OrganisationDomain;
		openedSlug: string | null;
		thingStations: ThingStation[];
		thingTitles: Map<string, string>;
		organisationId: string;
		addresses: BusinessBrainAddresses;
	} = $props();

	const { things, rules } = $derived(domain);
	const openedThing = $derived(thingNamed(things, openedSlug));
</script>

<DashboardPanel>
	<DomainThingsTable {things} {rules} />
</DashboardPanel>
{#if openedThing !== undefined}
	<DomainThingPanels thing={openedThing} {things} {rules} {thingStations} {thingTitles} {organisationId} {addresses} />
{/if}
