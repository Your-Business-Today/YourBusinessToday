import { secondsPerBar, type PromoChapterId } from '../promoTimeline';
import { chordAtBar, finalChord } from './musicalScale';
import { at, chapterSpan } from './scoreSpans';
import type { SoundDesk } from './soundDesk';
import { playPadNote } from './toneVoices';

type PadSection = { chapter: PromoChapterId; level: number };

const barsPerChord = 2;
const chordOverlapSeconds = 0.3;
const padSections: PadSection[] = [
	{ chapter: 'signal', level: 0.04 },
	{ chapter: 'noise', level: 0.03 },
	{ chapter: 'map', level: 0.047 },
	{ chapter: 'board', level: 0.05 },
	{ chapter: 'app', level: 0.05 },
	{ chapter: 'launch', level: 0.068 }
];
const finale = { landingBeat: 2.5, level: 0.075, releaseSeconds: 1.4 };

function scoreSection(desk: SoundDesk, { chapter, level }: PadSection): void {
	const chordSeconds = barsPerChord * secondsPerBar;
	const { from, to } = chapterSpan(chapter);
	for (let when = from; when < to; when += chordSeconds) {
		const chord = chordAtBar(Math.round(when / secondsPerBar));
		const length = Math.min(chordSeconds, to - when) + chordOverlapSeconds;
		chord.forEach((midi) => playPadNote(desk, { midi, when, length, level }));
	}
}

/** The chords under everything, two bars each, louder as the film builds, and the long last chord under the wordmark. */
export function scorePad(desk: SoundDesk): void {
	padSections.forEach((section) => scoreSection(desk, section));
	const landing = at('brand', finale.landingBeat);
	const { to: end } = chapterSpan('brand');
	const length = end - landing - finale.releaseSeconds;
	finalChord.forEach((midi) => playPadNote(desk, { midi, when: landing, length, level: finale.level }));
}
