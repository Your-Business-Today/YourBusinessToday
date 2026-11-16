<script lang="ts">
	import AreaMapWorkspace from '$lib/components/clients/map/AreaMapWorkspace.svelte';
	import AreaSearchForm from '$lib/components/clients/map/AreaSearchForm.svelte';
	import AreaSummary from '$lib/components/clients/map/AreaSummary.svelte';
	import CrowdedAreaPrompt from '$lib/components/clients/map/CrowdedAreaPrompt.svelte';
	import { isCrowdedArea } from '$lib/components/clients/map/areaSummary';
	import LeadOutcomeNote from '$lib/components/clients/map/LeadOutcomeNote.svelte';
	import { describeAreaSearchQuery } from '$lib/data/areaSearch';
	import PageTitle from '$lib/components/site/PageTitle.svelte';

	let { data, form } = $props();

	const { area, search } = $derived(data);
	const isCrowded = $derived(area !== null && search !== null && isCrowdedArea(area, search));

	const searchQuery = $derived(data.search === null ? '' : `&${describeAreaSearchQuery(data.search)}`);
	const addLeadAction = $derived(`?/addLead${searchQuery}`);
	const addWithDirectorsAction = $derived(`?/addLeadWithDirectors${searchQuery}`);
</script>

<svelte:head>
	<title>Map an area — Your Business Today</title>
</svelte:head>

<div class="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-16">
	<div class="flex flex-col gap-2">
		<a href="/leads" class="font-display text-sm text-chalk/50 hover:text-chalk">← Leads</a>
		<PageTitle>Map an area</PageTitle>
		<p class="text-chalk/70">A postcode and a radius: every company registered there, and where we stand with each.</p>
	</div>
	<AreaSearchForm search={data.search} />
	<LeadOutcomeNote message={data.notice ?? form?.message ?? null} clientId={form?.clientId} />
	{#if area !== null && search !== null && isCrowded}
		<CrowdedAreaPrompt {area} {search} />
	{/if}
	{#if area !== null}
		<AreaSummary {area} />
		<AreaMapWorkspace {area} listedPins={area.pins} {addLeadAction} {addWithDirectorsAction} />
	{/if}
</div>
