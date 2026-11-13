import {
	AdditiveBlending,
	BufferGeometry,
	Float32BufferAttribute,
	Group,
	LineBasicMaterial,
	LineSegments,
	Points,
	PointsMaterial,
	type Texture
} from 'three';
import { crossesZone, linkPositions, linksAmong, type ClearZone } from './ambientLinks';
import { sampleInsideBrain } from './brainShape';
import { SILVER } from './constellationPalette';

export type { ClearZone } from './ambientLinks';

const AMBIENT_NEURON_COUNT = 850;
const POINT_SIZE = 0.08;
const FULL_POINT_OPACITY = 0.45;
const FULL_LINE_OPACITY = 0.1;
const DIMMED_SHARE = 0.35;

export type AmbientNeuralWeb = {
	group: Group;
	keepClearOf: (zones: ClearZone[]) => void;
	setFocus: (contextKey: string | null) => void;
	dispose: () => void;
};

export function createAmbientNeuralWeb(glowTexture: Texture): AmbientNeuralWeb {
	const anchors = Array.from({ length: AMBIENT_NEURON_COUNT }, () =>
		sampleInsideBrain(Math.random)
	);
	const pointsGeometry = new BufferGeometry().setFromPoints(anchors);
	const pointsMaterial = new PointsMaterial({
		map: glowTexture,
		color: SILVER,
		size: POINT_SIZE,
		transparent: true,
		opacity: FULL_POINT_OPACITY,
		blending: AdditiveBlending,
		depthWrite: false
	});
	const links = linksAmong(anchors);
	const linesGeometry = new BufferGeometry();
	const linesMaterial = new LineBasicMaterial({
		color: SILVER,
		transparent: true,
		opacity: FULL_LINE_OPACITY,
		blending: AdditiveBlending,
		depthWrite: false
	});
	const group = new Group();
	group.add(new Points(pointsGeometry, pointsMaterial), new LineSegments(linesGeometry, linesMaterial));

	function keepClearOf(zones: ClearZone[]): void {
		const clearLinks = links.filter((link) => zones.every((zone) => !crossesZone(link, zone)));
		linesGeometry.setAttribute('position', new Float32BufferAttribute(linkPositions(clearLinks), 3));
	}

	function setFocus(contextKey: string | null): void {
		const share = contextKey === null ? 1 : DIMMED_SHARE;
		pointsMaterial.opacity = FULL_POINT_OPACITY * share;
		linesMaterial.opacity = FULL_LINE_OPACITY * share;
	}

	function dispose(): void {
		pointsGeometry.dispose();
		pointsMaterial.dispose();
		linesGeometry.dispose();
		linesMaterial.dispose();
	}

	keepClearOf([]);
	return { group, keepClearOf, setFocus, dispose };
}
