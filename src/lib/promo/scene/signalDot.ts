import {
	AdditiveBlending,
	DoubleSide,
	Group,
	Mesh,
	MeshBasicMaterial,
	RingGeometry,
	SphereGeometry,
	Sprite,
	SpriteMaterial,
	type Scene
} from 'three';
import { beatsInto } from '../promoTimeline';
import { beatThrob } from '../promoMotion';
import { createGlowTexture } from './glowTexture';
import type { PromoPalette } from './promoPalette';
import { dotPlaceAt, dotRadiusAt, shockwaveAt } from './signalDotMotion';

export type SignalDot = { update: (seconds: number) => void };

const coreBrightness = 1;
const haloSize = 4.2;
const haloThrob = 0.3;
const haloOpacity = 0.55;
const breathSharpness = 5;
const sphereDetail = { width: 64, height: 32 };
const ringShape = { inner: 0.94, outer: 1, segments: 128 };

function createCore(palette: PromoPalette): Mesh {
	const colour = palette.signal.clone().multiplyScalar(coreBrightness);
	const geometry = new SphereGeometry(1, sphereDetail.width, sphereDetail.height);
	return new Mesh(geometry, new MeshBasicMaterial({ color: colour }));
}

function createHalo(palette: PromoPalette): Sprite {
	const material = new SpriteMaterial({ map: createGlowTexture(), color: palette.signal, blending: AdditiveBlending });
	material.depthWrite = false;
	material.opacity = haloOpacity;
	return new Sprite(material);
}

function createRingMaterial(palette: PromoPalette): MeshBasicMaterial {
	const material = new MeshBasicMaterial({ color: palette.signal, side: DoubleSide, blending: AdditiveBlending });
	material.transparent = true;
	material.depthWrite = false;
	return material;
}

/** The brand's red full stop: it opens the film, bursts into the noise and comes home to end the wordmark. */
export function createSignalDot(scene: Scene, palette: PromoPalette): SignalDot {
	const dot = new Group();
	const core = createCore(palette);
	const halo = createHalo(palette);
	const ringMaterial = createRingMaterial(palette);
	const ring = new Mesh(new RingGeometry(ringShape.inner, ringShape.outer, ringShape.segments), ringMaterial);
	dot.add(core, halo);
	scene.add(dot, ring);
	const update = (seconds: number) => {
		const radius = dotRadiusAt(seconds);
		const breath = beatThrob(beatsInto('signal', seconds), breathSharpness);
		dot.visible = radius > 0;
		dot.position.copy(dotPlaceAt(seconds));
		core.scale.setScalar(radius);
		halo.scale.setScalar(radius * haloSize * (1 + breath * haloThrob));
		const shockwave = shockwaveAt(seconds);
		ring.visible = shockwave.opacity > 0;
		ring.position.copy(shockwave.centre);
		ring.scale.setScalar(shockwave.radius);
		ringMaterial.opacity = shockwave.opacity;
	};
	return { update };
}
