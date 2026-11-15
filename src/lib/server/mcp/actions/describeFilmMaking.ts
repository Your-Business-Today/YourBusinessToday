import { filmRecipeOf } from '$lib/brand/film/filmRecipe';
import { FilmMakingStates, type FilmMaking, type FilmMakingKind, type FilmMakingState } from '$lib/brand/film/filmMaking';
import { formatBritishDateTime } from '$lib/data/britishDate';
import { noSuchPiece } from './brandContentAnswers';
import type { FilmAsking } from '$lib/server/brandFilm/askForFilm';
import type { FilmClosing } from '$lib/server/brandFilm/closeFilmMaking';

/** How each kind of request is named: what it makes, its line on the piece, the action that asks again, and where what it made is kept. */
type KindWords = {
	made: string;
	is: string;
	was: string;
	line: string;
	action: string;
	keptAs: (making: FilmMaking) => string;
};

const kindWords: Record<FilmMakingKind, KindWords> = {
	video: {
		made: 'The video',
		is: 'is',
		was: 'was',
		line: 'Video',
		action: 'make_content_video',
		keptAs: (making) => `item ${making.libraryItemId}`
	},
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
	[FilmMakingStates.waiting]: (making) => `asked for ${formatBritishDateTime(making.askedAt)}, not yet opened.`,
	[FilmMakingStates.filming]: (making) =>
		`given to the asker’s own Claude to make ${formatBritishDateTime(making.askedAt)}; it is kept once that Claude calls record_content_made.`,
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

const recipeFence = '```';

function recipeAnswerOf(made: string, is: string, recipe: string): string {
	return [
		`${made} ${is} yours to make now, here in your own sandbox: nothing is made on Your Business Today’s side.`,
		'Run this bash script as it stands. It needs curl and ffmpeg with drawtext; it fetches the files by links that last ' +
			'an hour and sends what it makes to links that last two.',
		'When it finishes, call record_content_made with hasArrived true. If it fails and cannot be put right, call ' +
			'record_content_made with hasArrived false and the reason, so the piece does not wait.',
		`${recipeFence}bash\n${recipe}\n${recipeFence}`
	].join('\n\n');
}

/** The answer to make_content_video or make_content_pictures: refused by name, kept as failed with why, or the recipe to run. */
export function describeFilmAsking(asking: FilmAsking, kind: FilmMakingKind): string {
	const { made, is, was } = kindWords[kind];
	if ('isNoSuchPiece' in asking) return noSuchPiece;
	if ('refusal' in asking) return `${made} ${was} not asked for: ${asking.refusal}. Nothing was kept.`;
	const { making, order } = asking;
	if (order === null) return `${made} ${was} asked for but could not be opened: ${making.failureReason}.`;
	return recipeAnswerOf(made, is, filmRecipeOf(order, making.id));
}

/** The answer to record_content_made: where the request ended, or why the word was not taken. */
export function describeFilmClosing(closing: FilmClosing): string {
	if ('problem' in closing) return `Nothing was recorded: ${closing.problem}.`;
	return describeFilmStanding(closing.making) as string;
}
