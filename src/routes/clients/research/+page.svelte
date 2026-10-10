<script lang="ts">
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import ResearchQueryForm from '$lib/components/clients/ResearchQueryForm.svelte';
	import ResearchedProfileReview from '$lib/components/clients/ResearchedProfileReview.svelte';

	let { data, form } = $props();

	const { existingClient } = $derived(data);
	const researched = $derived(form?.researched);
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
		<h1 class="font-display text-3xl font-medium">Research a company</h1>
		<p class="text-chalk/70">
			Claude reads their public website and drafts the profile and the people. You check it
			before anything is saved.
		</p>
	</div>
	{#if !data.isClaudeConfigured}
		<FormErrorNote message="Claude is not configured on this server, so research is unavailable." />
	{:else}
		<ResearchQueryForm query={researched?.website ?? data.query} {clientId} />
	{/if}
	<FormErrorNote message={form?.message ?? null} />
	{#if researched !== undefined}
		<ResearchedProfileReview {researched} {clientId} />
	{/if}
</div>
