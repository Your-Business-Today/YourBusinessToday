import { Vector3 } from 'three';
import type { ConstellationModel, Neuron, Nucleus } from './constellationTypes';

const HOME_DISTANCE_SHARE = 2.1;
const SMALLEST_HOME_DISTANCE = 8;
const CLUSTER_DISTANCE_SHARE = 2.2;
const CLUSTER_CLEARANCE = 2.2;
const NEURON_DISTANCE = 1.7;
const NEURON_LIFT = 0.35;

export type Viewpoint = { position: Vector3; target: Vector3 };

const HOME_VIEW_DIRECTION = new Vector3(1, 0.42, 0.8).normalize();

export function homeViewpoint(model: ConstellationModel): Viewpoint {
	const reach = model.nuclei.reduce(
		(farthest, nucleus) => Math.max(farthest, nucleus.position.length() + nucleus.clusterRadius),
		0
	);
	const distance = Math.max(SMALLEST_HOME_DISTANCE, reach * HOME_DISTANCE_SHARE);
	return {
		position: HOME_VIEW_DIRECTION.clone().multiplyScalar(distance),
		target: new Vector3()
	};
}

export function contextViewpoint(nucleus: Nucleus): Viewpoint {
	const outward = outwardDirectionFrom(nucleus.position);
	const distance = nucleus.clusterRadius * CLUSTER_DISTANCE_SHARE + CLUSTER_CLEARANCE;
	const position = nucleus.position.clone().add(outward.multiplyScalar(distance));
	return { position, target: nucleus.position.clone() };
}

export function neuronViewpoint(neuron: Neuron, model: ConstellationModel): Viewpoint {
	const nucleus = model.nuclei.find((candidate) => candidate.slug === neuron.contextSlug);
	const centre = nucleus?.position ?? new Vector3();
	const outward = outwardDirectionFrom(neuron.position.clone().sub(centre));
	const position = neuron.position
		.clone()
		.add(outward.multiplyScalar(NEURON_DISTANCE))
		.add(new Vector3(0, NEURON_LIFT, 0));
	return { position, target: neuron.position.clone() };
}

function outwardDirectionFrom(offset: Vector3): Vector3 {
	if (offset.lengthSq() === 0) return new Vector3(0, 0.25, 1).normalize();
	return offset.clone().normalize();
}
