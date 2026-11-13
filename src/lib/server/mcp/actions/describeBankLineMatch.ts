import { BankLineMatchKinds, type BankLineMatchKind } from '$lib/data/books/bankLineMatchRules';
import type { BankLine } from '$lib/server/books/bankLines';
import { bankLineKnownAs } from '$lib/server/books/heldBankLine';
import type { BankLineMatch } from '$lib/server/books/matchBankLine';

const kindInWords: Record<BankLineMatchKind, string> = {
	[BankLineMatchKinds.invoicePayment]: 'a payment on an invoice',
	[BankLineMatchKinds.cost]: 'a cost',
	[BankLineMatchKinds.account]: 'money to or from another account',
	[BankLineMatchKinds.existingJournal]: 'an entry already in the books'
};

/** What the line is matched to, as the listing says it: unmatched, or the kind and the journal by its description and id. */
export function describeLineMatch(line: BankLine, journalDescriptions: Map<string, string>): string {
	const journalId = line.matchedJournalId;
	if (journalId === null) return 'unmatched';
	const kind = line.matchedAs === null ? 'an entry' : kindInWords[line.matchedAs];
	const description = journalDescriptions.get(journalId);
	const named = description === undefined ? '' : ` "${description}"`;
	return `matched as ${kind},${named} journal ${journalId}`;
}

/** What matching did, in the person's terms: the line, what it was, and the journal it is tied to. */
export function describeBankLineMatch(organisationName: string, match: BankLineMatch): string {
	const posted = match.matchedAs === BankLineMatchKinds.existingJournal ? 'Nothing new was posted.' : 'It is posted on the line\'s day.';
	const opening = `Matched the line ${bankLineKnownAs(match.line)} in ${organisationName}'s books as ${match.whatItWas}.`;
	return `${opening} ${posted} Journal ${match.journalId}.`;
}
