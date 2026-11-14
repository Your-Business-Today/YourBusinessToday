import { fail } from '@sveltejs/kit';
import { FilmMakingStates } from '$lib/brand/film/filmMaking';
import type { FilmAsking } from './askForFilm';

const VideoRefusalStatus = { notFound: 404, conflict: 409 } as const;

/** The Make the video button's answer: why it was refused, or that it is on its way. */
export function videoPageAnswerFor(asking: FilmAsking) {
	if ('isNoSuchPiece' in asking) return fail(VideoRefusalStatus.notFound, { videoMessage: 'This piece is no longer in the brand’s content.' });
	if ('refusal' in asking) return fail(VideoRefusalStatus.conflict, { videoMessage: `The video was not asked for: ${asking.refusal}.` });
	const { making } = asking;
	const isFailed = making.state === FilmMakingStates.failed;
	if (isFailed) return { videoMessage: `The video was asked for but could not be started: ${making.failureReason}.` };
	return { videoMessage: 'The video is asked for. This page shows where it stands.' };
}
