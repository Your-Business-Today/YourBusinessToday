import { AdditiveBlending, SpriteMaterial, type Texture } from 'three';

const FULL_GLOW_OPACITY = 0.55;

export const DIMMED_OPACITY_SHARE = 0.12;

export const WHOLE_MODEL_KEY = 'model';

/** One glow material, kept for the area it lights, so the area dims as one when another is in focus. */
class GlowEntry {
	constructor(
		readonly material: SpriteMaterial,
		private readonly contextKey: string
	) {}

	focusOn(contextKey: string | null): void {
		const isInFocus = contextKey === null || this.contextKey === contextKey;
		this.material.opacity = isInFocus ? FULL_GLOW_OPACITY : FULL_GLOW_OPACITY * DIMMED_OPACITY_SHARE;
	}

	dispose(): void {
		this.material.dispose();
	}
}

/** The glows every cell shines with, shared by colour and area. */
export class MaterialBank {
	private readonly entries = new Map<string, GlowEntry>();

	constructor(private readonly glowTexture: Texture) {}

	glowFor(colour: number, contextKey: string): SpriteMaterial {
		const key = `glow:${contextKey}:${colour}`;
		const existing = this.entries.get(key);
		if (existing !== undefined) return existing.material;
		const material = new SpriteMaterial({
			map: this.glowTexture,
			color: colour,
			transparent: true,
			opacity: FULL_GLOW_OPACITY,
			blending: AdditiveBlending,
			depthWrite: false
		});
		this.entries.set(key, new GlowEntry(material, contextKey));
		return material;
	}

	setFocus(contextKey: string | null): void {
		for (const entry of this.entries.values()) entry.focusOn(contextKey);
	}

	dispose(): void {
		for (const entry of this.entries.values()) entry.dispose();
		this.entries.clear();
	}
}
