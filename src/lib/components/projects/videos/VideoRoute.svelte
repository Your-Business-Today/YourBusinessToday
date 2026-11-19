<script lang="ts">
	import VideoRouteStop from './VideoRouteStop.svelte';
	import type { LineClasses } from './videoLineClasses';
	import type { VideoSection } from '$lib/projectVideos/videoSections';
	import type { WatchableVideo } from '$lib/projectVideos/projectVideo';

	let { section, line, watchingId }: { section: VideoSection<WatchableVideo>; line: LineClasses; watchingId: string } = $props();
</script>

<nav class="flex flex-col border border-hairline bg-carriage" aria-label={`Stops on ${section.name}`}>
	<p class="border-b border-hairline px-6 py-4 font-display text-lg font-semibold text-chalk">
		<span class={line.text}>On this line</span> · {section.name}
	</p>
	<ol class="relative flex flex-col py-3">
		<span class={`absolute top-6 bottom-6 left-8 w-1 ${line.rail}`} aria-hidden="true"></span>
		{#each section.videos as video, stopIndex (video.id)}
			<VideoRouteStop {video} {line} stopNumber={stopIndex + 1} isWatching={video.id === watchingId} />
		{/each}
	</ol>
</nav>
