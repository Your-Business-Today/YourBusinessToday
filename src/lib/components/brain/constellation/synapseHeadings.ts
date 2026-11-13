import { Vector3 } from 'three';
import { shareStreamFrom } from './pseudoRandom';
import type { Synapse } from './constellationTypes';

const HEADING_DRIFT = 0.3;

export type StrandHeadings = { leaving: Vector3; arriving: Vector3 };

export function strandHeadingsOf(synapse: Synapse): StrandHeadings {
	const nextShare = shareStreamFrom(`${synapse.fromSlug}->${synapse.toSlug}`);
	const leaving = drifted(synapse.to.clone().sub(synapse.from).normalize(), nextShare);
	const arriving = drifted(synapse.from.clone().sub(synapse.to).normalize(), nextShare);
	return { leaving, arriving };
}

function drifted(heading: Vector3, nextShare: () => number): Vector3 {
	const drift = new Vector3(nextShare() - 0.5, nextShare() - 0.5, nextShare() - 0.5);
	return heading.addScaledVector(drift, HEADING_DRIFT).normalize();
}
