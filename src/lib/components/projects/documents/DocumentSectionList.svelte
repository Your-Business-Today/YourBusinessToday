<script lang="ts">
	import DocumentRow from './DocumentRow.svelte';
	import type { DocumentSection } from '$lib/projectDocuments/documentSections';
	import type { KeptDocument } from '$lib/projectDocuments/projectDocument';

	let { section }: { section: DocumentSection<KeptDocument> } = $props();
</script>

<section class="flex flex-col gap-3">
	<h3 class="font-display text-xl font-medium text-chalk">{section.name}</h3>
	<ul class="flex flex-col divide-y divide-hairline border border-hairline bg-carriage">
		{#each section.documents as document (document.id)}
			<DocumentRow {document} />
		{/each}
	</ul>
</section>
