import type { SoundDesk } from './soundDesk';
import { decayingLevel } from './soundEnvelope';

const kick = { from: 150, to: 42, sweep: 0.13, length: 0.5 };
const clap = { tone: 1500, sharpness: 0.9, length: 0.22, roomShare: 0.5 };
const hat = { tone: 8000, length: 0.06 };
const heartbeat = { from: 90, to: 38, sweep: 0.2, length: 0.7 };

function playDrop(desk: SoundDesk, when: number, level: number, shape: typeof kick): void {
	const body = new OscillatorNode(desk.context, { frequency: shape.from });
	body.frequency.setValueAtTime(shape.from, when);
	body.frequency.exponentialRampToValueAtTime(shape.to, when + shape.sweep);
	body.connect(decayingLevel(desk, when, level, shape.length)).connect(desk.dry);
	body.start(when);
	body.stop(when + shape.length);
}

function playNoiseHit(desk: SoundDesk, when: number, filter: BiquadFilterOptions, length: number): GainNode {
	const source = new AudioBufferSourceNode(desk.context, { buffer: desk.noise });
	const envelope = decayingLevel(desk, when, 1, length);
	source.connect(new BiquadFilterNode(desk.context, filter)).connect(envelope);
	source.start(when);
	source.stop(when + length);
	return envelope;
}

export function playKick(desk: SoundDesk, when: number, level: number): void {
	playDrop(desk, when, level, kick);
}

/** The soft low pulse under the opening, in time with the dot's breathing. */
export function playHeartbeat(desk: SoundDesk, when: number, level: number): void {
	playDrop(desk, when, level, heartbeat);
}

export function playClap(desk: SoundDesk, when: number, level: number): void {
	const hit = playNoiseHit(desk, when, { type: 'bandpass', frequency: clap.tone, Q: clap.sharpness }, clap.length);
	const loudness = new GainNode(desk.context, { gain: level });
	hit.connect(loudness);
	loudness.connect(desk.dry);
	loudness.connect(new GainNode(desk.context, { gain: clap.roomShare })).connect(desk.hall);
}

export function playHat(desk: SoundDesk, when: number, level: number): void {
	const hit = playNoiseHit(desk, when, { type: 'highpass', frequency: hat.tone }, hat.length);
	hit.connect(new GainNode(desk.context, { gain: level })).connect(desk.dry);
}
