import { isVideo } from '../library/libraryItem';
import type { ContentPiece, ShotWordPlace } from '../content/contentPiece';

/** A library file the film shows or plays, by a short-lived link. */
export type FilmFile = { url: string; mimeType: string };

/** A clip as the film draws it: a video plays, a photo holds. */
export type FilmClip = { url: string; isVideo: boolean };

/** One shot as the film plays it: how long, its clip or none for a title card, and its three lines and where they sit. */
export type FilmShot = {
	seconds: number;
	overline: string;
	headline: string;
	underline: string;
	wordsAt: ShotWordPlace;
	clip: FilmClip | null;
};

/** A piece's storyboard as a film: its shots, its music and the brand's look it is drawn in. */
export type StoryboardFilm = { shots: FilmShot[]; musicUrl: string | null; look: Record<string, string> };

/** The piece's storyboard as the film it will be, each file it names reached by its link. */
export function storyboardFilmOf(piece: ContentPiece, files: Map<string, FilmFile>): StoryboardFilm {
	const shots = piece.storyboard.map((shot): FilmShot => {
		const { seconds, overline, underline, wordsAt } = shot;
		const file = shot.clipItemId === null ? undefined : files.get(shot.clipItemId);
		const clip = file === undefined ? null : { url: file.url, isVideo: isVideo(file) };
		return { seconds, overline, headline: shot.onScreenText, underline, wordsAt, clip };
	});
	const music = piece.musicItemId === null ? undefined : files.get(piece.musicItemId);
	const { brandSnapshot } = piece;
	return { shots, musicUrl: music?.url ?? null, look: brandSnapshot.variables ?? {} };
}

const brandVariablePattern = /^--brand-[a-z0-9-]+$/;
const unsafeValuePattern = /[;{}<>]/;

/** The brand's look as a style the film's stage carries: only brand variables, and only values that stay one value. */
export function filmLookStyleOf(look: Record<string, string>): string {
	const safe = Object.entries(look).filter(([name, value]) => brandVariablePattern.test(name) && !unsafeValuePattern.test(value));
	return safe.map(([name, value]) => `${name}: ${value}`).join('; ');
}
