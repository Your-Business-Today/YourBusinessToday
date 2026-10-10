<script lang="ts">
	import EmptyState from '$lib/components/site/EmptyState.svelte';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import ProspectResultTable from '$lib/components/clients/ProspectResultTable.svelte';
	import ProspectSearchForm from '$lib/components/clients/ProspectSearchForm.svelte';

	let { data, form } = $props();

	const { search, companies } = $derived(data);
	const searchQuery = $derived(
		search === null
			? ''
			: `&sicCodes=${encodeURIComponent(search.sicCodes.join(','))}&location=${encodeURIComponent(search.location)}`
	);
	const addLeadAction = $derived(`?/addLead${searchQuery}`);
	const addWithDirectorsAction = $derived(`?/addLeadWithDirectors${searchQuery}`);
</script>

<svelte:head>
	<title>Prospect on Companies House — Your Business Today</title>
</svelte:head>

<div class="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-16">
	<div class="flex flex-col gap-2">
		<a href="/clients" class="font-display text-sm text-chalk/50 hover:text-chalk">← Clients</a>
		<h1 class="font-display text-3xl font-medium">Search Companies House</h1>
		<p class="text-chalk/70">
			Every active UK company in a sector and a place, ready to become a lead. Working a patch?
			<a href="/clients/map" class="text-go hover:underline">Map an area</a> instead.
		</p>
	</div>
	{#if !data.isConfigured}
		<FormErrorNote
			message="Companies House search needs COMPANIES_HOUSE_API_KEY on the server before it can run."
		/>
	{:else}
		<ProspectSearchForm {search} />
	{/if}
	{#if form?.message !== undefined}
		<p class="text-sm text-chalk/70">
			{form.message}
			{#if form.clientId !== undefined}
				<a href={`/clients/${form.clientId}`} class="text-go hover:underline">Open the client</a>
			{/if}
		</p>
	{/if}
	{#if companies !== null && companies.length === 0}
		<EmptyState message="No active companies matched. Try a broader location or another SIC code." />
	{/if}
	{#if companies !== null && companies.length > 0}
		<ProspectResultTable {companies} {addLeadAction} {addWithDirectorsAction} />
	{/if}
</div>
