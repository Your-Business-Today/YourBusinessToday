/** One shot's place in the film: which shot, and the seconds it starts and ends at. */
export type FilmCut = { shotIndex: number; startSeconds: number; endSeconds: number };

/** The shots cut straight one to the next, each for its own seconds; a shot of no seconds is not seen. */
export function filmCutsOf(shotSeconds: number[]): FilmCut[] {
	let startSeconds = 0;
	const cuts: FilmCut[] = [];
	shotSeconds.forEach((seconds, shotIndex) => {
		if (seconds <= 0) return;
		cuts.push({ shotIndex, startSeconds, endSeconds: startSeconds + seconds });
		startSeconds += seconds;
	});
	return cuts;
}

/** How long the film runs. */
export function filmLengthOf(cuts: FilmCut[]): number {
	const lastCut = cuts.at(-1);
	return lastCut?.endSeconds ?? 0;
}

/** The cut showing at this moment of the film; the last one holds at the very end. */
export function cutAt(cuts: FilmCut[], seconds: number): FilmCut | null {
	const showing = cuts.find((cut) => seconds >= cut.startSeconds && seconds < cut.endSeconds);
	return showing ?? cuts.at(-1) ?? null;
}
