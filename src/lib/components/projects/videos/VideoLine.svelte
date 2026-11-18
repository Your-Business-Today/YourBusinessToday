<script lang="ts">
	import VideoStop from './VideoStop.svelte';
	import { sectionRunningSeconds } from './videoWatching';
	import { videoLineClasses } from './videoLineClasses';
	import { videoRunningTime } from '$lib/projectVideos/videoRunningTime';
	import type { VideoSection } from '$lib/projectVideos/videoSections';
	import type { WatchableVideo } from '$lib/projectVideos/projectVideo';

	let { section, lineNumber }: { section: VideoSection<WatchableVideo>; lineNumber: number } = $props();

	const line = $derived(videoLineClasses[section.lineColour]);
	const videos = $derived(section.videos);
	const lastStopIndex = $derived(videos.length - 1);
	const stopCount = $derived(videos.length === 1 ? '1 stop' : `${videos.length} stops`);
	const runningTime = $derived(videoRunningTime(sectionRunningSeconds(section)));
</script>

<section class="flex flex-col gap-4" aria-labelledby={`video-line-${lineNumber}`}>
	<header class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
		<span class={`h-3 w-8 self-center ${line.rail}`} aria-hidden="true"></span>
		<h2 id={`video-line-${lineNumber}`} class="font-display text-lg font-semibold text-chalk">{section.name}</h2>
		<span class="text-xs font-medium text-chalk-subtle">{stopCount}{runningTime === '' ? '' : ` · ${runningTime} end to end`}</span>
	</header>
	<ol class="scrollbar-hidden -mx-4 flex snap-x scroll-px-4 gap-6 overflow-x-auto px-4 pb-2 sm:mx-0 sm:scroll-px-0 sm:px-0">
		{#each videos as video, stopIndex (video.id)}
			<VideoStop {video} {line} stopNumber={stopIndex + 1} isFirstStop={stopIndex === 0} isLastStop={stopIndex === lastStopIndex} />
		{/each}
	</ol>
</section>
