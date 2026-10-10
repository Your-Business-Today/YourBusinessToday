<script lang="ts">
	import AddPersonForm from '$lib/components/people/AddPersonForm.svelte';
	import EmptyState from '$lib/components/site/EmptyState.svelte';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import OfficerResultList from '$lib/components/people/OfficerResultList.svelte';
	import OfficerSearchForm from '$lib/components/people/OfficerSearchForm.svelte';
	import PeopleTable from '$lib/components/people/PeopleTable.svelte';
	import { panelClasses, quietButtonClasses } from '$lib/components/site/formStyles';

	let { data, form } = $props();

	const { officers, people } = $derived(data);
	const addOfficerAction = $derived(`?/addOfficer&officer=${encodeURIComponent(data.officerQuery)}`);
</script>

<svelte:head>
	<title>People — Your Business Today</title>
</svelte:head>

<div class="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-16">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div class="flex flex-col gap-2">
			<h1 class="font-display text-3xl font-medium">People</h1>
			<p class="text-chalk/70">The directors and owners we are pursuing, across every company they hold.</p>
		</div>
		<a href="/clients" class={quietButtonClasses}>Clients</a>
	</div>
	<FormErrorNote message={form?.message ?? null} />
	<div class={panelClasses}>
		<h2 class="font-display text-lg">Add a person</h2>
		<AddPersonForm />
	</div>
	{#if data.isCompaniesHouseConfigured}
		<OfficerSearchForm query={data.officerQuery} />
	{:else}
		<p class="text-xs text-chalk/50">
			Set COMPANIES_HOUSE_API_KEY on the server to find people on Companies House.
		</p>
	{/if}
	{#if officers !== null && officers.length === 0}
		<EmptyState message="No officer matched that name." />
	{/if}
	{#if officers !== null && officers.length > 0}
		<OfficerResultList {officers} addAction={addOfficerAction} />
	{/if}
	{#if people.length === 0}
		<EmptyState message="Nobody on the register yet." />
	{:else}
		<PeopleTable {people} />
	{/if}
</div>
