import { chapterBeat, promoChapter, secondsPerBeat, type PromoChapterId } from '../promoTimeline';

export type BeatSpan = { from: number; to: number };

const stepTolerance = 1e-6;

/** Seconds into the film of a beat of a chapter, as the score places its notes. */
export function at(chapter: PromoChapterId, beat: number): number {
	return chapterBeat(chapter, beat);
}

export function spanOf(from: PromoChapterId, fromBeat: number, to: PromoChapterId, toBeat: number): BeatSpan {
	return { from: at(from, fromBeat), to: at(to, toBeat) };
}

export function chapterSpan(chapter: PromoChapterId): BeatSpan {
	const { startSeconds, endSeconds } = promoChapter(chapter);
	return { from: startSeconds, to: endSeconds };
}

/** Calls play at every step of a span, a step being a share of a beat: a half for eighths, a quarter for sixteenths. */
export function eachStep(span: BeatSpan, beatsPerStep: number, play: (when: number, step: number) => void): void {
	const stepSeconds = beatsPerStep * secondsPerBeat;
	for (let step = 0; span.from + step * stepSeconds < span.to - stepTolerance; step += 1) {
		play(span.from + step * stepSeconds, step);
	}
}
