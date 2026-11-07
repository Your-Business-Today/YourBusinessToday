import { Vector3 } from 'three';
import { beatsInto } from '../promoTimeline';
import { easeInOutCubic, easeOutExpo, mix, progressBetween } from '../promoMotion';
import { randomBetween, randomSigned, type RandomSource } from '../promoRandom';
import { offsetFrom, promoSets, vectorOf } from './promoSets';
import { mapStations } from './tubeMapLayout';

export type Fragment = {
	landing: Vector3;
	phase: number;
	spin: number;
	radius: number;
	height: number;
	lift: number;
	tumble: Vector3;
	burstDelay: number;
	fallDelay: number;
};

export type FragmentPose = { position: Vector3; turn: Vector3; scale: number };

const cloud = { innerRadius: 3.5, outerRadius: 15, height: 5.5, lift: 2.2, spin: 0.5, tumble: 1.6 };
const burst = { beats: 1.4, spreadBeats: 0.5 };
const fall = { leadBeats: 1.8, beats: 2.4, spreadBeats: 3, shrinkTo: 0.3, landingJitter: 0.9, landingHeight: 0.35 };
const unseen = 0;

function landingFor(index: number, random: RandomSource): Vector3 {
	const station = mapStations[index % mapStations.length];
	const jitterX = randomSigned(random, fall.landingJitter);
	const jitterZ = randomSigned(random, fall.landingJitter);
	return offsetFrom(promoSets.map, station.x + jitterX, fall.landingHeight, station.z + jitterZ);
}

export function createFragment(index: number, random: RandomSource): Fragment {
	return {
		landing: landingFor(index, random),
		phase: randomBetween(random, 0, Math.PI * 2),
		spin: randomBetween(random, 0.3, 1) * cloud.spin * (random() < 0.5 ? -1 : 1),
		radius: randomBetween(random, cloud.innerRadius, cloud.outerRadius),
		height: randomSigned(random, cloud.height),
		lift: randomBetween(random, 0.5, cloud.lift),
		tumble: new Vector3(randomSigned(random, cloud.tumble), randomSigned(random, cloud.tumble), randomSigned(random, cloud.tumble)),
		burstDelay: randomBetween(random, 0, burst.spreadBeats),
		fallDelay: randomBetween(random, 0, fall.spreadBeats)
	};
}

function swirlPlace(fragment: Fragment, seconds: number): Vector3 {
	const angle = fragment.phase + seconds * fragment.spin;
	const rise = Math.sin(angle * 1.7 + fragment.phase) * fragment.lift;
	const centre = promoSets.signal;
	return offsetFrom(centre, Math.cos(angle) * fragment.radius, fragment.height + rise, Math.sin(angle) * fragment.radius);
}

/** Where a fragment is: burst out of the dot, swirling in the noise, then dropping onto its station on the map. */
export function fragmentPose(fragment: Fragment, seconds: number): FragmentPose {
	const noiseBeats = beatsInto('noise', seconds) - fragment.burstDelay;
	const mapBeats = beatsInto('map', seconds) + fall.leadBeats - fragment.fallDelay;
	const burstOut = easeOutExpo(progressBetween(noiseBeats, 0, burst.beats));
	const fallen = easeInOutCubic(progressBetween(mapBeats, 0, fall.beats));
	const swirl = vectorOf(promoSets.signal).lerp(swirlPlace(fragment, seconds), burstOut);
	const position = swirl.lerp(fragment.landing, fallen);
	const turn = fragment.tumble.clone().multiplyScalar(seconds * (1 - fallen));
	const isShowing = noiseBeats > 0 && fallen < 1;
	const scale = isShowing ? burstOut * mix(1, fall.shrinkTo, fallen) : unseen;
	return { position, turn, scale };
}
