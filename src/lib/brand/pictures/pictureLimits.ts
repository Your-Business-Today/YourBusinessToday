/** The limits of a post's picture columns (migration 0191), read by every door that writes them. */
export const PictureLimits = {
	neededCharacters: 500,
	expectedFromCharacters: 200
} as const;
