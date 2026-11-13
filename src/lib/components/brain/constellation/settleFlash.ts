import {
	AdditiveBlending,
	Group,
	Sprite,
	SpriteMaterial,
	type Texture,
	type Vector3
} from 'three';

const FLASH_SECONDS = 0.7;
const SMALLEST_SCALE = 0.25;
const LARGEST_SCALE = 1.3;
const STARTING_OPACITY = 0.9;

type Flash = { sprite: Sprite; material: SpriteMaterial; elapsedSeconds: number };

export type SettleFlashes = {
	group: Group;
	spawn: (position: Vector3, colour: number) => void;
	update: (deltaSeconds: number) => void;
	dispose: () => void;
};

export function createSettleFlashes(glowTexture: Texture): SettleFlashes {
	const group = new Group();
	let flashes: Flash[] = [];

	function spawn(position: Vector3, colour: number): void {
		const material = new SpriteMaterial({
			map: glowTexture,
			color: colour,
			transparent: true,
			opacity: STARTING_OPACITY,
			blending: AdditiveBlending,
			depthWrite: false
		});
		const sprite = new Sprite(material);
		sprite.position.copy(position);
		sprite.scale.setScalar(SMALLEST_SCALE);
		group.add(sprite);
		flashes.push({ sprite, material, elapsedSeconds: 0 });
	}

	function update(deltaSeconds: number): void {
		const alive: Flash[] = [];
		for (const flash of flashes) {
			flash.elapsedSeconds += deltaSeconds;
			if (flash.elapsedSeconds >= FLASH_SECONDS) {
				retire(flash);
				continue;
			}
			shine(flash);
			alive.push(flash);
		}
		flashes = alive;
	}

	function shine(flash: Flash): void {
		const share = flash.elapsedSeconds / FLASH_SECONDS;
		flash.sprite.scale.setScalar(SMALLEST_SCALE + (LARGEST_SCALE - SMALLEST_SCALE) * share);
		flash.material.opacity = STARTING_OPACITY * (1 - share);
	}

	function retire(flash: Flash): void {
		group.remove(flash.sprite);
		flash.material.dispose();
	}

	function dispose(): void {
		for (const flash of flashes) retire(flash);
		flashes = [];
	}

	return { group, spawn, update, dispose };
}
