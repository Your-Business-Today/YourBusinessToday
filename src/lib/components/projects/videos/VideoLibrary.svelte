<script lang="ts">
	import { page } from '$app/state';
	import VideoLibraryEmpty from './VideoLibraryEmpty.svelte';
	import VideoLine from './VideoLine.svelte';
	import VideoTheatre from './VideoTheatre.svelte';
	import { nowWatching, videoQueryKeys } from './videoWatching';
	import { videoSectionsOf } from '$lib/projectVideos/videoSections';
	import type { VideoLibrary } from '$lib/projectVideos/videoLibraries';
	import type { WatchableVideo } from '$lib/projectVideos/projectVideo';

	let { videos, projectName, library }: { videos: WatchableVideo[]; projectName: string; library: VideoLibrary } = $props();

	const { url } = $derived(page);
	const sections = $derived(videoSectionsOf(videos));
	const watchedId = $derived(url.searchParams.get(videoQueryKeys.watch));
	const watching = $derived(nowWatching(sections, watchedId));
</script>

{#if sections.length === 0}
	<VideoLibraryEmpty {projectName} {library} />
{:else}
	{#if watching !== null}
		<VideoTheatre {watching} />
	{/if}
	<div class="flex flex-col gap-10 border-t border-hairline pt-6">
		{#each sections as section, lineIndex (section.name)}
			<VideoLine {section} lineNumber={lineIndex + 1} />
		{/each}
	</div>
{/if}
