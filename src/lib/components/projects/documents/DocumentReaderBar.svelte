<script lang="ts">
	import { documentDownloadHref, writtenDownloadKinds } from './documentAddress';
	import { documentsHrefOf } from '$lib/projectDocuments/documentOwner';
	import { headerButtonClasses } from '$lib/components/workspace/workspaceStyles';
	import type { KeptDocument } from '$lib/projectDocuments/projectDocument';

	let { document }: { document: KeptDocument } = $props();
</script>

<div class="flex flex-wrap items-center justify-between gap-3 print:hidden">
	<a href={documentsHrefOf(document.owner)} class="font-display text-xs text-chalk-muted transition hover:text-chalk">← Documents</a>
	<div class="flex flex-wrap items-center gap-2">
		{#if document.isWritten}
			<button type="button" onclick={() => window.print()} class={headerButtonClasses}>Print or save as PDF</button>
			<a href={documentDownloadHref(document, writtenDownloadKinds.markdown)} data-sveltekit-reload class={headerButtonClasses}>Markdown</a>
			<a href={documentDownloadHref(document, writtenDownloadKinds.word)} data-sveltekit-reload class={headerButtonClasses}>Download as Word</a>
		{:else}
			<a href={documentDownloadHref(document)} data-sveltekit-reload class={headerButtonClasses}>Download {document.filename}</a>
		{/if}
	</div>
</div>
