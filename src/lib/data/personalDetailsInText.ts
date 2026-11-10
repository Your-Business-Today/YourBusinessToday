const emailAddressInText = /[^\s@]+@[^\s@]+\.[^\s@]+/;
const numberRunInText = /\+?\d[\d\s().-]*\d/g;
const anythingButDigits = /\D/g;
const fewestPhoneDigits = 10;

export function containsEmailAddress(text: string): boolean {
	return emailAddressInText.test(text);
}

/** Whether any run of digits, with the usual spaces, brackets and dashes, is as long as a phone number. */
export function containsPhoneNumber(text: string): boolean {
	const numberRuns = text.match(numberRunInText) ?? [];
	return numberRuns.some((run) => run.replace(anythingButDigits, '').length >= fewestPhoneDigits);
}

export function containsPersonalDetails(text: string): boolean {
	return containsEmailAddress(text) || containsPhoneNumber(text);
}
