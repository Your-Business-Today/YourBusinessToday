import { presenceIn } from './promoMotion';
import { promoCaptions, type PromoCaption, type PromoLine } from './promoScript';
import { beatsInto } from './promoTimeline';

export type ShownWord = { text: string; presence: number };

export type ShownLine = { text: string; words: ShownWord[]; presence: number };

export type ShownCaption = {
	chapterId: string;
	kicker: string;
	isBeneathMark: boolean;
	presence: number;
	headlines: ShownLine[];
	asides: ShownLine[];
};

const fadeBeats = 0.5;
const beatsBetweenWords = 0.12;

function showLine(line: PromoLine, beats: number): ShownLine {
	const words = line.text.split(' ').map((text, index) => {
		const start = line.fromBeat + index * beatsBetweenWords;
		return { text, presence: presenceIn(beats, { start, end: line.toBeat }, fadeBeats) };
	});
	const presence = presenceIn(beats, { start: line.fromBeat, end: line.toBeat }, fadeBeats);
	return { text: line.text, words, presence };
}

function showCaption(caption: PromoCaption, seconds: number): ShownCaption {
	const beats = beatsInto(caption.chapterId, seconds);
	const headlines = caption.lines.filter((line) => line.isHeadline).map((line) => showLine(line, beats));
	const asides = caption.lines.filter((line) => !line.isHeadline).map((line) => showLine(line, beats));
	const presence = Math.max(0, ...[...headlines, ...asides].map((line) => line.presence));
	const { chapterId, kicker } = caption;
	return { chapterId, kicker, isBeneathMark: caption.placement === 'beneathMark', presence, headlines, asides };
}

/** The words on screen at a moment, each word rising in a beat-locked ripple and the lines fading out together. */
export function captionsAt(seconds: number): ShownCaption[] {
	return promoCaptions.map((caption) => showCaption(caption, seconds)).filter((caption) => caption.presence > 0);
}
