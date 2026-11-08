const millisecondsPerSecond = 1000;
const longestFrameSeconds = 0.1;

/** The film's playhead: where it is, whether it is running, and the moves a viewer makes on it. */
export class PromoClock {
	seconds = $state(0);
	isPlaying = $state(false);
	readonly durationSeconds: number;
	#lastFrameTime: number | null = null;

	constructor(durationSeconds: number) {
		this.durationSeconds = durationSeconds;
	}

	get hasEnded(): boolean {
		return this.seconds >= this.durationSeconds;
	}

	play(): void {
		if (this.hasEnded) this.seconds = 0;
		this.isPlaying = true;
		this.#lastFrameTime = null;
	}

	pause(): void {
		this.isPlaying = false;
	}

	toggle(): void {
		if (this.isPlaying) return this.pause();
		this.play();
	}

	seek(seconds: number): void {
		this.seconds = Math.min(this.durationSeconds, Math.max(0, seconds));
		this.#lastFrameTime = null;
	}

	/** Moves the playhead on by the time since the last frame, stopping at the end. */
	advance(frameTime: number): void {
		const lastFrameTime = this.#lastFrameTime;
		this.#lastFrameTime = frameTime;
		if (!this.isPlaying || lastFrameTime === null) return;
		const elapsed = Math.min(longestFrameSeconds, (frameTime - lastFrameTime) / millisecondsPerSecond);
		this.seconds = Math.min(this.durationSeconds, this.seconds + elapsed);
		if (this.hasEnded) this.isPlaying = false;
	}
}

const secondsPerMinute = 60;
const secondsDigits = 2;

/** A time as a player shows it, minutes and two-digit seconds: 0:07. */
export function clockFace(seconds: number): string {
	const wholeSeconds = Math.floor(seconds);
	const minutes = Math.floor(wholeSeconds / secondsPerMinute);
	const remainder = String(wholeSeconds % secondsPerMinute).padStart(secondsDigits, '0');
	return `${minutes}:${remainder}`;
}
