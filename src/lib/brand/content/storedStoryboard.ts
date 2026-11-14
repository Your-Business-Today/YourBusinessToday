import { ShotWordPlaces, type StoryboardShot } from './contentPiece';

const unframedShot = { overline: '', underline: '', wordsAt: ShotWordPlaces.bottom, clipItemId: null };

/** A storyboard as its piece keeps it; a shot kept before shots carried a clip and three lines reads as having none. */
export function storyboardOfStored(stored: unknown): StoryboardShot[] {
	if (!Array.isArray(stored)) return [];
	return stored.map((shot) => ({ ...unframedShot, ...(shot as Partial<StoryboardShot>) }) as StoryboardShot);
}
