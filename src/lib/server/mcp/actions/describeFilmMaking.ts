import { FilmMakingStates, type FilmMaking, type FilmMakingKind, type FilmMakingState } from '$lib/brand/film/filmMaking';
import { formatBritishDateTime } from '$lib/data/britishDate';
import { noSuchPiece } from './brandContentAnswers';
import type { FilmAsking } from '$lib/server/brandFilm/askForFilm';

/** How each kind of request is named: what it makes, its line on the piece, the action that asks again, and where what it made is kept. */
type KindWords = { made: string; is: string; was: string; line: string; action: string; keptAs: (making: FilmMaking) => string };

const kindWords: Record<FilmMakingKind, KindWords> = {
	video: { made: 'The video', is: 'is', was: 'was', line: 'Video', action: 'make_content_video', keptAs: (making) => `item ${making.libraryItemId}` },
	pictures: {
		made: 'The pictures',
		is: 'are',
		was: 'were',
		line: 'Pictures',
		action: 'make_content_pictures',
		keptAs: (making) => `items ${making.pictureItemIds.join(', ')}, in shot order`
	}
};

const sentenceByState: Record<FilmMakingState, (making: FilmMaking) => string> = {
	[FilmMakingStates.waiting]: (making) => `asked for ${formatBritishDateTime(making.askedAt)}, waiting for GitHub’s runner to start it.`,
	[FilmMakingStates.filming]: () => 'being made now. It arrives in the brand’s library when it is done, usually within a quarter of an hour.',
	[FilmMakingStates.ready]: (making) =>
		`made ${formatBritishDateTime(making.finishedAt ?? making.askedAt)}, in the library as ${kindWords[making.kind].keptAs(making)}. ` +
		'Put it on the post with choose_post_picture.',
	[FilmMakingStates.failed]: (making) => `not made: ${making.failureReason}. Ask again with ${kindWords[making.kind].action} once that is put right.`
};

/** Where the piece's latest video or pictures stand, as read_content shows it, or null when none were asked for. */
export function describeFilmStanding(making: FilmMaking | null): string | null {
	if (making === null) return null;
	return `${kindWords[making.kind].line}: ${sentenceByState[making.state](making)}`;
}

/** The answer to make_content_video or make_content_pictures: refused by name, started, or kept as failed with why. */
export function describeFilmAsking(asking: FilmAsking, kind: FilmMakingKind): string {
	const { made, is, was } = kindWords[kind];
	if ('isNoSuchPiece' in asking) return noSuchPiece;
	if ('refusal' in asking) return `${made} ${was} not asked for: ${asking.refusal}. Nothing was kept.`;
	const { making } = asking;
	const isFailed = making.state === FilmMakingStates.failed;
	if (isFailed) return `${made} ${was} asked for but could not be started: ${making.failureReason}.`;
	return `${made} ${is} asked for (id ${making.id}) and ${is} being started on GitHub’s runner. Read the piece with read_content to see where it stands.`;
}
