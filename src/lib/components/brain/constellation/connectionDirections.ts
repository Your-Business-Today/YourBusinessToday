import type { Vector3 } from 'three';
import { strandHeadingsOf } from './synapseHeadings';
import type { ConstellationModel } from './constellationTypes';

export function connectionDirectionsOf(model: ConstellationModel): Map<string, Vector3[]> {
	const directions = new Map<string, Vector3[]>();
	for (const synapse of model.synapses) {
		if (synapse.from.distanceToSquared(synapse.to) === 0) continue;
		const headings = strandHeadingsOf(synapse);
		record(directions, synapse.fromSlug, headings.leaving);
		record(directions, synapse.toSlug, headings.arriving);
	}
	return directions;
}

function record(directions: Map<string, Vector3[]>, slug: string, heading: Vector3): void {
	const known = directions.get(slug) ?? [];
	known.push(heading);
	directions.set(slug, known);
}
