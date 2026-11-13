import { AdditiveBlending, Group, Sprite, SpriteMaterial, type Texture, type Vector3 } from 'three';

const HEAD_SCALE = 0.075;
const TAIL_LENGTH = 3;
const TAIL_SPACING_SHARE = 0.035;
const TAIL_SHRINK = 0.72;
const HEAD_OPACITY = 0.85;
const TAIL_FADE = 0.55;

export type PulseComet = {
	group: Group;
	settleOn: (colour: number) => void;
	placeAlong: (points: Vector3[], progress: number) => void;
};

export type CometMaterials = {
	materialFor: (colour: number, tailIndex: number) => SpriteMaterial;
	dispose: () => void;
};

export function createCometMaterials(glowTexture: Texture): CometMaterials {
	const materials = new Map<string, SpriteMaterial>();

	function materialFor(colour: number, tailIndex: number): SpriteMaterial {
		const key = `${colour}:${tailIndex}`;
		const existing = materials.get(key);
		if (existing !== undefined) return existing;
		const material = new SpriteMaterial({
			map: glowTexture,
			color: colour,
			transparent: true,
			opacity: HEAD_OPACITY * TAIL_FADE ** tailIndex,
			blending: AdditiveBlending,
			depthWrite: false
		});
		materials.set(key, material);
		return material;
	}

	function dispose(): void {
		for (const material of materials.values()) material.dispose();
		materials.clear();
	}

	return { materialFor, dispose };
}

export function createPulseComet(materials: CometMaterials): PulseComet {
	const group = new Group();
	const sprites = Array.from({ length: TAIL_LENGTH + 1 }, (_, tailIndex) => {
		const sprite = new Sprite();
		sprite.scale.setScalar(HEAD_SCALE * TAIL_SHRINK ** tailIndex);
		group.add(sprite);
		return sprite;
	});

	function settleOn(colour: number): void {
		sprites.forEach((sprite, tailIndex) => {
			sprite.material = materials.materialFor(colour, tailIndex);
		});
	}

	function placeAlong(points: Vector3[], progress: number): void {
		sprites.forEach((sprite, tailIndex) => {
			const trailingProgress = Math.max(0, progress - tailIndex * TAIL_SPACING_SHARE);
			placeAt(sprite, points, trailingProgress);
		});
	}

	return { group, settleOn, placeAlong };
}

function placeAt(sprite: Sprite, points: Vector3[], progress: number): void {
	const exactIndex = progress * (points.length - 1);
	const lowerIndex = Math.floor(exactIndex);
	const upperIndex = Math.min(points.length - 1, lowerIndex + 1);
	sprite.position.lerpVectors(points[lowerIndex], points[upperIndex], exactIndex - lowerIndex);
}
