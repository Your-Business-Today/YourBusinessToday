<script lang="ts">
	import EmptyState from '$lib/components/site/EmptyState.svelte';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import PageTitle from '$lib/components/site/PageTitle.svelte';
	import SectorCompanyRow from '$lib/components/clients/patches/SectorCompanyRow.svelte';
	import SectorPanel from '$lib/components/clients/patches/SectorPanel.svelte';

	let { data, form } = $props();

	const { patch, reading } = $derived(data);
	const { sector, companies } = $derived(reading);
</script>

<svelte:head>
	<title>{sector.sector} — {patch.name} — Your Business Today</title>
</svelte:head>

<div class="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-16">
	<div class="flex flex-col gap-2">
		<a href={`/clients/patches/${patch.id}`} class="font-display text-sm text-chalk/50 hover:text-chalk">← {patch.name}</a>
		<PageTitle>{sector.sector}</PageTitle>
	</div>
	<FormErrorNote message={form?.message ?? null} />
	<SectorPanel
		patchId={patch.id}
		{sector}
		coverage={data.coverage}
		searches={reading.searches}
		companyCount={companies.length}
		accountNames={data.accountNames}
	/>
	{#if companies.length === 0}
		<EmptyState message="No company is registered in this sector, as at the last register file." />
	{:else}
		<ul class="divide-y divide-hairline rounded-2xl border border-hairline">
			{#each companies as company (company.companyNumber)}
				<SectorCompanyRow {company} />
			{/each}
		</ul>
	{/if}
</div>
