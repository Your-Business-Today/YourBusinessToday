/** On what footing a photo or video may be posted: someone gave permission, nothing private can be recognised, or not at all. */
export const PostingFootings = {
	permissionGiven: 'permission_given',
	nothingRecognisable: 'nothing_recognisable',
	notToBePosted: 'not_to_be_posted'
} as const;

export type PostingFooting = (typeof PostingFootings)[keyof typeof PostingFootings];

export const postingFootings: PostingFooting[] = Object.values(PostingFootings);

/** A photo or video as the person adding it describes it, every value checked against its column. */
export type LibraryItemGiven = {
	filename: string;
	mimeType: string;
	byteCount: number;
	shows: string;
	takenOn: string;
	posting: PostingFooting;
	permissionGivenBy: string | null;
};

/** A photo or video the brand keeps, once its file has arrived. */
export type LibraryItem = {
	id: string;
	filename: string;
	mimeType: string;
	byteCount: number;
	storagePath: string;
	shows: string;
	takenOn: string;
	posting: PostingFooting;
	permissionGivenBy: string | null;
	addedBy: string | null;
	recordedAt: string;
};

/** Whether the item may go out on the brand's channels: only when nobody said it may not. */
export function mayBePosted(item: { posting: PostingFooting }): boolean {
	return item.posting !== PostingFootings.notToBePosted;
}

/** Whether the file is a video; everything else the library keeps is a photo. */
export function isVideo(item: { mimeType: string }): boolean {
	return item.mimeType.startsWith('video/');
}
