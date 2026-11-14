import { accountsOutcomes, readMethods, type AccountsOutcome, type AccountsReading } from './accountsReadingRules';
import { formatBritishDate } from './britishDate';
import { formatPounds } from './filedFigures';

const withoutAType = 'filed';

/** The answer a staff member's Claude gives about a company's cash, one sentence per outcome, with the date it holds for. */
const outcomeSentences: Record<AccountsOutcome, (reading: AccountsReading) => string> = {
	[accountsOutcomes.cashStated]: (reading) =>
		`Cash at bank ${formatPounds(reading.cash ?? 0)} on ${madeUpToWords(reading)}, from its ${typeWords(reading)} accounts: the balance on that day, not today.`,
	[accountsOutcomes.cashNotStated]: (reading) => `Cash is not stated in its ${typeWords(reading)} accounts made up to ${madeUpToWords(reading)}. ${currentAssetsWords(reading)}`,
	[accountsOutcomes.dormant]: (reading) => `Dormant: its latest accounts, made up to ${madeUpToWords(reading)}, are dormant accounts.`,
	[accountsOutcomes.noAccounts]: () => 'No accounts filed yet.',
	[accountsOutcomes.pdfOnly]: (reading) =>
		`Its accounts made up to ${madeUpToWords(reading)} were filed only as a PDF, so there are no tagged figures. A person's Claude can read the balance sheet at ${reading.documentUrl}`
};

export function describeAccountsReading(reading: AccountsReading): string {
	const sentence = outcomeSentences[reading.outcome](reading);
	return [`${reading.companyNumber}: ${sentence}`, otherFiguresWords(reading), howReadWords(reading)].filter((line) => line !== '').join('\n');
}

function madeUpToWords(reading: AccountsReading): string {
	return reading.madeUpTo === null ? 'an unstated date' : formatBritishDate(reading.madeUpTo);
}

function typeWords(reading: AccountsReading): string {
	return reading.accountsType === '' ? withoutAType : reading.accountsType.replace(/-/g, ' ').replace(/^micro entity/, 'micro-entity');
}

function currentAssetsWords(reading: AccountsReading): string {
	if (reading.currentAssets === null) return 'Current assets are not stated either.';
	return `Current assets were ${formatPounds(reading.currentAssets)}, which the cash cannot exceed.`;
}

function otherFiguresWords(reading: AccountsReading): string {
	const parts = [
		reading.netAssets === null ? '' : `net assets ${formatPounds(reading.netAssets)}`,
		reading.creditors === null ? '' : `creditors ${formatPounds(Math.abs(reading.creditors))}`,
		reading.averageEmployees === null ? '' : `${reading.averageEmployees} employees`
	].filter((part) => part !== '');
	return parts.length === 0 ? '' : `Also filed: ${parts.join(' · ')}.`;
}

function howReadWords(reading: AccountsReading): string {
	if (reading.readMethod === readMethods.readByClaude) return `Read from the PDF by a staff member's Claude, on ${reading.readPage}.`;
	if (reading.readMethod === readMethods.taggedFigures) return `Read from the tagged figures: ${reading.documentUrl}`;
	return '';
}
