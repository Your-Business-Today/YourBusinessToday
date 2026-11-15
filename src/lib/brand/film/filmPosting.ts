import { LibraryLimits } from '../library/libraryLimits';
import { PostingFootings, type PostingFooting } from '../library/libraryItem';

/** On what footing a library item may be posted, and who gave permission when someone did. */
export type PostingStanding = { posting: PostingFooting; permissionGivenBy: string | null };

const giverSeparator = ', ';

/**
 * The footing the finished video goes out on, following its clips: not to be posted if any clip is not, on the
 * permission of everyone who gave it for a clip if any did, and otherwise with nothing recognisable in it.
 */
export function filmPostingOf(clips: PostingStanding[]): PostingStanding | { problem: string } {
	const isAnyNotToBePosted = clips.some((clip) => clip.posting === PostingFootings.notToBePosted);
	if (isAnyNotToBePosted) return { posting: PostingFootings.notToBePosted, permissionGivenBy: null };
	const givers = clips.map((clip) => clip.permissionGivenBy).filter((giver): giver is string => giver !== null);
	if (givers.length === 0) return { posting: PostingFootings.nothingRecognisable, permissionGivenBy: null };
	const permissionGivenBy = [...new Set(givers)].join(giverSeparator);
	const isTooLong = permissionGivenBy.length > LibraryLimits.permissionGiverCharacters;
	if (isTooLong) return { problem: `the clips’ permissions, ${permissionGivenBy}, are more than the library’s ${LibraryLimits.permissionGiverCharacters} characters` };
	return { posting: PostingFootings.permissionGiven, permissionGivenBy };
}
