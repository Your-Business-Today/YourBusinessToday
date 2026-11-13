import type { Material } from 'three';
import { createSharedCellUniforms, type ContextUniforms } from './cellShading';
import { FibreMaterial, type FibreTints } from './fibreMaterial';
import { DIMMED_OPACITY_SHARE } from './materialBank';
import { SomaMaterial } from './somaMaterial';

const IN_FOCUS_SHARE = 1;
const FULL_BRIGHTNESS = 1;


export type CellMaterialBank = {
	somaFor: (colour: number, contextKey: string) => SomaMaterial;
	dendritesFor: (slug: string, colour: number, contextKey: string) => FibreMaterial;
	axonFor: (strandKey: string, tints: FibreTints, contextKey: string) => FibreMaterial;
	setFocus: (contextKey: string | null) => void;
	setBrightness: (contextKey: string, brightness: number) => void;
	tick: (timeSeconds: number) => void;
	fitToViewport: (heightPixels: number) => void;
	dispose: () => void;
};

export function createCellMaterialBank(): CellMaterialBank {
	const shared = createSharedCellUniforms();
	const entries = new Map<string, Material>();
	const contexts = new Map<string, ContextUniforms>();

	function contextFor(contextKey: string): ContextUniforms {
		const known = contexts.get(contextKey);
		if (known !== undefined) return known;
		const uniforms = { dimShare: { value: IN_FOCUS_SHARE }, brightness: { value: FULL_BRIGHTNESS } };
		contexts.set(contextKey, uniforms);
		return uniforms;
	}

	function remember<MaterialType extends Material>(key: string, create: () => MaterialType): MaterialType {
		const existing = entries.get(key);
		if (existing !== undefined) return existing as MaterialType;
		const material = create();
		entries.set(key, material);
		return material;
	}

	function somaFor(colour: number, contextKey: string): SomaMaterial {
		return remember(`soma:${contextKey}:${colour}`, () => {
			return new SomaMaterial(colour, shared, contextFor(contextKey));
		});
	}

	function dendritesFor(slug: string, colour: number, contextKey: string): FibreMaterial {
		return remember(`dendrites:${slug}:${colour}`, () => {
			const tints = { root: colour, span: colour, tip: colour };
			return new FibreMaterial(tints, 'rootedInSoma', shared, contextFor(contextKey));
		});
	}

	function axonFor(strandKey: string, tints: FibreTints, contextKey: string): FibreMaterial {
		return remember(`axon:${strandKey}:${tints.root}:${tints.tip}`, () => {
			return new FibreMaterial(tints, 'anchoredAtBothEnds', shared, contextFor(contextKey));
		});
	}

	function setFocus(contextKey: string | null): void {
		for (const [key, uniforms] of contexts) {
			const isInFocus = contextKey === null || key === contextKey;
			uniforms.dimShare.value = isInFocus ? IN_FOCUS_SHARE : DIMMED_OPACITY_SHARE;
		}
	}

	function setBrightness(contextKey: string, brightness: number): void {
		contextFor(contextKey).brightness.value = brightness;
	}

	function tick(timeSeconds: number): void {
		shared.timeSeconds.value = timeSeconds;
	}

	function fitToViewport(heightPixels: number): void {
		shared.viewportHeightPixels.value = Math.max(1, heightPixels);
	}

	function dispose(): void {
		for (const material of entries.values()) material.dispose();
		entries.clear();
	}

	return { somaFor, dendritesFor, axonFor, setFocus, setBrightness, tick, fitToViewport, dispose };
}
