<script lang="ts">
	import { goto } from '$app/navigation';
	import VideoDetailsChange from './VideoDetailsChange.svelte';
	import VideoRoute from './VideoRoute.svelte';
	import { videoLineClasses } from './videoLineClasses';
	import { watchHref, type NowWatching } from './videoWatching';

	let { watching }: { watching: NowWatching } = $props();

	const { video, nextVideo, section } = $derived(watching);
	const line = $derived(videoLineClasses[section.lineColour]);

	function playNextStop() {
		if (nextVideo === null) return;
		goto(watchHref(nextVideo), { noScroll: true, keepFocus: true });
	}
</script>

<div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
	<article class="flex min-w-0 flex-col gap-4">
		{#key video.id}
			<video
				src={video.filmUrl}
				poster={video.thumbnailUrl ?? undefined}
				controls
				autoplay
				playsinline
				onended={playNextStop}
				class="aspect-video w-full border border-hairline bg-night"
			>
				<track kind="captions" src={video.captionsUrl ?? undefined} srclang="en" label="English" default />
			</video>
		{/key}
		<div class="flex flex-col gap-2">
			<p class={`font-display text-sm font-medium ${line.text}`}>{section.name}</p>
			<h2 class="font-display text-2xl font-medium text-chalk">{video.title}</h2>
			{#if video.description !== ''}
				<p class="max-w-3xl text-sm whitespace-pre-line text-chalk-muted">{video.description}</p>
			{/if}
			<VideoDetailsChange {video} />
			{#if nextVideo !== null}
				<p class="text-sm text-chalk-subtle">
					Next stop: <a href={watchHref(nextVideo)} class="font-medium text-chalk hover:text-go">{nextVideo.title}</a>
				</p>
			{/if}
		</div>
	</article>
	<VideoRoute {section} {line} watchingId={video.id} />
</div>
