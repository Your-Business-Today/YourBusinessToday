import {
	AdditiveBlending,
	BufferGeometry,
	Float32BufferAttribute,
	Group,
	LineBasicMaterial,
	LineSegments,
	Points,
	PointsMaterial,
	type Texture,
	type Vector3
} from 'three';
import { crossesZone, linkPositions, linksAmong, type AmbientLink, type ClearZone } from './ambientLinks';
import { sampleInsideBrain } from './brainShape';
import { SILVER } from './constellationPalette';

export type { ClearZone } from './ambientLinks';

const AMBIENT_NEURON_COUNT = 850;
const POINT_SIZE = 0.08;
const FULL_POINT_OPACITY = 0.45;
const FULL_LINE_OPACITY = 0.1;
const DIMMED_SHARE = 0.35;
const FULL_SHARE = 1;
const POSITION_ATTRIBUTE = 'position';
const COORDINATES_PER_POINT = 3;
const glowingBlend = { transparent: true, blending: AdditiveBlending, depthWrite: false } as const;

/** The faint web of unnamed neurons that fills the brain's shape behind the pages, so it reads as a brain. */
export class AmbientNeuralWeb {
	readonly group = new Group();
	private readonly pointsGeometry: BufferGeometry;
	private readonly pointsMaterial: PointsMaterial;
	private readonly linesGeometry = new BufferGeometry();
	private readonly linesMaterial = new LineBasicMaterial({ color: SILVER, opacity: FULL_LINE_OPACITY, ...glowingBlend });
	private readonly links: AmbientLink[];

	constructor(glowTexture: Texture) {
		const anchors: Vector3[] = Array.from({ length: AMBIENT_NEURON_COUNT }, () => sampleInsideBrain(Math.random));
		this.pointsGeometry = new BufferGeometry().setFromPoints(anchors);
		this.pointsMaterial = new PointsMaterial({ map: glowTexture, color: SILVER, size: POINT_SIZE, opacity: FULL_POINT_OPACITY, ...glowingBlend });
		this.links = linksAmong(anchors);
		this.group.add(new Points(this.pointsGeometry, this.pointsMaterial), new LineSegments(this.linesGeometry, this.linesMaterial));
		this.keepClearOf([]);
	}

	keepClearOf(zones: ClearZone[]): void {
		const clearLinks = this.links.filter((link) => zones.every((zone) => !crossesZone(link, zone)));
		const positions = new Float32BufferAttribute(linkPositions(clearLinks), COORDINATES_PER_POINT);
		this.linesGeometry.setAttribute(POSITION_ATTRIBUTE, positions);
	}

	setFocus(contextKey: string | null): void {
		const share = contextKey === null ? FULL_SHARE : DIMMED_SHARE;
		this.pointsMaterial.opacity = FULL_POINT_OPACITY * share;
		this.linesMaterial.opacity = FULL_LINE_OPACITY * share;
	}

	dispose(): void {
		this.pointsGeometry.dispose();
		this.pointsMaterial.dispose();
		this.linesGeometry.dispose();
		this.linesMaterial.dispose();
	}
}
