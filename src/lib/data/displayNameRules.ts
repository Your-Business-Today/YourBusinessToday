export const displayNameMaxLength = 60;

export const displayNameTooLong = `Display names are ${displayNameMaxLength} characters at most.`;

/** Why the name cannot be stored, or null when it fits its column; a blank name means the email is shown instead. */
export function validateDisplayName(displayName: string): string | null {
	if (displayName.length > displayNameMaxLength) return displayNameTooLong;
	return null;
}
