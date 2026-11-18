<script lang="ts">
	import VideoPoster from './VideoPoster.svelte';
	import { watchHref } from './videoWatching';
	import type { LineClasses } from './videoLineClasses';
	import type { WatchableVideo } from '$lib/projectVideos/projectVideo';

	let {
		video,
		stopNumber,
		line,
		isFirstStop,
		isLastStop
	}: { video: WatchableVideo; stopNumber: number; line: LineClasses; isFirstStop: boolean; isLastStop: boolean } = $props();
</script>

<li class="w-64 shrink-0 snap-start sm:w-72">
	<a href={watchHref(video)} class="group flex flex-col gap-3 focus:outline-none" aria-label={`Watch ${video.title}`}>
		<VideoPoster {video} />
		<div class="relative flex h-5 items-center" aria-hidden="true">
			<span class={`absolute top-1/2 h-1 -translate-y-1/2 ${line.rail} ${isFirstStop ? 'left-2.5' : '-left-3'} ${isLastStop ? 'right-0' : '-right-3'}`}></span>
			<span class={`relative flex h-5 w-5 items-center justify-center rounded-full border-4 bg-night ${line.ring}`}></span>
			<span class={`relative ml-2 bg-night px-1.5 font-display text-xs font-medium ${line.text}`}>Stop {stopNumber}</span>
		</div>
		<div class="flex flex-col gap-1">
			<h3 class="font-display text-base font-medium text-chalk group-hover:text-go group-focus-visible:text-go">{video.title}</h3>
			{#if video.description !== ''}
				<p class="line-clamp-2 text-sm text-chalk-subtle">{video.description}</p>
			{/if}
		</div>
	</a>
</li>
