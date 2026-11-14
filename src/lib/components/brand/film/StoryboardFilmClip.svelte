<script lang="ts">
	import { keepMediaAt } from './keepMediaAt';
	import type { FilmClip } from '$lib/brand/film/storyboardFilm';

	let { clip, secondsIn, isPlaying }: { clip: FilmClip; secondsIn: number; isPlaying: boolean } = $props();

	let video: HTMLVideoElement | undefined = $state();
	const allowedDriftSeconds = 0.25;

	$effect(() => {
		if (video === undefined) return;
		keepMediaAt(video, secondsIn, isPlaying, allowedDriftSeconds);
	});
</script>

{#if clip.isVideo}
	<video bind:this={video} src={clip.url} muted playsinline preload="auto" class="absolute inset-0 h-full w-full object-contain"></video>
{:else}
	<img src={clip.url} alt="" class="absolute inset-0 h-full w-full object-contain" />
{/if}
