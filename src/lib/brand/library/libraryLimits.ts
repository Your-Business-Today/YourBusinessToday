const megabyte = 1024 * 1024;

/** The limits of a library item's own columns and of its bucket (migration 0184), read by every door that adds one and by the form. */
export const LibraryLimits = {
	longestFilename: 255,
	largestByteCount: 50 * megabyte,
	largestMegabytes: 50,
	showsCharacters: 500,
	permissionGiverCharacters: 120,
	earliestTakenOn: '1900-01-01',
	mostItemsListed: 200
} as const;

/** The kinds of file the library keeps, as the bucket's allowed types name them and the file picker offers them. */
export const libraryFileKinds = 'image/*,video/*';

/** Storage keeps a signed upload link open for two hours, and the grant says so. */
export const libraryUploadLinkLifetimeHours = 2;

/** A photo or video on the library page stays viewable for an hour after the page is opened. */
export const libraryViewLinkLifetimeSeconds = 60 * 60;
