<script lang="ts">
	import AddLeadForm from '$lib/components/clients/AddLeadForm.svelte';
	import ClientTable from '$lib/components/clients/ClientTable.svelte';
	import EmptyState from '$lib/components/site/EmptyState.svelte';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import StageFilterTabs from '$lib/components/clients/StageFilterTabs.svelte';
	import { quietButtonClasses } from '$lib/components/site/formStyles';

	let { data, form } = $props();

	const { clients } = $derived(data);
</script>

<svelte:head>
	<title>Clients — Your Business Today</title>
</svelte:head>

<div class="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-16">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div class="flex flex-col gap-2">
			<h1 class="font-display text-3xl font-medium">Clients</h1>
			<p class="text-chalk/70">Everyone we work for, and everyone we hope to.</p>
		</div>
		<div class="flex flex-wrap gap-3">
			<a href="/people" class={quietButtonClasses}>People</a>
			<a href="/clients/research" class={quietButtonClasses}>Research a company</a>
			<a href="/clients/prospect" class={quietButtonClasses}>Search Companies House</a>
			<a href="/clients/map" class={quietButtonClasses}>Map an area</a>
		</div>
	</div>
	<FormErrorNote message={form?.message ?? null} />
	<AddLeadForm />
	<StageFilterTabs chosenStage={data.stage} />
	{#if clients.length === 0}
		<EmptyState message="Nobody at this stage yet." />
	{:else}
		<ClientTable {clients} />
	{/if}
</div>
