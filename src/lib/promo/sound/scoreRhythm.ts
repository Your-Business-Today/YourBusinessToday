import { randomBetween, randomSigned, seededRandom } from '../promoRandom';
import { secondsPerBar } from '../promoTimeline';
import { playClap, playHat, playHeartbeat, playKick } from './drumVoices';
import { chordAtBar, octave, pentatonic } from './musicalScale';
import { chapterSpan, eachStep, spanOf } from './scoreSpans';
import type { SoundDesk } from './soundDesk';
import { playBassNote, playPluck } from './toneVoices';

const quarter = 1;
const eighth = 1 / 2;
const sixteenth = 1 / 4;
const beatsPerBar = 4;
const backbeats = [1, 3];
const groove = spanOf('board', 0, 'launch', 4);
const levels = { heartbeat: 0.55, kick: 0.85, clap: 0.32, hat: 0.14, tick: 0.05, bass: 0.11, arp: 0.05, scatter: 0.045 };
const lengths = { bass: 0.18, arp: 0.16 };
const arpPattern = [0, 1, 2, 3, 2, 1, 2, 3];
const arpPans = [-0.45, 0.45];
const scatter = { seed: 3, chance: 0.42, length: 0.09, widestPan: 0.8 };

function chordAt(when: number): number[] {
	return chordAtBar(Math.floor(when / secondsPerBar));
}

function scoreDrums(desk: SoundDesk): void {
	eachStep(spanOf('signal', 1, 'noise', 0), quarter, (when) => playHeartbeat(desk, when, levels.heartbeat));
	eachStep(spanOf('noise', 2, 'map', 0), eighth, (when) => playHat(desk, when, levels.tick));
	eachStep(chapterSpan('map'), beatsPerBar, (when) => playHeartbeat(desk, when, levels.heartbeat));
	eachStep(groove, quarter, (when, step) => {
		playKick(desk, when, levels.kick);
		const isBackbeat = backbeats.includes(step % beatsPerBar);
		if (isBackbeat) playClap(desk, when, levels.clap);
	});
	eachStep(groove, eighth, (when, step) => {
		const isOffbeat = step % 2 === 1;
		if (isOffbeat) playHat(desk, when, levels.hat);
	});
	eachStep(chapterSpan('app'), sixteenth, (when) => playHat(desk, when, levels.hat / 2));
}

function scoreBass(desk: SoundDesk): void {
	eachStep(groove, eighth, (when) => {
		const [root] = chordAt(when);
		playBassNote(desk, { midi: root - octave, when, length: lengths.bass, level: levels.bass });
	});
}

function scoreArpeggio(desk: SoundDesk): void {
	eachStep(spanOf('map', 0.5, 'launch', 4), sixteenth, (when, step) => {
		const chord = chordAt(when);
		const [root] = chord;
		const tones = [...chord, root + octave];
		const toneIndex = arpPattern[step % arpPattern.length];
		const pan = arpPans[step % arpPans.length];
		playPluck(desk, { midi: tones[toneIndex] + octave, when, length: lengths.arp, level: levels.arp, pan });
	});
}

function scoreScatter(desk: SoundDesk): void {
	const random = seededRandom(scatter.seed);
	eachStep(spanOf('noise', 0.5, 'noise', 11.5), sixteenth, (when) => {
		const isPlayed = random() < scatter.chance;
		const midi = pentatonic[Math.floor(randomBetween(random, 0, pentatonic.length))];
		const pan = randomSigned(random, scatter.widestPan);
		if (isPlayed) playPluck(desk, { midi, when, length: scatter.length, level: levels.scatter, pan });
	});
}

/** The score's pulse: a heartbeat under the opening, scattered notes in the noise, then the arpeggio, bass and drums. */
export function scoreRhythm(desk: SoundDesk): void {
	scoreDrums(desk);
	scoreBass(desk);
	scoreArpeggio(desk);
	scoreScatter(desk);
}
