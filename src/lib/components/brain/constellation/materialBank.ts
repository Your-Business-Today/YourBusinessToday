import { AdditiveBlending, SpriteMaterial, type Texture } from 'three';

const FULL_GLOW_OPACITY = 0.55;

export const DIMMED_OPACITY_SHARE = 0.12;

export const WHOLE_MODEL_KEY = 'model';

type BankEntry = { material: SpriteMaterial; contextKey: string; fullOpacity: number };

export type MaterialBank = {
	glowFor: (colour: number, contextKey: string) => SpriteMaterial;
	setFocus: (contextKey: string | null) => void;
	dispose: () => void;
};

export function createMaterialBank(glowTexture: Texture): MaterialBank {
	const entries = new Map<string, BankEntry>();

	function glowFor(colour: number, contextKey: string): SpriteMaterial {
		const key = `glow:${contextKey}:${colour}`;
		const existing = entries.get(key);
		if (existing !== undefined) return existing.material;
		const material = new SpriteMaterial({
			map: glowTexture,
			color: colour,
			transparent: true,
			opacity: FULL_GLOW_OPACITY,
			blending: AdditiveBlending,
			depthWrite: false
		});
		entries.set(key, { material, contextKey, fullOpacity: FULL_GLOW_OPACITY });
		return material;
	}

	function setFocus(contextKey: string | null): void {
		for (const entry of entries.values()) {
			const isInFocus = contextKey === null || entry.contextKey === contextKey;
			entry.material.opacity = isInFocus
				? entry.fullOpacity
				: entry.fullOpacity * DIMMED_OPACITY_SHARE;
		}
	}

	function dispose(): void {
		for (const entry of entries.values()) entry.material.dispose();
		entries.clear();
	}

	return { glowFor, setFocus, dispose };
}
