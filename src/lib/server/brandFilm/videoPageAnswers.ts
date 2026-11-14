import { fail } from '@sveltejs/kit';
import { FilmMakingStates } from '$lib/brand/film/filmMaking';
import type { FilmAsking } from './askForFilm';

const MakingRefusalStatus = { badRequest: 400, notFound: 404, conflict: 409 } as const;

/** The answer when the form names no kind of making there is. */
export function unknownMakingAnswer() {
	return fail(MakingRefusalStatus.badRequest, { videoMessage: 'kind is video or pictures. Nothing was asked for.' });
}

/** The Make the video or Make the pictures button's answer: why it was refused, or that it is on its way. */
export function videoPageAnswerFor(asking: FilmAsking) {
	if ('isNoSuchPiece' in asking) return fail(MakingRefusalStatus.notFound, { videoMessage: 'This piece is no longer in the brand’s content.' });
	if ('refusal' in asking) return fail(MakingRefusalStatus.conflict, { videoMessage: `It was not asked for: ${asking.refusal}.` });
	const { making } = asking;
	const isFailed = making.state === FilmMakingStates.failed;
	if (isFailed) return { videoMessage: `It was asked for but could not be started: ${making.failureReason}.` };
	return { videoMessage: 'It is asked for. This page shows where it stands.' };
}
