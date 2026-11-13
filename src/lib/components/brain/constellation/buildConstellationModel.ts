import { Vector3 } from 'three';
import { brainPointFrom, isInsideBrain, lobeAnchorFor } from './brainShape';
import { pseudoRandomFrom } from './pseudoRandom';
import { synapsesOf } from './synapseModel';
import type { BrainContext, BrainPageLink, BrainPageSummary } from '$lib/data/brainTypes';
import type { ConstellationModel, Neuron, Nucleus } from './constellationTypes';

const GOLDEN_ANGLE_RADIANS = Math.PI * (3 - Math.sqrt(5));
const LOBE_BASE_RADIUS = 1.1;
const LOBE_GROWTH_PER_PAGE = 0.12;
const LOBE_DEPTH_NEAREST = 0.55;
const LOBE_DEPTH_SPREAD = 0.45;
const OFFSET_RETREAT_SHARE = 0.6;
const RETREAT_ATTEMPT_LIMIT = 6;

export function buildConstellationModel(
	contexts: BrainContext[],
	pageIndex: BrainPageSummary[],
	pageLinks: BrainPageLink[]
): ConstellationModel {
	const nuclei = contexts.map((context, index) => asNucleus(context, index, pageIndex));
	const neurons = pageIndex.map((page) => asNeuron(page, nuclei, pageIndex));
	return { nuclei, neurons, synapses: synapsesOf(neurons, nuclei, pageLinks) };
}

export function sphereDirection(index: number, count: number): Vector3 {
	if (count <= 1) return new Vector3(0, 0, 1);
	const altitude = 1 - (2 * (index + 0.5)) / count;
	const ringRadius = Math.sqrt(Math.max(0, 1 - altitude * altitude));
	const angle = index * GOLDEN_ANGLE_RADIANS;
	return new Vector3(Math.cos(angle) * ringRadius, altitude, Math.sin(angle) * ringRadius);
}

function asNucleus(context: BrainContext, index: number, pageIndex: BrainPageSummary[]): Nucleus {
	const pageCount = pageIndex.filter((page) => page.contextSlug === context.slug).length;
	return {
		slug: context.slug,
		name: context.name,
		summary: context.summary,
		isCoreDomain: context.isCoreDomain,
		position: lobeAnchorFor(index),
		clusterRadius: lobeRadiusFor(pageCount)
	};
}

function lobeRadiusFor(pageCount: number): number {
	return LOBE_BASE_RADIUS + LOBE_GROWTH_PER_PAGE * Math.sqrt(pageCount);
}

function asNeuron(page: BrainPageSummary, nuclei: Nucleus[], pageIndex: BrainPageSummary[]): Neuron {
	const nucleus = nuclei.find((candidate) => candidate.slug === page.contextSlug);
	if (nucleus === undefined) {
		return { ...page, position: brainPointFrom(page.slug), contextSlug: null };
	}
	const siblings = pageIndex.filter((candidate) => candidate.contextSlug === page.contextSlug);
	const rank = siblings.findIndex((candidate) => candidate.slug === page.slug);
	const depth = LOBE_DEPTH_NEAREST + LOBE_DEPTH_SPREAD * pseudoRandomFrom(page.slug);
	const offset = sphereDirection(rank, siblings.length).multiplyScalar(
		nucleus.clusterRadius * depth
	);
	return { ...page, position: settleInsideBrain(nucleus.position, offset), contextSlug: nucleus.slug };
}

function settleInsideBrain(anchor: Vector3, offset: Vector3): Vector3 {
	const settled = offset.clone();
	for (let attempt = 0; attempt < RETREAT_ATTEMPT_LIMIT; attempt += 1) {
		const candidate = anchor.clone().add(settled);
		if (isInsideBrain(candidate)) return candidate;
		settled.multiplyScalar(OFFSET_RETREAT_SHARE);
	}
	return anchor.clone();
}
