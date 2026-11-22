<script lang="ts">
	import DocumentShelf from '$lib/components/projects/documents/DocumentShelf.svelte';
	import ProjectPageHeader from '$lib/components/projects/ProjectPageHeader.svelte';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data } = $props();

	const project = $derived(data.project);
</script>

<svelte:head>
	<title>Documents — {project.name} — Your Business Today</title>
</svelte:head>

<ProjectPageHeader {project} />

<div class={workspaceBodyClasses}>
	<DocumentShelf documents={data.documents} projectName={project.name} />
</div>
