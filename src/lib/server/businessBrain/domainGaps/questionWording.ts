/** A first word written as an ordinary word at the start of a sentence: a capital, then only small letters. */
const ordinaryFirstWord = /^[A-Z][a-z'’-]*$/;

const startsWithVowel = /^[aeiou]/i;

const endsWithStop = /[.?!]$/;

/** A record as a question names one of it: "a lead", "an invoice", keeping a first word that is a name or an initialism, such as "a VAT return". */
export function aNamed(title: string): string {
	const trimmed = title.trim();
	const [firstWord] = trimmed.split(' ');
	const isOrdinary = ordinaryFirstWord.test(firstWord);
	const wording = isOrdinary ? trimmed.charAt(0).toLowerCase() + trimmed.slice(1) : trimmed;
	const article = startsWithVowel.test(wording) ? 'an' : 'a';
	return `${article} ${wording}`;
}

/** A rule's title as a sentence of its own, closed with a full stop when it has none. */
export function asSentence(text: string): string {
	const trimmed = text.trim();
	return endsWithStop.test(trimmed) ? trimmed : `${trimmed}.`;
}

/** A sentence worded to follow "I assumed", without the full stop it may have been given. */
export function withoutStop(text: string): string {
	return text.trim().replace(endsWithStop, '');
}
