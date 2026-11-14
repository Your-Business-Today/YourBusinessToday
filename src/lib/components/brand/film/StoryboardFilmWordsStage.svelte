<script lang="ts">
	import StoryboardFilmWords from './StoryboardFilmWords.svelte';
	import { cutAt, filmCutsOf, filmLengthOf } from '$lib/brand/film/filmCuts';
	import { filmLookStyleOf, type StoryboardFilm } from '$lib/brand/film/storyboardFilm';
	import { FilmShapes, wordBands, type FilmShape } from '$lib/brand/film/filmFrame';
	import { offerFilming } from '$lib/components/promo/promoFilming';
	import { onMount, tick } from 'svelte';

	let { film, shape }: { film: StoryboardFilm; shape: FilmShape } = $props();

	const noSoundtrack = '';
	const clearBackground = 'transparent';
	const cuts = $derived(filmCutsOf(film.shots.map((shot) => shot.seconds)));
	const size = $derived(FilmShapes[shape]);
	let seconds = $state(0);
	const cut = $derived(cutAt(cuts, seconds));
	const shot = $derived(cut === null ? null : film.shots[cut.shotIndex]);
	const stageStyle = $derived(`width: ${size.width}px; height: ${size.height}px; ${filmLookStyleOf(film.look)}`);

	async function drawMoment(moment: number): Promise<void> {
		seconds = moment;
		await tick();
		const { fonts } = document;
		await fonts.ready;
	}

	onMount(() => {
		const { documentElement, body } = document;
		[documentElement, body].forEach((element) => Object.assign(element.style, { background: clearBackground }));
		const { width, height } = size;
		const durationSeconds = filmLengthOf(cuts);
		return offerFilming({ durationSeconds, width, height, frame: drawMoment, soundtrack: async () => noSoundtrack });
	});
</script>

<div class="fixed top-0 left-0 overflow-hidden" style={stageStyle}>
	{#if shot !== null}
		<StoryboardFilmWords {shot} band={wordBands[shape][shot.wordsAt]} />
	{/if}
</div>
