<script lang="ts">
	import DocumentAddForm from '$lib/components/projects/documents/DocumentAddForm.svelte';
	import DocumentShelf from '$lib/components/projects/documents/DocumentShelf.svelte';
	import LibrarySearchBox from '$lib/components/projects/library/LibrarySearchBox.svelte';
	import LibrarySearchResults from '$lib/components/projects/library/LibrarySearchResults.svelte';
	import ProjectPageHeader from '$lib/components/projects/ProjectPageHeader.svelte';
	import { dashboardGridClasses, workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data } = $props();

	const project = $derived(data.project);
</script>

<svelte:head>
	<title>Documents — {project.name} — Your Business Today</title>
</svelte:head>

<ProjectPageHeader {project} />

<div class={workspaceBodyClasses}>
	<LibrarySearchBox search={data.search} />
	<div class={dashboardGridClasses}>
		{#if data.search === null}
			<DocumentShelf documents={data.documents} ownerName={project.name} />
		{:else}
			<LibrarySearchResults search={data.search} />
		{/if}
		<DocumentAddForm />
	</div>
</div>
