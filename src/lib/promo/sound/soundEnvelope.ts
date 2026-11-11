import type { SoundDesk } from './soundDesk';

/** The quietest level a sound fades to; an exponential ramp cannot reach zero. */
export const silence = 0.0001;

/** A level that starts at once and dies away to silence over the length. */
export function decayingLevel(desk: SoundDesk, when: number, level: number, length: number): GainNode {
	const envelope = new GainNode(desk.context, { gain: 0 });
	envelope.gain.setValueAtTime(level, when);
	envelope.gain.exponentialRampToValueAtTime(silence, when + length);
	return envelope;
}
