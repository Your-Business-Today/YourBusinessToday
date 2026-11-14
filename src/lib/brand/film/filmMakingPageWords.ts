import { FilmMakingKinds, FilmMakingStates, type FilmMaking, type FilmMakingKind, type FilmMakingState } from './filmMaking';
import { formatBritishDateTime } from '$lib/data/britishDate';

/** How the piece's page names each kind of request: its panel, its button, what it makes, and where that is kept. */
export const filmMakingPageWords: Record<FilmMakingKind, { title: string; howToAsk: string; explained: string; kept: string }> = {
	[FilmMakingKinds.video]: {
		title: 'The video',
		howToAsk: 'To make it, ask your Claude to “make the video of this piece”. Your Claude makes it and sends it to the library.',
		explained:
			'The video is made from the storyboard above: each shot’s clip for its seconds, its words over it and the music ' +
			'beneath, as H.264 at 30 frames a second. It lands in the brand’s library as a video.',
		kept: 'It is in the brand’s library.'
	},
	[FilmMakingKinds.pictures]: {
		title: 'The pictures',
		howToAsk: 'To make them, ask your Claude to “make the pictures of this piece”. Your Claude makes them and sends them to the library.',
		explained:
			'One picture is made a shot, in the order of the storyboard: the shot’s photo filling the frame its shape takes, ' +
			'with its words over it. They land in the brand’s library as photos.',
		kept: 'They are in the brand’s library, in shot order.'
	}
};

const standingByState: Record<FilmMakingState, (making: FilmMaking) => string> = {
	[FilmMakingStates.waiting]: (making) => `Asked for ${formatBritishDateTime(making.askedAt)}. Not yet opened.`,
	[FilmMakingStates.filming]: (making) =>
		`Given to the asker’s Claude to make ${formatBritishDateTime(making.askedAt)}. It shows here once their Claude says it is done.`,
	[FilmMakingStates.ready]: (making) => `Made ${formatBritishDateTime(making.finishedAt ?? making.askedAt)}. ${filmMakingPageWords[making.kind].kept}`,
	[FilmMakingStates.failed]: (making) => `Not made: ${making.failureReason}.`
};

/** Where the piece's latest video or pictures stand, on its page. */
export function filmStandingOnPage(making: FilmMaking): string {
	return standingByState[making.state](making);
}
