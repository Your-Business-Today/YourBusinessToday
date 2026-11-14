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

/** The music the library keeps beside its photos and videos: MP3, M4A and WAV, under each name a browser gives them. */
export const libraryMusicTypes = ['audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/wav', 'audio/x-wav'] as const;

/** The kinds of file the library keeps, as the bucket's allowed types name them (migrations 0184 and 0231). */
export const libraryAllowedTypes = ['image/*', 'video/*', ...libraryMusicTypes] as const;

/** The same kinds as the file picker offers them. */
export const libraryFileKinds = libraryAllowedTypes.join(',');

/** Storage keeps a signed upload link open for two hours, and the grant says so. */
export const libraryUploadLinkLifetimeHours = 2;

/** A photo or video on the library page stays viewable for an hour after the page is opened. */
export const libraryViewLinkLifetimeSeconds = 60 * 60;
