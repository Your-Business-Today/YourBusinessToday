<script lang="ts">
	import LibrarySearchBox from '$lib/components/projects/library/LibrarySearchBox.svelte';
	import LibrarySearchResults from '$lib/components/projects/library/LibrarySearchResults.svelte';
	import ProjectPageHeader from '$lib/components/projects/ProjectPageHeader.svelte';
	import VideoLibrary from '$lib/components/projects/videos/VideoLibrary.svelte';
	import VideoLibraryTabs from '$lib/components/projects/videos/VideoLibraryTabs.svelte';
	import { videoLibraryWords } from '$lib/projectVideos/videoLibraries';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data } = $props();

	const project = $derived(data.project);
	const library = $derived(data.library);
	const libraryName = $derived(videoLibraryWords[library].name);
</script>

<svelte:head>
	<title>{libraryName} videos — {project.name} — Your Business Today</title>
</svelte:head>

<ProjectPageHeader {project} />

<div class={workspaceBodyClasses}>
	<VideoLibraryTabs projectId={project.id} {library} />
	<LibrarySearchBox search={data.search} />
	{#if data.search === null}
		<VideoLibrary videos={data.videos} projectName={project.name} {library} />
	{:else}
		<LibrarySearchResults search={data.search} />
	{/if}
</div>
