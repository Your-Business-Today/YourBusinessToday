import { Color, FogExp2, Scene, type Mesh, type Texture } from 'three';
import { createGlowTexture } from './glowTexture';
import { MaterialBank } from './materialBank';
import { CellMaterialBank } from './cellMaterialBank';
import { MountedModel } from './mountedModel';
import { SettleFlashes } from './settleFlash';
import { createStarBackdrop } from './starBackdrop';
import { NIGHT_SKY } from './constellationPalette';
import type { ConstellationModel } from './constellationTypes';
import type { NeuronBody } from './neuronBody';
import type { SynapseStrand } from './synapseStrand';

const DEPTH_FOG_DENSITY = 0.045;

/** The drawn brain: the night it sits in, and the cells and synapses of the model it shows. */
export class ConstellationScene {
	readonly scene = new Scene();
	readonly flashes: SettleFlashes;
	private readonly glowTexture: Texture = createGlowTexture();
	private readonly bank: MaterialBank;
	private readonly cells = new CellMaterialBank();
	private readonly backdrop = createStarBackdrop();
	private mounted: MountedModel;

	constructor(model: ConstellationModel) {
		this.scene.background = new Color(NIGHT_SKY);
		this.scene.fog = new FogExp2(NIGHT_SKY, DEPTH_FOG_DENSITY);
		this.bank = new MaterialBank(this.glowTexture);
		this.flashes = new SettleFlashes(this.glowTexture);
		this.scene.add(this.backdrop.points, this.flashes.group);
		this.mounted = this.mount(model);
	}

	bodyFor(slug: string): NeuronBody | undefined {
		return this.mounted.bodyFor(slug);
	}

	strandsTouching(slug: string): SynapseStrand[] {
		return this.mounted.strandsTouching(slug);
	}

	hitTargets(): Mesh[] {
		return this.mounted.hitTargets();
	}

	/** Moves the brain on by one frame; a still brain, for those who prefer less motion, only fits the viewport. */
	advance(deltaSeconds: number, timeSeconds: number, isAnimated: boolean, viewportHeightPixels: number): void {
		this.flashes.update(deltaSeconds);
		this.cells.fitToViewport(viewportHeightPixels);
		if (!isAnimated) return;
		this.cells.tick(timeSeconds);
		this.mounted.twinkle(timeSeconds, deltaSeconds);
	}

	showPulses(isShown: boolean): void {
		this.mounted.showPulses(isShown);
	}

	setFocus(contextKey: string | null): void {
		this.bank.setFocus(contextKey);
		this.cells.setFocus(contextKey);
		this.mounted.setFocus(contextKey);
	}

	rebuild(model: ConstellationModel): void {
		this.mounted.removeFrom(this.scene);
		this.mounted = this.mount(model);
	}

	dispose(): void {
		this.mounted.removeFrom(this.scene);
		for (const part of [this.backdrop, this.flashes, this.bank, this.cells, this.glowTexture]) part.dispose();
	}

	private mount(model: ConstellationModel): MountedModel {
		const mounted = new MountedModel(model, this.bank, this.cells, this.glowTexture);
		mounted.showIn(this.scene);
		return mounted;
	}
}
