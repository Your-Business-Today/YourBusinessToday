import { renderSoundtrack } from '$lib/promo/sound/renderSoundtrack';
import { encodeWav } from '$lib/promo/sound/wavFile';

const driftToleranceSeconds = 0.25;
const base64ChunkBytes = 0x8000;

function toBase64(bytes: ArrayBuffer): string {
	const view = new Uint8Array(bytes);
	const chunks: string[] = [];
	for (let start = 0; start < view.length; start += base64ChunkBytes) {
		chunks.push(String.fromCharCode(...view.subarray(start, start + base64ChunkBytes)));
	}
	return btoa(chunks.join(''));
}

/** The score, played in step with the film: started at the playhead, restarted after a seek, stopped on pause. */
export class PromoSoundtrack {
	isOn = $state(false);
	#rendering: Promise<AudioBuffer> | null = null;
	#buffer: AudioBuffer | null = null;
	#context: AudioContext | null = null;
	#source: AudioBufferSourceNode | null = null;
	#startedAt = 0;
	#startedFrom = 0;

	render(): Promise<AudioBuffer> {
		this.#rendering ??= renderSoundtrack().then((buffer) => (this.#buffer = buffer));
		return this.#rendering;
	}

	async toggle(): Promise<void> {
		this.isOn = !this.isOn;
		if (!this.isOn) return this.#stop();
		this.#context ??= new AudioContext();
		await Promise.all([this.#context.resume(), this.render()]);
	}

	/** Keeps the sound where the picture is; called on every frame. */
	follow(seconds: number, isPlaying: boolean): void {
		const context = this.#context;
		const buffer = this.#buffer;
		const shouldSound = this.isOn && isPlaying && context !== null && buffer !== null;
		if (!shouldSound) return this.#stop();
		const heardAt = this.#startedFrom + context.currentTime - this.#startedAt;
		const isOffTheBeat = this.#source === null || Math.abs(heardAt - seconds) > driftToleranceSeconds;
		if (isOffTheBeat) this.#start(context, buffer, seconds);
	}

	/** The soundtrack as a base64 WAV file, for the recorder to lay under the film. */
	async wavBase64(): Promise<string> {
		const buffer = await this.render();
		return toBase64(encodeWav(buffer));
	}

	dispose(): void {
		this.#stop();
		this.#context?.close();
	}

	#start(context: AudioContext, buffer: AudioBuffer, seconds: number): void {
		this.#stop();
		const source = new AudioBufferSourceNode(context, { buffer });
		source.connect(context.destination);
		source.start(0, seconds);
		this.#source = source;
		this.#startedAt = context.currentTime;
		this.#startedFrom = seconds;
	}

	#stop(): void {
		this.#source?.stop();
		this.#source = null;
	}
}
