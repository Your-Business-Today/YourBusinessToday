<script lang="ts">
	import PageTitle from '$lib/components/site/PageTitle.svelte';
	import { fileViewingOf, fileViewings } from '$lib/projectDocuments/documentViewing';
	import type { KeptDocument } from '$lib/projectDocuments/projectDocument';

	let { document, viewUrl }: { document: KeptDocument; viewUrl: string } = $props();

	const viewing = $derived(fileViewingOf(document.mimeType));
</script>

<PageTitle>{document.title}</PageTitle>
{#if document.summary !== ''}
	<p class="text-chalk-muted">{document.summary}</p>
{/if}
{#if viewing === fileViewings.pdf}
	<iframe src={viewUrl} title={document.title} class="h-[80vh] w-full border border-hairline bg-white"></iframe>
{:else if viewing === fileViewings.picture}
	<img src={viewUrl} alt={document.title} class="w-full border border-hairline" />
{:else}
	<p class="text-sm text-chalk-muted">This file reads in its own program. Download it to open it.</p>
{/if}
