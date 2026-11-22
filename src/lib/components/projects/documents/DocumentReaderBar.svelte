<script lang="ts">
	import { documentDownloadHref, documentsHref, writtenDownloadKinds } from './documentAddresses';
	import { headerButtonClasses } from '$lib/components/workspace/workspaceStyles';
	import type { ProjectDocument } from '$lib/projectDocuments/projectDocument';

	let { document }: { document: ProjectDocument } = $props();
</script>

<div class="flex flex-wrap items-center justify-between gap-3 print:hidden">
	<a href={documentsHref(document.projectId)} class="font-display text-xs text-chalk-muted transition hover:text-chalk">← Documents</a>
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
