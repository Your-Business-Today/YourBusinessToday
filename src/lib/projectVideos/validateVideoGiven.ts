import { validateCaptionsFile, validateFilmFile, validateThumbnailFile } from './validateVideoFiles';
import { validateVideoDetails } from './validateVideoDetails';
import type { VideoGiven } from './projectVideo';

/** A new video as described — its words, its film, its thumbnail and its captions — each value checked against its column, or the first that does not fit. */
export function validateVideoGiven(input: Record<string, unknown>): VideoGiven | string {
	const details = validateVideoDetails(input);
	if (typeof details === 'string') return details;
	const film = validateFilmFile(input);
	if (typeof film === 'string') return film;
	const thumbnail = validateThumbnailFile(input);
	if (typeof thumbnail === 'string') return thumbnail;
	const captions = validateCaptionsFile(input);
	if (typeof captions === 'string') return captions;
	return { details, film, thumbnail, captions };
}
