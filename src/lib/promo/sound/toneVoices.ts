import { noteFrequency } from './musicalScale';
import type { SoundDesk } from './soundDesk';

export type Note = { midi: number; when: number; length: number; level: number; pan?: number };

const silence = 0.0001;
const pad = { voices: [{ detune: -9, pan: -0.5 }, { detune: 9, pan: 0.5 }], tone: 2400, attack: 0.9, release: 1.4, hallShare: 0.6 };
const bass = { tone: 520, length: 0.22 };
const pluck = { tone: 3600, echoShare: 0.8 };
const bell = { partials: [1, 2.76, 5.4], partialLevels: [1, 0.35, 0.12], hallShare: 0.7 };

function shapedLevel(desk: SoundDesk, note: Note, attack: number, release: number): GainNode {
	const envelope = new GainNode(desk.context, { gain: 0 });
	envelope.gain.setValueAtTime(0, note.when);
	envelope.gain.linearRampToValueAtTime(note.level, note.when + attack);
	envelope.gain.setValueAtTime(note.level, note.when + note.length);
	envelope.gain.exponentialRampToValueAtTime(silence, note.when + note.length + release);
	return envelope;
}

function playOscillator(desk: SoundDesk, settings: OscillatorOptions, into: AudioNode, note: Note, tail: number): void {
	const oscillator = new OscillatorNode(desk.context, settings);
	oscillator.connect(into);
	oscillator.start(note.when);
	oscillator.stop(note.when + note.length + tail);
}

/** A slow-swelling chord note: two detuned saws, softened, sent into the hall. */
export function playPadNote(desk: SoundDesk, note: Note): void {
	const envelope = shapedLevel(desk, note, pad.attack, pad.release);
	const tone = new BiquadFilterNode(desk.context, { type: 'lowpass', frequency: pad.tone });
	tone.connect(envelope).connect(desk.dry);
	envelope.connect(new GainNode(desk.context, { gain: pad.hallShare })).connect(desk.hall);
	const frequency = noteFrequency(note.midi);
	pad.voices.forEach(({ detune, pan }) => {
		const placed = new StereoPannerNode(desk.context, { pan });
		placed.connect(tone);
		playOscillator(desk, { type: 'sawtooth', frequency, detune }, placed, note, pad.release);
	});
}

export function playBassNote(desk: SoundDesk, note: Note): void {
	const envelope = shapedLevel(desk, note, silence, bass.length);
	const tone = new BiquadFilterNode(desk.context, { type: 'lowpass', frequency: bass.tone });
	tone.connect(envelope).connect(desk.dry);
	playOscillator(desk, { type: 'sawtooth', frequency: noteFrequency(note.midi) }, tone, note, bass.length);
}

/** A short plucked note that rings on in the echo. */
export function playPluck(desk: SoundDesk, note: Note): void {
	const envelope = shapedLevel(desk, { ...note, length: 0 }, silence, note.length);
	const tone = new BiquadFilterNode(desk.context, { type: 'lowpass', frequency: pluck.tone });
	const placed = new StereoPannerNode(desk.context, { pan: note.pan ?? 0 });
	tone.connect(envelope).connect(placed).connect(desk.dry);
	placed.connect(new GainNode(desk.context, { gain: pluck.echoShare })).connect(desk.echo);
	playOscillator(desk, { type: 'sawtooth', frequency: noteFrequency(note.midi) }, tone, note, note.length);
}

/** A struck bell: a few inharmonic partials dying away into the hall. */
export function playBell(desk: SoundDesk, note: Note): void {
	const envelope = shapedLevel(desk, { ...note, length: 0 }, silence, note.length);
	envelope.connect(desk.dry);
	envelope.connect(new GainNode(desk.context, { gain: bell.hallShare })).connect(desk.hall);
	const root = noteFrequency(note.midi);
	bell.partials.forEach((ratio, index) => {
		const partialLevel = new GainNode(desk.context, { gain: bell.partialLevels[index] });
		partialLevel.connect(envelope);
		playOscillator(desk, { type: 'sine', frequency: root * ratio }, partialLevel, note, note.length);
	});
}
