import { Group, type Texture } from 'three';
import { createCometMaterials, createPulseComet, type CometMaterials, type PulseComet } from './pulseComet';
import type { SampledCurve } from './synapseWeb';

const PULSE_LIMIT = 20;
const PULSES_PER_CURVE = 0.4;
const SLOWEST_SPEED = 0.2;
const SPEED_SPREAD = 0.35;
const WHOLE_JOURNEY = 1;

/** One signal travelling a synapse, from the neuron it leaves to the one it arrives at. */
class Pulse {
	private progress = Math.random();
	private readonly speed = SLOWEST_SPEED + Math.random() * SPEED_SPREAD;

	constructor(
		private readonly comet: PulseComet,
		private curve: SampledCurve
	) {
		comet.settleOn(curve.colour);
	}

	/** Moves the pulse on, and answers the neuron it arrived at when it reaches the end of its synapse. */
	travel(deltaSeconds: number): string | null {
		this.progress += this.speed * deltaSeconds;
		const isArrived = this.progress >= WHOLE_JOURNEY;
		const arrivedAt = isArrived ? this.curve.arrivesAt : null;
		this.comet.placeAlong(this.curve.points, Math.min(this.progress, WHOLE_JOURNEY));
		return arrivedAt;
	}

	fireAlong(curve: SampledCurve): void {
		this.progress = 0;
		this.curve = curve;
		this.comet.settleOn(curve.colour);
	}
}

/** The signals firing along the synapses, kept to the area in focus when one is. */
export class FiringPulses {
	readonly group = new Group();
	private readonly materials: CometMaterials;
	private readonly pulses: Pulse[];
	private focusKey: string | null = null;

	constructor(
		private readonly curves: SampledCurve[],
		glowTexture: Texture,
		private readonly onArrive: (slug: string) => void
	) {
		this.materials = createCometMaterials(glowTexture);
		const pulseCount = Math.min(PULSE_LIMIT, Math.ceil(curves.length * PULSES_PER_CURVE));
		this.pulses = Array.from({ length: pulseCount }, () => this.newPulse());
	}

	update(deltaSeconds: number): void {
		for (const pulse of this.pulses) this.carry(pulse, deltaSeconds);
	}

	setFocus(contextKey: string | null): void {
		this.focusKey = contextKey;
	}

	show(isShown: boolean): void {
		this.group.visible = isShown;
	}

	dispose(): void {
		this.materials.dispose();
	}

	private newPulse(): Pulse {
		const comet = createPulseComet(this.materials);
		this.group.add(comet.group);
		return new Pulse(comet, this.randomCurve());
	}

	private carry(pulse: Pulse, deltaSeconds: number): void {
		const arrivedAt = pulse.travel(deltaSeconds);
		if (arrivedAt === null) return;
		this.onArrive(arrivedAt);
		pulse.fireAlong(this.randomCurve());
	}

	private randomCurve(): SampledCurve {
		const pool = this.curvesInFocus();
		return pool[Math.floor(Math.random() * pool.length)];
	}

	private curvesInFocus(): SampledCurve[] {
		if (this.focusKey === null) return this.curves;
		const focused = this.curves.filter((curve) => curve.contextKey === this.focusKey);
		return focused.length > 0 ? focused : this.curves;
	}
}
