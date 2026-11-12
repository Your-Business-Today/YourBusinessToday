const emailShape = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Whether the text has the shape of an email address: something, an @, and a domain with a dot. */
export function isEmailShaped(text: string): boolean {
	return emailShape.test(text);
}

/** Why the text cannot stand as an email address, or null when it has the shape of one. */
export function validateEmailAddress(fieldName: string, text: string): string | null {
	if (isEmailShaped(text)) return null;
	return `The ${fieldName} must be an email address, such as name@example.com.`;
}
