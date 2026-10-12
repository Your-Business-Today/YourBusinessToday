<script lang="ts">
	import EmptyState from '$lib/components/site/EmptyState.svelte';
	import PageTitle from '$lib/components/site/PageTitle.svelte';
	import SightingRow from '$lib/components/clients/patches/SightingRow.svelte';

	let { data } = $props();

	const { patch, sightings } = $derived(data);
</script>

<svelte:head>
	<title>Sightings — {patch.name} — Your Business Today</title>
</svelte:head>

<div class="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-16">
	<div class="flex flex-col gap-2">
		<a href={`/clients/patches/${patch.id}`} class="font-display text-sm text-chalk/50 hover:text-chalk">← {patch.name}</a>
		<PageTitle>Sightings</PageTitle>
		<p class="text-chalk/70">Every business found on a public page while working this patch, newest first.</p>
	</div>
	{#if sightings.length === 0}
		<EmptyState message="Nothing sighted yet. Claim a sector, send your Claude to work it, and the businesses it finds land here." />
	{:else}
		<ul class="divide-y divide-hairline rounded-2xl border border-hairline">
			{#each sightings as sighting (sighting.id)}
				<SightingRow {sighting} seenByName={data.accountNames[sighting.seenByAccountId] ?? 'Former account'} />
			{/each}
		</ul>
	{/if}
</div>
