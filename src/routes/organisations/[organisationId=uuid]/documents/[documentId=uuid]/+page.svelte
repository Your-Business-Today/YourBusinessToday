<script lang="ts">
	import DocumentReading from '$lib/components/projects/documents/DocumentReading.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';

	let { data } = $props();

	const { document, pageOwner } = $derived(data);
</script>

<svelte:head>
	<title>{document.title} — {pageOwner.name} — Your Business Today</title>
</svelte:head>

<div class="print:hidden">
	<WorkspaceHeader crumbs={[]} title={document.title} />
</div>

<DocumentReading reading={data} />
