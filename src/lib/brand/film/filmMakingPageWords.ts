import { FilmMakingKinds, FilmMakingStates, type FilmMaking, type FilmMakingKind, type FilmMakingState } from './filmMaking';
import { formatBritishDateTime } from '$lib/data/britishDate';

/** How the piece's page names each kind of request: its panel, its button, what it makes, and where that is kept. */
export const filmMakingPageWords: Record<FilmMakingKind, { title: string; button: string; explained: string; kept: string }> = {
	[FilmMakingKinds.video]: {
		title: 'The video',
		button: 'Make the video',
		explained:
			'The video is made from the storyboard above: each shot’s clip for its seconds, its words over it and the music ' +
			'beneath, as H.264 at 30 frames a second. It takes a few minutes and lands in the brand’s library as a video.',
		kept: 'It is in the brand’s library.'
	},
	[FilmMakingKinds.pictures]: {
		title: 'The pictures',
		button: 'Make the pictures',
		explained:
			'One picture is made a shot, in the order of the storyboard: the shot’s photo filling the frame its shape takes, ' +
			'with its words over it. They take a few minutes and land in the brand’s library as photos.',
		kept: 'They are in the brand’s library, in shot order.'
	}
};

const standingByState: Record<FilmMakingState, (making: FilmMaking) => string> = {
	[FilmMakingStates.waiting]: (making) => `Asked for ${formatBritishDateTime(making.askedAt)}. Waiting for the making to start.`,
	[FilmMakingStates.filming]: () => 'Being made now. It arrives in the library when it is done, usually within a quarter of an hour.',
	[FilmMakingStates.ready]: (making) => `Made ${formatBritishDateTime(making.finishedAt ?? making.askedAt)}. ${filmMakingPageWords[making.kind].kept}`,
	[FilmMakingStates.failed]: (making) => `Not made: ${making.failureReason}.`
};

/** Where the piece's latest video or pictures stand, on its page. */
export function filmStandingOnPage(making: FilmMaking): string {
	return standingByState[making.state](making);
}
