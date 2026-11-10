<script lang="ts">
	import AskClaudeToResearch from '$lib/components/clients/AskClaudeToResearch.svelte';
	import PageTitle from '$lib/components/site/PageTitle.svelte';

	let { data } = $props();

	const { existingClient } = $derived(data);
	const clientId = $derived(existingClient?.id ?? null);
	const backHref = $derived(clientId === null ? '/clients' : `/clients/${clientId}`);
	const backLabel = $derived(existingClient === null ? 'Clients' : existingClient.name);
</script>

<svelte:head>
	<title>Research a company — Your Business Today</title>
</svelte:head>

<div class="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-16">
	<div class="flex flex-col gap-2">
		<a href={backHref} class="font-display text-sm text-chalk/50 hover:text-chalk">← {backLabel}</a>
		<PageTitle>Research a company with your Claude</PageTitle>
		<p class="text-chalk/70">
			Your own Claude does the reading: it finds the company's website, drafts the profile and the
			people, and saves them to the register once you have checked them.
		</p>
	</div>
	{#key clientId}
		<AskClaudeToResearch query={data.query} {clientId} />
	{/key}
</div>
