<script lang="ts">
	import StoryboardFilmClip from './StoryboardFilmClip.svelte';
	import StoryboardFilmWords from './StoryboardFilmWords.svelte';
	import { FilmShapes, wordBands, type FilmShape } from '$lib/brand/film/filmFrame';
	import type { FilmCut } from '$lib/brand/film/filmCuts';
	import type { FilmShot } from '$lib/brand/film/storyboardFilm';

	let {
		shots,
		cut,
		seconds,
		shape,
		scale,
		isPlaying
	}: { shots: FilmShot[]; cut: FilmCut | null; seconds: number; shape: FilmShape; scale: number; isPlaying: boolean } = $props();

	const size = $derived(FilmShapes[shape]);
	const shot = $derived(cut === null ? null : shots[cut.shotIndex]);
	const secondsIn = $derived(cut === null ? 0 : seconds - cut.startSeconds);
	const frameStyle = $derived(
		`width: ${size.width}px; height: ${size.height}px; transform: scale(${scale}); transform-origin: top left;` +
			' background: var(--brand-colour-surface, var(--color-night));'
	);
</script>

<div class="absolute top-0 left-0 overflow-hidden" style={frameStyle}>
	{#if shot !== null}
		{#if shot.clip !== null}
			{#key cut?.shotIndex}
				<StoryboardFilmClip clip={shot.clip} {secondsIn} {isPlaying} />
			{/key}
		{/if}
		<StoryboardFilmWords {shot} band={wordBands[shape][shot.wordsAt]} />
	{/if}
</div>
