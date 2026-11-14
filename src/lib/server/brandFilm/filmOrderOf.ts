import { isVideo } from '$lib/brand/library/libraryItem';
import { LibraryLimits } from '$lib/brand/library/libraryLimits';
import type { ContentPiece } from '$lib/brand/content/contentPiece';
import type { FilmOrder, FilmOrderShot } from '$lib/brand/film/filmOrder';
import type { GrantedLibraryUpload } from '$lib/server/brandLibrary/grantLibraryUpload';
import type { ViewableLibraryItem } from '$lib/server/brandLibrary/signLibraryViewLinks';

/** What the runner is told: what to film, or why there is nothing to film. */
export type RunnerOpening = { order: FilmOrder } | { problem: string };

/** What the order is made from: the piece, its files by their links, the token its page opens under, and where the video goes. */
export type FilmOrderParts = { piece: ContentPiece; items: ViewableLibraryItem[]; token: string; grant: GrantedLibraryUpload };

/** The order the runner films from, or why a clip cannot be reached; a shot of no seconds is not filmed. */
export function filmOrderOf(parts: FilmOrderParts): RunnerOpening {
	const { piece, items, token, grant } = parts;
	const itemsById = new Map(items.map((item) => [item.id, item]));
	const shownShots = piece.storyboard.filter((shot) => shot.seconds > 0);
	const shots: FilmOrderShot[] = [];
	for (const shot of shownShots) {
		const clip = shot.clipItemId === null ? undefined : itemsById.get(shot.clipItemId);
		if (clip === undefined) return { problem: `a clip of “${piece.title}” could not be reached in the library` };
		shots.push({ seconds: shot.seconds, clipUrl: clip.viewUrl as string, isVideo: isVideo(clip) });
	}
	const music = piece.musicItemId === null ? undefined : itemsById.get(piece.musicItemId);
	const order = {
		filmPagePath: `/brand-film/${token}`,
		uploadUrl: grant.uploadUrl,
		largestByteCount: LibraryLimits.largestByteCount,
		shots,
		musicUrl: music?.viewUrl ?? null
	};
	return { order };
}
