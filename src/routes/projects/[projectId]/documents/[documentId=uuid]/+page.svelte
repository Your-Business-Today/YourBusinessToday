<script lang="ts">
	import DocumentReading from '$lib/components/projects/documents/DocumentReading.svelte';
	import ProjectPageHeader from '$lib/components/projects/ProjectPageHeader.svelte';

	let { data } = $props();

	const { project, document } = $derived(data);
</script>

<svelte:head>
	<title>{document.title} — {project.name} — Your Business Today</title>
</svelte:head>

<div class="print:hidden">
	<ProjectPageHeader {project} />
</div>

<DocumentReading reading={data} />
