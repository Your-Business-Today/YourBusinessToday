import { tick } from 'svelte';
import type { PromoScene } from '$lib/promo/scene/promoScene';
import { followSize, runFrameLoop } from './frameLoop';
import type { PromoClock } from './promoClock.svelte';
import { offerFilming } from './promoFilming';
import type { PromoOrbit } from './promoOrbit';
import type { PromoSoundtrack } from './promoSoundtrack.svelte';

export type PromoPlayhead = { clock: PromoClock; orbit: PromoOrbit; soundtrack: PromoSoundtrack };

const sharpestPixelRatio = 2;

/** Plays the film live: every frame moves the clock on, settles the camera, keeps the sound in step and draws. */
export function playScene(scene: PromoScene, stage: HTMLElement, { clock, orbit, soundtrack }: PromoPlayhead): () => void {
	const pixelRatio = Math.min(sharpestPixelRatio, window.devicePixelRatio);
	const stopFollowing = followSize(stage, scene.resize, pixelRatio);
	const stopLoop = runFrameLoop((frameTime, elapsedSeconds) => {
		clock.advance(frameTime);
		orbit.settle(elapsedSeconds);
		soundtrack.follow(clock.seconds, clock.isPlaying);
		scene.renderAt(clock.seconds, orbit.offset);
	});
	clock.play();
	return () => {
		stopLoop();
		stopFollowing();
	};
}

/** Hands the film to the recorder, which asks for one moment at a time and for the soundtrack once. */
export function filmScene(scene: PromoScene, stage: HTMLElement, { clock, orbit, soundtrack }: PromoPlayhead): () => void {
	const stopFollowing = followSize(stage, scene.resize, 1);
	const frame = async (seconds: number) => {
		clock.seek(seconds);
		await tick();
		scene.renderAt(seconds, orbit.offset);
	};
	const closeFilming = offerFilming({
		durationSeconds: clock.durationSeconds,
		frame,
		soundtrack: () => soundtrack.wavBase64()
	});
	return () => {
		closeFilming();
		stopFollowing();
	};
}
