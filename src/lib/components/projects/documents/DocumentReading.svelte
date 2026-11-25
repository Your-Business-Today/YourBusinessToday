<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import DocumentFileView from './DocumentFileView.svelte';
	import DocumentInputList from './DocumentInputList.svelte';
	import DocumentProse from '$lib/components/admin/documents/DocumentProse.svelte';
	import DocumentReaderBar from './DocumentReaderBar.svelte';
	import DocumentVersionList from './DocumentVersionList.svelte';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';
	import type { DocumentVersion } from '$lib/projectDocuments/documentVersion';
	import type { KeptDocument } from '$lib/projectDocuments/projectDocument';
	import type { ShownInputRequest } from '$lib/projectDocuments/documentInputRequest';

	type Reading = {
		document: KeptDocument;
		versions: DocumentVersion[];
		inputRequests: ShownInputRequest[];
		documentHtml: string | null;
		viewUrl: string | null;
	};

	let { reading }: { reading: Reading } = $props();

	const { document, versions, inputRequests, documentHtml, viewUrl } = $derived(reading);
</script>

<div class={workspaceBodyClasses}>
	<DocumentReaderBar {document} />
	<article class="mx-auto flex w-full max-w-3xl flex-col gap-4 py-6 print:py-0">
		{#if documentHtml !== null}
			<DocumentProse {documentHtml} />
		{:else if viewUrl !== null}
			<DocumentFileView {document} {viewUrl} />
		{/if}
	</article>
	<div class="mx-auto grid w-full max-w-3xl gap-6 print:hidden sm:grid-cols-2">
		<DashboardPanel title="Versions" count={versions.length} isPadded>
			<DocumentVersionList {document} {versions} />
		</DashboardPanel>
		<DashboardPanel title="Input asked" count={inputRequests.length} isPadded>
			<DocumentInputList {inputRequests} />
		</DashboardPanel>
	</div>
</div>
