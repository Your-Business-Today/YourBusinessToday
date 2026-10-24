const phoneCharacters = /^\+?[\d\s().-]+$/;
const anythingButDigits = /\D/g;
const fewestDigits = 7;

/** Whether the text has the shape of a phone number: digits with the usual spaces, brackets and dashes, and at least seven of them. */
export function isPhoneShaped(text: string): boolean {
	if (!phoneCharacters.test(text)) return false;
	const digitCount = text.replace(anythingButDigits, '').length;
	return digitCount >= fewestDigits;
}
