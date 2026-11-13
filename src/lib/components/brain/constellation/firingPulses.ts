import { Group, type Texture } from 'three';
import { createCometMaterials, createPulseComet, type PulseComet } from './pulseComet';
import type { SampledCurve } from './synapseWeb';

const PULSE_LIMIT = 20;
const PULSES_PER_CURVE = 0.4;
const SLOWEST_SPEED = 0.2;
const SPEED_SPREAD = 0.35;

type Pulse = { comet: PulseComet; curve: SampledCurve; progress: number; speed: number };

export type FiringPulses = {
	group: Group;
	update: (deltaSeconds: number) => void;
	setFocus: (contextKey: string | null) => void;
	dispose: () => void;
};

export function createFiringPulses(
	curves: SampledCurve[],
	glowTexture: Texture,
	onArrive: (slug: string) => void
): FiringPulses {
	const group = new Group();
	const materials = createCometMaterials(glowTexture);
	let focusKey: string | null = null;

	function curvesInFocus(): SampledCurve[] {
		if (focusKey === null) return curves;
		const focused = curves.filter((curve) => curve.contextKey === focusKey);
		return focused.length > 0 ? focused : curves;
	}

	function randomCurve(): SampledCurve {
		const pool = curvesInFocus();
		return pool[Math.floor(Math.random() * pool.length)];
	}

	function fire(pulse: Pulse): void {
		pulse.progress = 0;
		pulse.curve = randomCurve();
		pulse.comet.settleOn(pulse.curve.colour);
	}

	const pulseCount = Math.min(PULSE_LIMIT, Math.ceil(curves.length * PULSES_PER_CURVE));
	const pulses: Pulse[] = Array.from({ length: pulseCount }, () => {
		const comet = createPulseComet(materials);
		group.add(comet.group);
		const curve = randomCurve();
		comet.settleOn(curve.colour);
		return { comet, curve, progress: Math.random(), speed: SLOWEST_SPEED + Math.random() * SPEED_SPREAD };
	});

	function update(deltaSeconds: number): void {
		for (const pulse of pulses) {
			pulse.progress += pulse.speed * deltaSeconds;
			if (pulse.progress >= 1) {
				onArrive(pulse.curve.arrivesAt);
				fire(pulse);
			}
			pulse.comet.placeAlong(pulse.curve.points, pulse.progress);
		}
	}

	function setFocus(contextKey: string | null): void {
		focusKey = contextKey;
	}

	return { group, update, setFocus, dispose: materials.dispose };
}
