const emailShape = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Whether the text has the shape of an email address: something, an @, and a domain with a dot. */
export function isEmailShaped(text: string): boolean {
	return emailShape.test(text);
}
