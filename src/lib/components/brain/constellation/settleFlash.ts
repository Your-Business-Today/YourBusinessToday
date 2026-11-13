import { AdditiveBlending, Group, Sprite, SpriteMaterial, type Texture, type Vector3 } from 'three';

const FLASH_SECONDS = 0.7;
const SMALLEST_SCALE = 0.25;
const LARGEST_SCALE = 1.3;
const STARTING_OPACITY = 0.9;
const FULLY_FADED = 1;

/** One burst of light where a neuron has just settled into the brain, growing as it fades. */
class Flash {
	readonly sprite: Sprite;
	private readonly material: SpriteMaterial;
	private elapsedSeconds = 0;

	constructor(glowTexture: Texture, position: Vector3, colour: number) {
		this.material = new SpriteMaterial({
			map: glowTexture,
			color: colour,
			transparent: true,
			opacity: STARTING_OPACITY,
			blending: AdditiveBlending,
			depthWrite: false
		});
		this.sprite = new Sprite(this.material);
		this.sprite.position.copy(position);
		this.sprite.scale.setScalar(SMALLEST_SCALE);
	}

	/** Shines on for the time given, and answers whether the flash is still shining. */
	shine(deltaSeconds: number): boolean {
		this.elapsedSeconds += deltaSeconds;
		const share = this.elapsedSeconds / FLASH_SECONDS;
		this.sprite.scale.setScalar(SMALLEST_SCALE + (LARGEST_SCALE - SMALLEST_SCALE) * share);
		this.material.opacity = STARTING_OPACITY * (FULLY_FADED - share);
		return share < FULLY_FADED;
	}

	dispose(): void {
		this.material.dispose();
	}
}

/** The flashes of light where neurons settle as the brain grows. */
export class SettleFlashes {
	readonly group = new Group();
	private flashes: Flash[] = [];

	constructor(private readonly glowTexture: Texture) {}

	spawn(position: Vector3, colour: number): void {
		const flash = new Flash(this.glowTexture, position, colour);
		this.group.add(flash.sprite);
		this.flashes.push(flash);
	}

	update(deltaSeconds: number): void {
		const shining = this.flashes.filter((flash) => flash.shine(deltaSeconds));
		for (const flash of this.flashes) {
			if (!shining.includes(flash)) this.retire(flash);
		}
		this.flashes = shining;
	}

	dispose(): void {
		for (const flash of this.flashes) this.retire(flash);
		this.flashes = [];
	}

	private retire(flash: Flash): void {
		this.group.remove(flash.sprite);
		flash.dispose();
	}
}
