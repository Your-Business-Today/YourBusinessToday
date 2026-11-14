/** Past tenses that do not end in -ed, as the events of a business are worded. */
const irregularPastTenses = new Set([
	'begun', 'bought', 'brought', 'built', 'chosen', 'cut', 'done', 'drawn', 'found', 'given', 'held', 'kept', 'known', 'laid', 'left', 'lost',
	'made', 'met', 'paid', 'put', 'quit', 'read', 'run', 'sent', 'set', 'shown', 'sold', 'spent', 'taken', 'told', 'won', 'written', 'withdrawn'
]);

const regularPastTense = /[a-z]ed$/;

/** Whether a word reads as a past tense: signed, sent, paid. */
export function isPastTense(word: string): boolean {
	return regularPastTense.test(word) || irregularPastTenses.has(word);
}
