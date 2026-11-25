<script lang="ts">
	import ContractPackForm from '$lib/components/admin/contractPacks/ContractPackForm.svelte';
	import ContractPackSummary from '$lib/components/admin/contractPacks/ContractPackSummary.svelte';
	import OrganisationPicker from '$lib/components/admin/contractPacks/OrganisationPicker.svelte';
	import PageTitle from '$lib/components/site/PageTitle.svelte';

	let { data, form } = $props();

	const { picked, pack } = $derived(data);
	const documents = $derived(data.contractDocuments.map((entry) => ({ ...entry, isTicked: true })));
	const clauses = $derived(data.optionalClauses.map((clause) => ({ ...clause, isTicked: clause.isChosenByDefault })));
</script>

<svelte:head>
	<title>Client contract packs — Your Business Today</title>
</svelte:head>

<div class="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-16">
	<div class="flex flex-col gap-2">
		<a href="/admin/documents" class="font-display text-xs text-chalk/50 transition hover:text-chalk">← Client documents</a>
		<PageTitle>Client contract packs</PageTitle>
		<p class="text-chalk/70">
			Prepare a client's pack: each contract document filled with their organisation's details and their latest
			quote, with the optional clauses chosen for them, kept as drafts on their organisation.
		</p>
	</div>
	<OrganisationPicker organisations={data.organisations} pickedId={picked?.id ?? null} />
	{#if picked !== null}
		{#if pack !== null}
			<ContractPackSummary {pack} organisationId={picked.id} />
		{/if}
		<h2 class="font-display text-lg text-chalk">Prepare a new pack for {picked.name}</h2>
		<ContractPackForm
			organisationId={picked.id}
			{documents}
			{clauses}
			writtenBlanks={data.writtenBlanks}
			errorMessage={form?.message ?? null}
		/>
	{/if}
</div>
