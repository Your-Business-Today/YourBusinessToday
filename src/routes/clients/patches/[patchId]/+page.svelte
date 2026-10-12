<script lang="ts">
	import AreaMapWorkspace from '$lib/components/clients/map/AreaMapWorkspace.svelte';
	import LeadOutcomeNote from '$lib/components/clients/map/LeadOutcomeNote.svelte';
	import PatchHeader from '$lib/components/clients/patches/PatchHeader.svelte';
	import PatchSummary from '$lib/components/clients/patches/PatchSummary.svelte';

	let { data, form } = $props();

	const { patch, map } = $derived(data);

	const nearestListed = 300;

	const listedPins = $derived(map?.pins.slice(0, nearestListed) ?? []);
</script>

<svelte:head>
	<title>{patch.name} — Your Business Today</title>
</svelte:head>

<div class="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-16">
	<PatchHeader {patch} ownerName={data.ownerName} />
	<LeadOutcomeNote message={data.notice ?? form?.message ?? null} clientId={form?.clientId} />
	{#if map !== null}
		<PatchSummary {map} listedCount={nearestListed} />
		<AreaMapWorkspace area={map} {listedPins} addLeadAction="?/addLead" addWithDirectorsAction="?/addLeadWithDirectors" />
	{/if}
</div>
