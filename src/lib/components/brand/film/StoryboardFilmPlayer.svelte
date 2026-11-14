<script lang="ts">
	import StoryboardFilmControls from './StoryboardFilmControls.svelte';
	import StoryboardFilmFrame from './StoryboardFilmFrame.svelte';
	import StoryboardFilmMusic from './StoryboardFilmMusic.svelte';
	import { cutAt, filmCutsOf, filmLengthOf } from '$lib/brand/film/filmCuts';
	import { filmLookStyleOf, type StoryboardFilm } from '$lib/brand/film/storyboardFilm';
	import { filmShapeOf, FilmShapes, type FilmShape } from '$lib/brand/film/filmFrame';
	import { followSize, runFrameLoop } from '$lib/components/promo/frameLoop';
	import { PromoClock } from '$lib/components/promo/promoClock.svelte';
	import { onMount } from 'svelte';

	let { film }: { film: StoryboardFilm } = $props();

	const cuts = $derived(filmCutsOf(film.shots.map((shot) => shot.seconds)));
	const clock = $derived(new PromoClock(filmLengthOf(cuts)));
	const cut = $derived(cutAt(cuts, clock.seconds));
	const firstClip = $derived(film.shots.find((shot) => shot.clip !== null)?.clip ?? null);
	let shape: FilmShape = $state('wide');
	let stageWidth = $state(0);
	let stage: HTMLDivElement | undefined = $state();
	let probe: HTMLImageElement | undefined = $state();
	let videoProbe: HTMLVideoElement | undefined = $state();
	const scale = $derived(stageWidth / FilmShapes[shape].width);
	const aspectStyle = $derived(`aspect-ratio: ${FilmShapes[shape].width} / ${FilmShapes[shape].height};`);

	onMount(() => runFrameLoop((frameTime) => clock.advance(frameTime)));
	$effect(() => {
		if (stage === undefined) return;
		return followSize(stage, (width) => (stageWidth = width), 1);
	});

	function measure(width: number, height: number) {
		shape = filmShapeOf(width, height);
	}
</script>

{#if firstClip !== null}
	<div class="hidden">
		{#if firstClip.isVideo}
			<video bind:this={videoProbe} src={firstClip.url} preload="metadata" muted onloadedmetadata={() => measure(videoProbe?.videoWidth ?? 0, videoProbe?.videoHeight ?? 0)}></video>
		{:else}
			<img bind:this={probe} src={firstClip.url} alt="" onload={() => measure(probe?.naturalWidth ?? 0, probe?.naturalHeight ?? 0)} />
		{/if}
	</div>
{/if}
<div class="flex flex-col gap-3">
	<div bind:this={stage} class="relative mx-auto w-full max-w-3xl overflow-hidden" style={`${aspectStyle} ${filmLookStyleOf(film.look)}`}>
		<StoryboardFilmFrame shots={film.shots} {cut} seconds={clock.seconds} {shape} {scale} isPlaying={clock.isPlaying} />
	</div>
	<StoryboardFilmControls {clock} {cuts} />
	{#if film.musicUrl !== null}
		<StoryboardFilmMusic url={film.musicUrl} seconds={clock.seconds} isPlaying={clock.isPlaying} />
	{/if}
</div>
