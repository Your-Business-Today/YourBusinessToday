import type { Group, Mesh, Scene, Texture } from 'three';
import { cellZonesOf } from './cellClearZones';
import { FiringPulses } from './firingPulses';
import { NeuronField } from './neuronField';
import { createNucleusLabels, disposeNucleusLabels } from './nucleusLabels';
import { SynapseWeb } from './synapseWeb';
import type { AmbientNeuralWeb } from './ambientNeuralWeb';
import type { CellMaterialBank } from './cellMaterialBank';
import type { ConstellationModel } from './constellationTypes';
import type { MaterialBank } from './materialBank';
import type { NeuronBody } from './neuronBody';
import type { SynapseStrand } from './synapseStrand';

/** What the brain shows of one model: its cells, its synapses, the pulses along them and the areas' names. */
export class MountedModel {
	private readonly field: NeuronField;
	private readonly web: SynapseWeb;
	private readonly pulses: FiringPulses;
	private readonly labels: Group;

	constructor(model: ConstellationModel, bank: MaterialBank, cells: CellMaterialBank, glowTexture: Texture) {
		const field = new NeuronField(model, bank, cells);
		this.field = field;
		this.web = new SynapseWeb(model, cells);
		this.pulses = new FiringPulses(this.web.curves, glowTexture, (slug) => field.bodyFor(slug)?.excite());
		this.labels = createNucleusLabels(model.nuclei);
	}

	/** Puts the model in the scene, with the ambient web cleared from round its cells. */
	showIn(scene: Scene, ambient: AmbientNeuralWeb, model: ConstellationModel): void {
		ambient.keepClearOf(cellZonesOf(model));
		scene.add(this.field.group, this.web.group, this.pulses.group, this.labels);
	}

	bodyFor(slug: string): NeuronBody | undefined {
		return this.field.bodyFor(slug);
	}

	strandsTouching(slug: string): SynapseStrand[] {
		return this.web.strandsTouching(slug);
	}

	hitTargets(): Mesh[] {
		return this.field.hitTargets;
	}

	twinkle(timeSeconds: number, deltaSeconds: number): void {
		this.field.twinkle(timeSeconds, deltaSeconds);
		this.pulses.update(deltaSeconds);
	}

	showPulses(isShown: boolean): void {
		this.pulses.show(isShown);
	}

	setFocus(contextKey: string | null): void {
		this.pulses.setFocus(contextKey);
	}

	removeFrom(scene: Scene): void {
		scene.remove(this.field.group, this.web.group, this.pulses.group, this.labels);
		for (const part of [this.field, this.web, this.pulses]) part.dispose();
		disposeNucleusLabels(this.labels);
	}
}
