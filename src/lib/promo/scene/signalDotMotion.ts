import type { Vector3 } from 'three';
import { beatsInto } from '../promoTimeline';
import { easeInCubic, easeInOutCubic, easeOutCubic, easeOutExpo, mix, progressBetween } from '../promoMotion';
import { fullStop } from './brandGlyphs';
import { offsetFrom, promoSets, vectorOf } from './promoSets';

export type Shockwave = { centre: Vector3; radius: number; opacity: number };

type WaveShape = { start: number; end: number; fromRadius: number; toRadius: number };

const ignition = { start: 0.25, end: 2 };
const burst = { swellEnd: 0.12, collapseEnd: 0.45, swellRadius: 1.7 };
const gathering = { start: 5.5, end: 7.6, radius: 1.25 };
const homecoming = { start: 1, end: 2.5, leap: 3 };
const burstWave: WaveShape = { start: 0, end: 3, fromRadius: 1, toRadius: 24 };
const landingWave: WaveShape = { start: 2.5, end: 6, fromRadius: fullStop.radius, toRadius: 15 };

function ignitionRadius(seconds: number): number {
	const signalBeats = beatsInto('signal', seconds);
	return easeOutExpo(progressBetween(signalBeats, ignition.start, ignition.end));
}

function burstRadius(noiseBeats: number): number {
	const swelling = easeOutCubic(progressBetween(noiseBeats, 0, burst.swellEnd));
	const collapsing = easeInCubic(progressBetween(noiseBeats, burst.swellEnd, burst.collapseEnd));
	return mix(1, burst.swellRadius, swelling) * (1 - collapsing);
}

function gatheringRadius(launchBeats: number): number {
	const gathered = easeOutExpo(progressBetween(launchBeats, gathering.start, gathering.end));
	return gathering.radius * gathered;
}

function homecomingRadius(brandBeats: number): number {
	const homeward = easeInOutCubic(progressBetween(brandBeats, homecoming.start, homecoming.end));
	return mix(gathering.radius, fullStop.radius, homeward);
}

/** How big the dot is: lit at the start, burst into the noise, gathered again at launch and set as the full stop. */
export function dotRadiusAt(seconds: number): number {
	const noiseBeats = beatsInto('noise', seconds);
	if (noiseBeats < 0) return ignitionRadius(seconds);
	const launchBeats = beatsInto('launch', seconds);
	if (launchBeats < gathering.start) return burstRadius(noiseBeats);
	const brandBeats = beatsInto('brand', seconds);
	if (brandBeats < homecoming.start) return gatheringRadius(launchBeats);
	return homecomingRadius(brandBeats);
}

/** Where the dot is: at the start until the launch, then in the middle of the gathering, then arcing out in front of the letters to its place. */
export function dotPlaceAt(seconds: number): Vector3 {
	const launchBeats = beatsInto('launch', seconds);
	if (launchBeats < 0) return vectorOf(promoSets.signal);
	const brandBeats = beatsInto('brand', seconds);
	const homeward = easeInOutCubic(progressBetween(brandBeats, homecoming.start, homecoming.end));
	const forward = Math.sin(Math.PI * homeward) * homecoming.leap;
	return offsetFrom(promoSets.app, fullStop.x * homeward, fullStop.y * homeward, forward);
}

function waveAt(beats: number, shape: WaveShape, centre: Vector3): Shockwave {
	const progress = progressBetween(beats, shape.start, shape.end);
	const isRunning = beats >= shape.start && beats < shape.end;
	const radius = mix(shape.fromRadius, shape.toRadius, easeOutExpo(progress));
	return { centre, radius, opacity: isRunning ? (1 - progress) ** 2 : 0 };
}

export function shockwaveAt(seconds: number): Shockwave {
	const burstShockwave = waveAt(beatsInto('noise', seconds), burstWave, vectorOf(promoSets.signal));
	if (burstShockwave.opacity > 0) return burstShockwave;
	const fullStopPlace = offsetFrom(promoSets.app, fullStop.x, fullStop.y, 0);
	return waveAt(beatsInto('brand', seconds), landingWave, fullStopPlace);
}
