import type { Material } from 'three';
import { createSharedCellUniforms, setUniform, type ContextUniforms, type SharedCellUniforms } from './cellShading';
import { FibreMaterial, type FibreTints } from './fibreMaterial';
import { DIMMED_OPACITY_SHARE } from './materialBank';
import { SomaMaterial } from './somaMaterial';

const IN_FOCUS_SHARE = 1;
const FULL_BRIGHTNESS = 1;
const SMALLEST_VIEWPORT_PIXELS = 1;

/** The materials every cell of the brain is drawn in, shared by colour and area so a whole area dims and brightens at once. */
export class CellMaterialBank {
	private readonly shared: SharedCellUniforms = createSharedCellUniforms();
	private readonly entries = new Map<string, Material>();
	private readonly contexts = new Map<string, ContextUniforms>();

	somaFor(colour: number, contextKey: string): SomaMaterial {
		return this.remember(`soma:${contextKey}:${colour}`, () => new SomaMaterial(colour, this.shared, this.contextFor(contextKey)));
	}

	axonFor(strandKey: string, tints: FibreTints, contextKey: string): FibreMaterial {
		const key = `axon:${strandKey}:${tints.root}:${tints.tip}`;
		return this.remember(key, () => new FibreMaterial(tints, 'anchoredAtBothEnds', this.shared, this.contextFor(contextKey)));
	}

	setFocus(contextKey: string | null): void {
		for (const [key, uniforms] of this.contexts) {
			const isInFocus = contextKey === null || key === contextKey;
			setUniform(uniforms.dimShare, isInFocus ? IN_FOCUS_SHARE : DIMMED_OPACITY_SHARE);
		}
	}

	setBrightness(contextKey: string, brightness: number): void {
		const { brightness: brightnessUniform } = this.contextFor(contextKey);
		setUniform(brightnessUniform, brightness);
	}

	tick(timeSeconds: number): void {
		setUniform(this.shared.timeSeconds, timeSeconds);
	}

	fitToViewport(heightPixels: number): void {
		setUniform(this.shared.viewportHeightPixels, Math.max(SMALLEST_VIEWPORT_PIXELS, heightPixels));
	}

	dispose(): void {
		for (const material of this.entries.values()) material.dispose();
		this.entries.clear();
	}

	private contextFor(contextKey: string): ContextUniforms {
		const known = this.contexts.get(contextKey);
		if (known !== undefined) return known;
		const uniforms = { dimShare: { value: IN_FOCUS_SHARE }, brightness: { value: FULL_BRIGHTNESS } };
		this.contexts.set(contextKey, uniforms);
		return uniforms;
	}

	private remember<MaterialType extends Material>(key: string, create: () => MaterialType): MaterialType {
		const existing = this.entries.get(key);
		if (existing !== undefined) return existing as MaterialType;
		const material = create();
		this.entries.set(key, material);
		return material;
	}
}
