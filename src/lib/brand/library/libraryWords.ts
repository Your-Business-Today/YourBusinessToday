import { PostingFootings, type PostingFooting } from './libraryItem';

/** Each posting footing as a person reads it, on the form and in every answer. */
export const postingFootingLabels: Record<PostingFooting, string> = {
	[PostingFootings.permissionGiven]: 'May be posted: permission was given',
	[PostingFootings.nothingRecognisable]: 'May be posted: nobody and nowhere private can be recognised',
	[PostingFootings.notToBePosted]: 'Not to be posted'
};

/** An item's footing in a sentence, naming who gave permission where someone did. */
export function describePostingFooting(item: { posting: PostingFooting; permissionGivenBy: string | null }): string {
	const label = postingFootingLabels[item.posting];
	if (item.permissionGivenBy === null) return label;
	return `${label} by ${item.permissionGivenBy}`;
}

const postingReasons: Record<PostingFooting, string> = {
	[PostingFootings.permissionGiven]: 'Permission given',
	[PostingFootings.nothingRecognisable]: 'Nobody and nowhere private can be recognised',
	[PostingFootings.notToBePosted]: 'Nobody has given permission'
};

/** Why an item may or may not be posted, naming who gave permission where someone did. */
export function postingReasonOf(item: { posting: PostingFooting; permissionGivenBy: string | null }): string {
	const reason = postingReasons[item.posting];
	if (item.permissionGivenBy === null) return reason;
	return `${reason} by ${item.permissionGivenBy}`;
}

/** Where a brand's library of photos and videos is, inside its organisation's Brand place. */
export function brandLibraryPathOf(organisationId: string): string {
	return `/organisations/${organisationId}/brand/library`;
}
