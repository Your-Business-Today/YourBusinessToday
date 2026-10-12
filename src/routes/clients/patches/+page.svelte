<script lang="ts">
	import CreatePatchForm from '$lib/components/clients/patches/CreatePatchForm.svelte';
	import EmptyState from '$lib/components/site/EmptyState.svelte';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import PageTitle from '$lib/components/site/PageTitle.svelte';
	import PatchesOverview from '$lib/components/clients/patches/PatchesOverview.svelte';
	import PatchTable from '$lib/components/clients/patches/PatchTable.svelte';
	import { quietButtonClasses } from '$lib/components/site/formStyles';

	let { data, form } = $props();

	const { patches } = $derived(data);
</script>

<svelte:head>
	<title>Patches — Your Business Today</title>
</svelte:head>

<div class="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-16">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div class="flex flex-col gap-2">
			<PageTitle>Patches</PageTitle>
			<p class="text-chalk/70">The ground we are working, patch by patch, across the whole country.</p>
		</div>
		<div class="flex flex-wrap gap-3">
			<a href="/clients" class={quietButtonClasses}>Clients</a>
			<a href="/clients/map" class={quietButtonClasses}>Map an area</a>
		</div>
	</div>
	<FormErrorNote message={form?.message ?? null} />
	<PatchesOverview {patches} />
	<CreatePatchForm suggestedPostcode={data.suggestedPostcode} />
	{#if patches.length === 0}
		<EmptyState message="No patches yet. Click the map where you work, or type a postcode above." />
	{:else}
		<PatchTable {patches} />
	{/if}
</div>
