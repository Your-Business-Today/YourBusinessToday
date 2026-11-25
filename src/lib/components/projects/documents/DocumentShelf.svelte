<script lang="ts">
	import DocumentSectionList from './DocumentSectionList.svelte';
	import DocumentShelfEmpty from './DocumentShelfEmpty.svelte';
	import { documentShelvesOf } from '$lib/projectDocuments/documentShelves';
	import type { KeptDocument } from '$lib/projectDocuments/projectDocument';

	let { documents, ownerName }: { documents: KeptDocument[]; ownerName: string } = $props();

	const shelves = $derived(documentShelvesOf(documents));
</script>

{#if shelves.length === 0}
	<DocumentShelfEmpty {ownerName} />
{:else}
	<div class="flex flex-col gap-10">
		{#each shelves as shelf (shelf.flow)}
			<section class="flex flex-col gap-6">
				<h2 class="font-display text-2xl font-semibold text-chalk">{shelf.heading}</h2>
				{#each shelf.sections as section (section.name)}
					<DocumentSectionList {section} />
				{/each}
			</section>
		{/each}
	</div>
{/if}
