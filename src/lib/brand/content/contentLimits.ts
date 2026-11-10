/** The limits of a content piece's own columns, read by the checks at every door that writes one. */
export const ContentLimits = {
	titleCharacters: 160,
	hookCharacters: 300,
	scriptCharacters: 10000,
	captionCharacters: 2200,
	invitedActionCharacters: 40
} as const;

/** The limits of one storyboard, kept inside the piece. */
export const StoryboardLimits = {
	shots: 40,
	descriptionCharacters: 500,
	onScreenTextCharacters: 200,
	longestShotSeconds: 600
} as const;
