<script lang="ts">
	import AreaCompanyList from '$lib/components/clients/map/AreaCompanyList.svelte';
	import AreaCompanyPanel from '$lib/components/clients/map/AreaCompanyPanel.svelte';
	import AreaMapPane from '$lib/components/clients/map/AreaMapPane.svelte';
	import AreaSummary from '$lib/components/clients/map/AreaSummary.svelte';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import PatchHeader from '$lib/components/clients/patches/PatchHeader.svelte';

	let { data, form } = $props();

	const { patch, area } = $derived(data);

	let selectedKey = $state<string | null>(null);

	const selectedPin = $derived(area?.pins.find((pin) => pin.key === selectedKey) ?? null);
</script>

<svelte:head>
	<title>{patch.name} — Your Business Today</title>
</svelte:head>

<div class="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-16">
	<PatchHeader {patch} ownerName={data.ownerName} />
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
				<AreaCompanyPanel pin={selectedPin} addLeadAction="?/addLead" addWithDirectorsAction="?/addLeadWithDirectors" />
				<AreaCompanyList pins={area.pins} {selectedKey} onSelect={(key) => (selectedKey = key)} />
			</div>
		</div>
	{/if}
</div>
