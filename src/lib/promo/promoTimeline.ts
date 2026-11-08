export type PromoChapterId = 'signal' | 'noise' | 'map' | 'board' | 'app' | 'launch' | 'brand';

export type PromoChapter = {
	id: PromoChapterId;
	title: string;
	startBar: number;
	bars: number;
	startSeconds: number;
	endSeconds: number;
};

type ChapterLength = { id: PromoChapterId; title: string; bars: number };

const secondsPerMinute = 60;

export const promoTempo = { beatsPerMinute: 120, beatsPerBar: 4 };

export const secondsPerBeat = secondsPerMinute / promoTempo.beatsPerMinute;

export const secondsPerBar = secondsPerBeat * promoTempo.beatsPerBar;

const chapterLengths: ChapterLength[] = [
	{ id: 'signal', title: 'Information', bars: 2 },
	{ id: 'noise', title: 'The noise', bars: 3 },
	{ id: 'map', title: 'The map', bars: 3 },
	{ id: 'board', title: 'Built in the open', bars: 5 },
	{ id: 'app', title: 'Your app', bars: 4 },
	{ id: 'launch', title: 'Live', bars: 2 },
	{ id: 'brand', title: 'Your Business Today', bars: 4 }
];

function placeChapters(lengths: ChapterLength[]): PromoChapter[] {
	let startBar = 0;
	return lengths.map((length) => {
		const chapter = {
			...length,
			startBar,
			startSeconds: startBar * secondsPerBar,
			endSeconds: (startBar + length.bars) * secondsPerBar
		};
		startBar += length.bars;
		return chapter;
	});
}

export const promoChapters: PromoChapter[] = placeChapters(chapterLengths);

const finalChapter = promoChapters[promoChapters.length - 1];

export const promoDurationSeconds = finalChapter.endSeconds;

export function promoChapter(id: PromoChapterId): PromoChapter {
	return promoChapters.find((chapter) => chapter.id === id) ?? finalChapter;
}

export function chapterAt(seconds: number): PromoChapter {
	const startedChapters = promoChapters.filter((chapter) => chapter.startSeconds <= seconds);
	return startedChapters[startedChapters.length - 1] ?? promoChapters[0];
}

/** Seconds into the film of a beat counted from the start of a chapter. */
export function chapterBeat(id: PromoChapterId, beats: number): number {
	const chapter = promoChapter(id);
	return chapter.startSeconds + beats * secondsPerBeat;
}

/** Beats since the start of a chapter, negative before it starts. */
export function beatsInto(id: PromoChapterId, seconds: number): number {
	const chapter = promoChapter(id);
	return (seconds - chapter.startSeconds) / secondsPerBeat;
}
