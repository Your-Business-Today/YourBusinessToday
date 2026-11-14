<script lang="ts">
	import { FilmType, headlineSizeFor } from '$lib/brand/film/fitHeadline';
	import { ShotWordPlaces } from '$lib/brand/content/contentPiece';
	import type { FilmShot } from '$lib/brand/film/storyboardFilm';
	import type { WordBand } from '$lib/brand/film/filmFrame';

	let { shot, band }: { shot: FilmShot; band: WordBand } = $props();

	const sideLineCount = $derived([shot.overline, shot.underline].filter((line) => line !== '').length);
	const headlineSize = $derived(headlineSizeFor(shot.headline, band, sideLineCount));
	const bandStyle = $derived(`left: ${band.x}px; top: ${band.y}px; width: ${band.width}px; height: ${band.height}px;`);
	const isAtBottom = $derived(shot.wordsAt === ShotWordPlaces.bottom);
	const textColour = 'color: var(--brand-colour-caption-text, var(--color-chalk));';
	const sideLineStyle = `font-size: ${FilmType.sideLineSize}px; line-height: ${FilmType.headlineLineHeight};`;
	const headlineStyle = $derived(
		`font-size: ${headlineSize}px; line-height: ${FilmType.headlineLineHeight}; font-weight: ${FilmType.headlineWeight};` +
			' font-family: var(--brand-type-display-family, var(--font-display));'
	);
	const dotStyle = `width: ${FilmType.sideLineSize / 3}px; height: ${FilmType.sideLineSize / 3}px; background: var(--brand-colour-accent, var(--color-signal));`;
	const gapStyle = `gap: ${FilmType.sideLineGap}px;`;
</script>

<div class={['absolute flex flex-col', isAtBottom ? 'justify-end' : 'justify-start']} style={`${bandStyle} ${textColour} ${gapStyle}`}>
	{#if shot.overline}
		<p class="flex items-center gap-3" style={sideLineStyle}>
			<span class="inline-block shrink-0 rounded-full" style={dotStyle}></span>{shot.overline}
		</p>
	{/if}
	{#if shot.headline}
		<p class="break-words" style={headlineStyle}>{shot.headline}</p>
	{/if}
	{#if shot.underline}
		<p class="opacity-80" style={sideLineStyle}>{shot.underline}</p>
	{/if}
</div>
