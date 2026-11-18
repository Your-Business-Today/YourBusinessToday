<script lang="ts">
	import ProjectPageHeader from '$lib/components/projects/ProjectPageHeader.svelte';
	import VideoLibrary from '$lib/components/projects/videos/VideoLibrary.svelte';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data } = $props();

	const project = $derived(data.project);
</script>

<svelte:head>
	<title>Videos — {project.name} — Your Business Today</title>
</svelte:head>

<ProjectPageHeader {project} />

<div class={workspaceBodyClasses}>
	<VideoLibrary videos={data.videos} projectName={project.name} />
</div>
