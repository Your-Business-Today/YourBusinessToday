import type { SoundDesk } from './soundDesk';

export type Swell = { from: number; to: number; level: number };

const silence = 0.0001;
const boom = { from: 110, to: 28, sweep: 0.9, length: 2.6 };
const burst = { from: 5200, to: 180, length: 1.6, hallShare: 0.9 };
const crash = { tone: 5000, length: 2.4, hallShare: 0.6 };
const riser = { lowTone: 300, highTone: 6000, sharpness: 2.2, hallShare: 0.5 };

function playNoise(desk: SoundDesk, when: number, length: number, into: AudioNode): void {
	const source = new AudioBufferSourceNode(desk.context, { buffer: desk.noise, loop: true });
	source.connect(into);
	source.start(when);
	source.stop(when + length);
}

function fadingLevel(desk: SoundDesk, when: number, level: number, length: number): GainNode {
	const envelope = new GainNode(desk.context, { gain: 0 });
	envelope.gain.setValueAtTime(level, when);
	envelope.gain.exponentialRampToValueAtTime(silence, when + length);
	return envelope;
}

/** A cinematic hit: a falling sub boom under a burst of noise that closes down into the hall. */
export function playImpact(desk: SoundDesk, when: number, level: number): void {
	const sub = new OscillatorNode(desk.context, { frequency: boom.from });
	sub.frequency.setValueAtTime(boom.from, when);
	sub.frequency.exponentialRampToValueAtTime(boom.to, when + boom.sweep);
	sub.connect(fadingLevel(desk, when, level, boom.length)).connect(desk.dry);
	sub.start(when);
	sub.stop(when + boom.length);
	const closing = new BiquadFilterNode(desk.context, { type: 'lowpass', frequency: burst.from });
	closing.frequency.setValueAtTime(burst.from, when);
	closing.frequency.exponentialRampToValueAtTime(burst.to, when + burst.length);
	const envelope = fadingLevel(desk, when, level * burst.hallShare, burst.length);
	closing.connect(envelope);
	envelope.connect(desk.dry);
	envelope.connect(desk.hall);
	playNoise(desk, when, burst.length, closing);
}

export function playCrash(desk: SoundDesk, when: number, level: number): void {
	const shimmer = new BiquadFilterNode(desk.context, { type: 'highpass', frequency: crash.tone });
	const envelope = fadingLevel(desk, when, level, crash.length);
	shimmer.connect(envelope);
	envelope.connect(desk.dry);
	envelope.connect(new GainNode(desk.context, { gain: crash.hallShare })).connect(desk.hall);
	playNoise(desk, when, crash.length, shimmer);
}

/** Rising filtered noise that pulls the ear towards the next chapter's first beat. */
export function playRiser(desk: SoundDesk, swell: Swell): void {
	const length = swell.to - swell.from;
	const sweep = new BiquadFilterNode(desk.context, { type: 'bandpass', frequency: riser.lowTone, Q: riser.sharpness });
	sweep.frequency.setValueAtTime(riser.lowTone, swell.from);
	sweep.frequency.exponentialRampToValueAtTime(riser.highTone, swell.to);
	const envelope = new GainNode(desk.context, { gain: silence });
	envelope.gain.setValueAtTime(silence, swell.from);
	envelope.gain.exponentialRampToValueAtTime(swell.level, swell.to);
	envelope.gain.linearRampToValueAtTime(0, swell.to + silence);
	sweep.connect(envelope);
	envelope.connect(desk.dry);
	envelope.connect(new GainNode(desk.context, { gain: riser.hallShare })).connect(desk.hall);
	playNoise(desk, swell.from, length, sweep);
}
