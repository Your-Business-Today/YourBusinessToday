<script lang="ts">
	import { videoRunningTime } from '$lib/projectVideos/videoRunningTime';
	import { watchHref } from './videoWatching';
	import type { LineClasses } from './videoLineClasses';
	import type { WatchableVideo } from '$lib/projectVideos/projectVideo';

	let { video, stopNumber, line, isWatching }: { video: WatchableVideo; stopNumber: number; line: LineClasses; isWatching: boolean } = $props();

	const runningTime = $derived(videoRunningTime(video.durationSeconds));
	const stopLabel = $derived(runningTime === '' ? `Stop ${stopNumber}` : `Stop ${stopNumber} · ${runningTime}`);
	const rowClasses = $derived(`relative flex items-center gap-4 px-6 py-3 transition hover:bg-carriage-raised ${isWatching ? 'bg-carriage-raised' : ''}`);
	const dotClasses = $derived(`relative h-5 w-5 shrink-0 rounded-full border-4 ${line.ring} ${isWatching ? line.rail : 'bg-night'}`);
	const titleClasses = $derived(`truncate text-sm font-medium ${isWatching ? 'text-chalk' : 'text-chalk-muted'}`);
</script>

<li>
	<a href={watchHref(video)} aria-current={isWatching ? 'true' : undefined} class={rowClasses}>
		<span class={dotClasses}></span>
		<span class="flex min-w-0 flex-col">
			<span class="font-display text-xs font-medium text-chalk-subtle">{stopLabel}</span>
			<span class={titleClasses}>{video.title}</span>
		</span>
	</a>
</li>
