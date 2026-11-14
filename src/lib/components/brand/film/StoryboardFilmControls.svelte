<script lang="ts">
	import LineIcon from '$lib/components/site/LineIcon.svelte';
	import { clockFace, type PromoClock } from '$lib/components/promo/promoClock.svelte';
	import type { FilmCut } from '$lib/brand/film/filmCuts';

	let { clock, cuts }: { clock: PromoClock; cuts: FilmCut[] } = $props();

	const firstShotNumber = 1;
	const timeShown = $derived(`${clockFace(clock.seconds)} / ${clockFace(clock.durationSeconds)}`);
	const buttonClasses = 'grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full text-chalk hover:bg-chalk/10';
</script>

<div class="flex flex-wrap items-center gap-3">
	<button type="button" class={buttonClasses} onclick={() => clock.toggle()} aria-label={clock.isPlaying ? 'Pause' : 'Play'}>
		<LineIcon kind={clock.isPlaying ? 'pause' : 'play'} class="h-5 w-5" />
	</button>
	<span class="text-xs text-chalk-muted tabular-nums">{timeShown}</span>
	<div class="flex flex-wrap gap-1" role="group" aria-label="Jump to a shot">
		{#each cuts as cut (cut.shotIndex)}
			<button
				type="button"
				class="cursor-pointer rounded px-2 py-1 text-xs text-chalk-muted hover:bg-chalk/10"
				onclick={() => clock.seek(cut.startSeconds)}
				aria-label={`Jump to shot ${cut.shotIndex + firstShotNumber}`}
			>
				{cut.shotIndex + firstShotNumber}
			</button>
		{/each}
	</div>
</div>
