import { isUuid } from '$lib/data/isUuid';
import type { Medium } from '../mediums/mediumDefinition';

const videoFamily = 'video';

/** The music the piece is given, left out when not given, or null when it is taken off. */
export type MusicGiven = { music: { musicItemId?: string | null } } | { problem: string };

/** Whether the medium is one of the video family, the only pieces that carry music. */
export function isVideoMedium(medium: Pick<Medium, 'path'>): boolean {
	return medium.path === videoFamily || medium.path.startsWith(`${videoFamily}.`);
}

/** The piece's music as given: left out keeps what it has, empty takes it off, an id names a library item. */
export function checkMusicItemId(given: unknown, medium: Medium): MusicGiven {
	if (given === undefined) return { music: {} };
	if (given === null || given === '') return { music: { musicItemId: null } };
	if (typeof given !== 'string' || !isUuid(given)) return { problem: 'musicItemId is a library item’s id, as list_brand_library gives it' };
	if (!isVideoMedium(medium)) return { problem: `${medium.label} is not a video, so it carries no music` };
	return { music: { musicItemId: given } };
}
