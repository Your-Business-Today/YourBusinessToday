<script lang="ts">
	import DocumentFileView from '$lib/components/projects/documents/DocumentFileView.svelte';
	import DocumentProse from '$lib/components/admin/documents/DocumentProse.svelte';
	import DocumentReaderBar from '$lib/components/projects/documents/DocumentReaderBar.svelte';
	import ProjectPageHeader from '$lib/components/projects/ProjectPageHeader.svelte';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data } = $props();

	const project = $derived(data.project);
	const document = $derived(data.document);
</script>

<svelte:head>
	<title>{document.title} — {project.name} — Your Business Today</title>
</svelte:head>

<div class="print:hidden">
	<ProjectPageHeader {project} />
</div>

<div class={workspaceBodyClasses}>
	<DocumentReaderBar {document} />
	<article class="mx-auto flex w-full max-w-3xl flex-col gap-4 py-6 print:py-0">
		{#if data.documentHtml !== null}
			<DocumentProse documentHtml={data.documentHtml} />
		{:else if data.viewUrl !== null}
			<DocumentFileView {document} viewUrl={data.viewUrl} />
		{/if}
	</article>
</div>
