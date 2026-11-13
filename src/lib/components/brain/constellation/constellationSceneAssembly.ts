import { Color, FogExp2, Group, Scene } from 'three';
import { createAmbientNeuralWeb, type AmbientNeuralWeb } from './ambientNeuralWeb';
import { cellZonesOf } from './cellClearZones';
import { createFiringPulses, type FiringPulses } from './firingPulses';
import { createGlowTexture } from './glowTexture';
import { createMaterialBank, type MaterialBank } from './materialBank';
import { createCellMaterialBank, type CellMaterialBank } from './cellMaterialBank';
import { createNeuronField, type NeuronField } from './neuronField';
import { createNucleusLabels, disposeNucleusLabels } from './nucleusLabels';
import { createSettleFlashes, type SettleFlashes } from './settleFlash';
import { createStarBackdrop } from './starBackdrop';
import { createSynapseWeb, type SynapseWeb } from './synapseWeb';
import { NIGHT_SKY } from './constellationPalette';
import type { ConstellationModel } from './constellationTypes';

const DEPTH_FOG_DENSITY = 0.045;

export type MountedModel = { field: NeuronField; web: SynapseWeb; pulses: FiringPulses; labels: Group };

export type ConstellationScene = {
	scene: Scene;
	readonly mounted: MountedModel;
	ambient: AmbientNeuralWeb;
	flashes: SettleFlashes;
	bank: MaterialBank;
	cells: CellMaterialBank;
	rebuild: (model: ConstellationModel) => void;
	dispose: () => void;
};

export function assembleConstellationScene(model: ConstellationModel): ConstellationScene {
	const scene = new Scene();
	scene.background = new Color(NIGHT_SKY);
	scene.fog = new FogExp2(NIGHT_SKY, DEPTH_FOG_DENSITY);

	const glowTexture = createGlowTexture();
	const bank = createMaterialBank(glowTexture);
	const cells = createCellMaterialBank();
	const backdrop = createStarBackdrop();
	const ambient = createAmbientNeuralWeb(glowTexture);
	const flashes = createSettleFlashes(glowTexture);
	scene.add(backdrop.points, ambient.group, flashes.group);

	function mountModel(mountedModel: ConstellationModel): MountedModel {
		const field = createNeuronField(mountedModel, bank, cells);
		const web = createSynapseWeb(mountedModel, cells);
		const excite = (slug: string) => field.bodyFor(slug)?.excite();
		const pulses = createFiringPulses(web.curves, glowTexture, excite);
		const labels = createNucleusLabels(mountedModel.nuclei);
		ambient.keepClearOf(cellZonesOf(mountedModel));
		scene.add(field.group, web.group, pulses.group, labels);
		return { field, web, pulses, labels };
	}

	function unmountModel({ field, web, pulses, labels }: MountedModel): void {
		scene.remove(field.group, web.group, pulses.group, labels);
		field.dispose();
		web.dispose();
		pulses.dispose();
		disposeNucleusLabels(labels);
	}

	let mounted = mountModel(model);

	function rebuild(rebuiltModel: ConstellationModel): void {
		unmountModel(mounted);
		mounted = mountModel(rebuiltModel);
	}

	function dispose(): void {
		unmountModel(mounted);
		backdrop.dispose();
		ambient.dispose();
		flashes.dispose();
		bank.dispose();
		cells.dispose();
		glowTexture.dispose();
	}

	return {
		scene,
		get mounted() {
			return mounted;
		},
		ambient,
		flashes,
		bank,
		cells,
		rebuild,
		dispose
	};
}
