const concertA = { midi: 69, frequency: 440 };
const semitonesPerOctave = 12;
const barsPerChord = 2;

export const octave = semitonesPerOctave;

export function noteFrequency(midi: number): number {
	return concertA.frequency * 2 ** ((midi - concertA.midi) / semitonesPerOctave);
}

/** D minor's four chords, i, VI, III and VII, two bars each, as MIDI notes from the root up. */
const progression = [
	[50, 53, 57],
	[46, 50, 53],
	[53, 57, 60],
	[48, 52, 55]
];

export function chordAtBar(bar: number): number[] {
	return progression[Math.floor(bar / barsPerChord) % progression.length];
}

/** D minor pentatonic from D4 up two octaves, for the bells and the scattered notes of the noise. */
export const pentatonic = [62, 65, 67, 69, 72, 74, 77, 79, 81, 84, 86];

/** The last chord, D minor with an added ninth, held under the wordmark. */
export const finalChord = [38, 50, 57, 64, 65, 69];
