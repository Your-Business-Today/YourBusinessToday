<script lang="ts">
	import { onMount } from 'svelte';
	import { promoDurationSeconds } from '$lib/promo/promoTimeline';
	import { createPromoScene, type PromoScene } from '$lib/promo/scene/promoScene';
	import PromoOverlay from './PromoOverlay.svelte';
	import { PromoClock } from './promoClock.svelte';
	import { keyActionFor } from './promoKeys';
	import { PromoOrbit } from './promoOrbit';
	import { filmScene, playScene } from './promoRunners';
	import { PromoSoundtrack } from './promoSoundtrack.svelte';

	let { isFilming = false }: { isFilming?: boolean } = $props();

	const stageLabel = `Your Business Today in ${promoDurationSeconds} seconds. Space plays and pauses, the arrow keys move between chapters and M turns the sound on.`;
	const clock = new PromoClock(promoDurationSeconds);
	const orbit = new PromoOrbit();
	const soundtrack = new PromoSoundtrack();
	const playhead = { clock, orbit, soundtrack };
	let isReady = $state(false);
	let canvas: HTMLCanvasElement;
	let stage: HTMLDivElement;

	function grab(event: PointerEvent): void {
		canvas.setPointerCapture(event.pointerId);
		orbit.grab(event.clientX, event.clientY);
	}

	function release(): void {
		orbit.release();
		if (!orbit.wasDragged) clock.toggle();
	}

	function pressKey(event: KeyboardEvent): void {
		const isTypingOrPressing = event.target instanceof HTMLElement && event.target.closest('button, a, input, textarea, select');
		if (isTypingOrPressing) return;
		const seek = (seconds: number) => clock.seek(seconds);
		const actions = { toggle: () => clock.toggle(), seek, toggleSound: () => soundtrack.toggle() };
		const action = keyActionFor(event.key, clock.seconds, actions);
		if (!action) return;
		event.preventDefault();
		action();
	}

	onMount(() => {
		let stop = () => {};
		let builtScene: PromoScene | null = null;
		createPromoScene(canvas, stage).then((scene) => {
			builtScene = scene;
			isReady = true;
			stop = isFilming ? filmScene(scene, stage, playhead) : playScene(scene, stage, playhead);
		});
		return () => {
			stop();
			soundtrack.dispose();
			builtScene?.dispose();
		};
	});
</script>

<svelte:window onkeydown={pressKey} />

<div
	bind:this={stage}
	class={[
		'group overflow-hidden bg-night select-none [container-type:inline-size]',
		isFilming ? 'fixed inset-0 z-50' : 'relative aspect-video w-full md:rounded-2xl'
	]}
	aria-label={stageLabel}
>
	<canvas
		bind:this={canvas}
		class="absolute inset-0 h-full w-full cursor-grab touch-none active:cursor-grabbing"
		onpointerdown={grab}
		onpointermove={(event) => orbit.drag(event.clientX, event.clientY)}
		onpointerup={release}
		onpointercancel={() => orbit.release()}
	></canvas>
	<PromoOverlay {clock} {soundtrack} {isFilming} {isReady} />
</div>
