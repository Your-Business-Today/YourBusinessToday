import { formatBritishDate } from '$lib/data/britishDate';
import { differenceOf, formatPoundsAndPence, sumMoney } from '$lib/data/books/money';
import type { BankLine } from '$lib/server/books/bankLines';
import type { BankLineDeletion } from '$lib/server/books/deleteBankLines';
import { bankLineKnownAs } from '$lib/server/books/heldBankLine';

const none = 0;
const one = 1;

/** What taking the lines out did, in the person's terms: how many, their days, the money in and out, and what was left. */
export function describeBankLineDeletion(organisationName: string, deletion: BankLineDeletion): string {
	const { deleted, matchedSinceCheck } = deletion;
	const takenOut = describeWhatWasTakenOut(organisationName, deleted);
	if (matchedSinceCheck.length === none) return takenOut;
	const named = matchedSinceCheck.map((line) => `the line ${bankLineKnownAs(line)}`).join('; ');
	return `${takenOut} Left where it is, because it was matched while the lines were being taken out: ${named}.`;
}

function describeWhatWasTakenOut(organisationName: string, deleted: BankLine[]): string {
	if (deleted.length === none) return `Took no statement lines out of ${organisationName}'s books.`;
	const afterwards = 'No entry changed, since an unmatched line posts nothing. Bringing the statement in again puts a line back.';
	return `${describeTakenOut(organisationName, deleted)} ${afterwards}`;
}

function describeTakenOut(organisationName: string, deleted: BankLine[]): string {
	const days = deleted.map((line) => line.date).sort();
	const firstDay = formatBritishDate(days[0]);
	const lastDay = formatBritishDate(days[days.length - one]);
	const between = firstDay === lastDay ? `on ${firstDay}` : `from ${firstDay} to ${lastDay}`;
	const count = deleted.length === one ? 'one statement line' : `${deleted.length} statement lines`;
	const amounts = deleted.map((line) => line.amount);
	const moneyIn = sumMoney(amounts.filter((amount) => amount > none));
	const moneyOut = differenceOf(none, sumMoney(amounts.filter((amount) => amount < none)));
	const money = `${formatPoundsAndPence(moneyIn)} in and ${formatPoundsAndPence(moneyOut)} out`;
	return `Took ${count} out of ${organisationName}'s books, ${between}: ${money}.`;
}
