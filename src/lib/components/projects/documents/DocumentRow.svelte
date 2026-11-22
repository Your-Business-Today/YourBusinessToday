<script lang="ts">
	import { documentDownloadHref, documentHref } from './documentAddresses';
	import { documentKindWords } from './documentKinds';
	import { panelButtonClasses } from '$lib/components/workspace/workspaceStyles';
	import type { ProjectDocument } from '$lib/projectDocuments/projectDocument';

	let { document }: { document: ProjectDocument } = $props();
</script>

<li class="flex flex-wrap items-start justify-between gap-4 px-5 py-4">
	<div class="flex max-w-2xl flex-col gap-1">
		<a href={documentHref(document)} class="font-display text-chalk hover:text-go">{document.title}</a>
		{#if document.summary !== ''}
			<p class="text-sm text-chalk-muted">{document.summary}</p>
		{/if}
		<p class="text-xs text-chalk-subtle">{documentKindWords(document)}</p>
	</div>
	<div class="flex items-center gap-2">
		<a href={documentHref(document)} class={panelButtonClasses}>Read</a>
		<a href={documentDownloadHref(document)} data-sveltekit-reload class={panelButtonClasses}>Download</a>
	</div>
</li>
