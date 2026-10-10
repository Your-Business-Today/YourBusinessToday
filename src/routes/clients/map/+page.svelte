<script lang="ts">
	import AreaCompanyList from '$lib/components/clients/map/AreaCompanyList.svelte';
	import AreaCompanyPanel from '$lib/components/clients/map/AreaCompanyPanel.svelte';
	import AreaMapPane from '$lib/components/clients/map/AreaMapPane.svelte';
	import AreaSearchForm from '$lib/components/clients/map/AreaSearchForm.svelte';
	import AreaSummary from '$lib/components/clients/map/AreaSummary.svelte';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import { describeAreaSearchQuery } from '$lib/data/areaSearch';

	let { data, form } = $props();

	const { area } = $derived(data);

	let selectedKey = $state<string | null>(null);

	const searchQuery = $derived(data.search === null ? '' : `&${describeAreaSearchQuery(data.search)}`);
	const addLeadAction = $derived(`?/addLead${searchQuery}`);
	const addWithDirectorsAction = $derived(`?/addLeadWithDirectors${searchQuery}`);
	const selectedPin = $derived(area?.pins.find((pin) => pin.key === selectedKey) ?? null);
</script>

<svelte:head>
	<title>Map an area — Your Business Today</title>
</svelte:head>

<div class="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-16">
	<div class="flex flex-col gap-2">
		<a href="/clients" class="font-display text-sm text-chalk/50 hover:text-chalk">← Clients</a>
		<h1 class="font-display text-3xl font-medium">Map an area</h1>
		<p class="text-chalk/70">A postcode and a radius: every company registered there, and where we stand with each.</p>
	</div>
	<AreaSearchForm search={data.search} />
	<FormErrorNote message={data.notice ?? form?.message ?? null} />
	{#if form?.clientId !== undefined}
		<p class="text-sm text-chalk/70">
			<a href={`/clients/${form.clientId}`} class="text-go hover:underline">Open the client</a>
		</p>
	{/if}
	{#if area !== null}
		<AreaSummary {area} />
		<div class="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
			<AreaMapPane {area} {selectedKey} onSelect={(key) => (selectedKey = key)} />
			<div class="flex flex-col gap-4">
				<AreaCompanyPanel pin={selectedPin} {addLeadAction} {addWithDirectorsAction} />
				<AreaCompanyList pins={area.pins} {selectedKey} onSelect={(key) => (selectedKey = key)} />
			</div>
		</div>
	{/if}
</div>
