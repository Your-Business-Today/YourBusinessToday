import { FilmMakingStates, type FilmMaking, type FilmMakingState } from './filmMaking';
import { formatBritishDateTime } from '$lib/data/britishDate';

const standingByState: Record<FilmMakingState, (making: FilmMaking) => string> = {
	[FilmMakingStates.waiting]: (making) => `Asked for ${formatBritishDateTime(making.askedAt)}. Waiting for the filming to start.`,
	[FilmMakingStates.filming]: () => 'Being filmed now. It arrives in the library when it is done, usually within a quarter of an hour.',
	[FilmMakingStates.ready]: (making) => `Made ${formatBritishDateTime(making.finishedAt ?? making.askedAt)}. It is in the brand’s library.`,
	[FilmMakingStates.failed]: (making) => `Not made: ${making.failureReason}.`
};

/** Where the piece's latest video stands, on its page. */
export function filmStandingOnPage(making: FilmMaking): string {
	return standingByState[making.state](making);
}

/** What the page says before any video is asked for. */
export const filmMakingExplained =
	'The video is made from the storyboard above: each shot’s clip for its seconds, its words over it and the music beneath, ' +
	'as H.264 at 30 frames a second. It takes a few minutes and lands in the brand’s library as a video.';
