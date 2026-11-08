import type { OrbitOffset } from '$lib/promo/scene/cameraPath';

type DragStart = { x: number; y: number; yaw: number; pitch: number };

const radiansPerPixel = 0.004;
const widestYaw = 1.1;
const steepestPitch = 0.45;
const returnRatePerSecond = 2.2;
const clickSlopPixels = 6;

function clampTo(value: number, limit: number): number {
	return Math.min(limit, Math.max(-limit, value));
}

/** Lets a viewer drag the camera around the scene; let go and it eases back onto the film's path. */
export class PromoOrbit {
	yaw = 0;
	pitch = 0;
	#dragStart: DragStart | null = null;
	#farthestPixels = 0;

	get isDragging(): boolean {
		return this.#dragStart !== null;
	}

	/** Whether the last press moved far enough to be a drag rather than a click. */
	get wasDragged(): boolean {
		return this.#farthestPixels > clickSlopPixels;
	}

	get offset(): OrbitOffset {
		return { yaw: this.yaw, pitch: this.pitch };
	}

	grab(x: number, y: number): void {
		this.#dragStart = { x, y, yaw: this.yaw, pitch: this.pitch };
		this.#farthestPixels = 0;
	}

	drag(x: number, y: number): void {
		const start = this.#dragStart;
		if (start === null) return;
		this.#farthestPixels = Math.max(this.#farthestPixels, Math.hypot(x - start.x, y - start.y));
		this.yaw = clampTo(start.yaw - (x - start.x) * radiansPerPixel, widestYaw);
		this.pitch = clampTo(start.pitch - (y - start.y) * radiansPerPixel, steepestPitch);
	}

	release(): void {
		this.#dragStart = null;
	}

	settle(elapsedSeconds: number): void {
		if (this.isDragging) return;
		const remaining = Math.exp(-returnRatePerSecond * elapsedSeconds);
		this.yaw *= remaining;
		this.pitch *= remaining;
	}
}
