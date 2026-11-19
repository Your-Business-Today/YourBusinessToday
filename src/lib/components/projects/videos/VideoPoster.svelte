<script lang="ts">
	import { videoRunningTime } from '$lib/projectVideos/videoRunningTime';
	import type { WatchableVideo } from '$lib/projectVideos/projectVideo';

	let { video }: { video: WatchableVideo } = $props();

	const runningTime = $derived(videoRunningTime(video.durationSeconds));
	const firstFrameUrl = $derived(video.filmUrl === null ? null : `${video.filmUrl}#t=0.5`);
</script>

<div class="relative aspect-video w-full overflow-hidden border border-hairline bg-night">
	{#if video.thumbnailUrl !== null}
		<img src={video.thumbnailUrl} alt="" loading="lazy" class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
	{:else if firstFrameUrl !== null}
		<video src={firstFrameUrl} preload="metadata" muted playsinline class="h-full w-full object-cover"></video>
	{/if}
	<span class="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
		<span class="flex h-12 w-12 items-center justify-center rounded-full bg-night/70 text-chalk">
			<svg viewBox="0 0 24 24" class="ml-0.5 h-5 w-5" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" /></svg>
		</span>
	</span>
	{#if runningTime !== ''}
		<span class="absolute right-2 bottom-2 rounded bg-night/80 px-1.5 py-0.5 font-display text-xs font-medium text-chalk">{runningTime}</span>
	{/if}
</div>
