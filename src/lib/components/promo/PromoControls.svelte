<script lang="ts">
	import LineIcon from '$lib/components/site/LineIcon.svelte';
	import PromoChapterBar from './PromoChapterBar.svelte';
	import { clockFace, type PromoClock } from './promoClock.svelte';

	let {
		clock,
		isSoundOn,
		ontogglesound
	}: { clock: PromoClock; isSoundOn: boolean; ontogglesound: () => void } = $props();

	const timeShown = $derived(`${clockFace(clock.seconds)} / ${clockFace(clock.durationSeconds)}`);
	const buttonClasses = 'grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full text-chalk hover:bg-chalk/10';
</script>

<div
	class={[
		'absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-night/90 to-transparent px-3 pt-8 pb-2 transition-opacity duration-300 md:px-5',
		clock.isPlaying ? 'opacity-0 group-hover:opacity-100 focus-within:opacity-100' : 'opacity-100'
	]}
>
	<button type="button" class={buttonClasses} onclick={() => clock.toggle()} aria-label={clock.isPlaying ? 'Pause' : 'Play'}>
		<LineIcon kind={clock.isPlaying ? 'pause' : 'play'} class="h-5 w-5" />
	</button>
	<PromoChapterBar seconds={clock.seconds} onseek={(seconds) => clock.seek(seconds)} />
	<span class="shrink-0 text-xs text-chalk/70 tabular-nums">{timeShown}</span>
	<button
		type="button"
		class={buttonClasses}
		onclick={ontogglesound}
		aria-label={isSoundOn ? 'Turn the sound off' : 'Turn the sound on'}
		aria-pressed={isSoundOn}
	>
		<LineIcon kind={isSoundOn ? 'sound' : 'mute'} class="h-5 w-5" />
	</button>
</div>
