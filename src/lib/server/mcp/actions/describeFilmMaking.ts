import { FilmMakingStates, type FilmMaking, type FilmMakingState } from '$lib/brand/film/filmMaking';
import { formatBritishDateTime } from '$lib/data/britishDate';
import { noSuchPiece } from './brandContentAnswers';
import type { FilmAsking } from '$lib/server/brandFilm/askForFilm';

const sentenceByState: Record<FilmMakingState, (making: FilmMaking) => string> = {
	[FilmMakingStates.waiting]: (making) => `asked for ${formatBritishDateTime(making.askedAt)}, waiting for GitHub’s runner to start it.`,
	[FilmMakingStates.filming]: () => 'being filmed now. It arrives in the brand’s library when it is done, usually within a quarter of an hour.',
	[FilmMakingStates.ready]: (making) =>
		`made ${formatBritishDateTime(making.finishedAt ?? making.askedAt)}, in the library as item ${making.libraryItemId}. ` +
		'Put it on the post with choose_post_picture.',
	[FilmMakingStates.failed]: (making) => `not made: ${making.failureReason}. Ask again with make_content_video once that is put right.`
};

/** Where the piece's latest video stands, as read_content shows it, or null when none was asked for. */
export function describeFilmStanding(making: FilmMaking | null): string | null {
	if (making === null) return null;
	return `Video: ${sentenceByState[making.state](making)}`;
}

/** The answer to make_content_video: refused by name, started, or kept as failed with why. */
export function describeFilmAsking(asking: FilmAsking): string {
	if ('isNoSuchPiece' in asking) return noSuchPiece;
	if ('refusal' in asking) return `The video was not asked for: ${asking.refusal}. Nothing was kept.`;
	const { making } = asking;
	const isFailed = making.state === FilmMakingStates.failed;
	if (isFailed) return `The video was asked for but could not be started: ${making.failureReason}.`;
	return `The video is asked for (id ${making.id}) and is being started on GitHub’s runner. Read the piece with read_content to see where it stands.`;
}
