import { beatsInto } from '../promoTimeline';
import { easeInCubic, progressBetween } from '../promoMotion';

const gathering = { startBeat: 5, endBeat: 7.2 };

/** How far everything has been drawn back into the dot as the film goes live: 0 untouched, 1 gone. */
export function gatheredAt(seconds: number): number {
	const launchBeats = beatsInto('launch', seconds);
	return easeInCubic(progressBetween(launchBeats, gathering.startBeat, gathering.endBeat));
}
