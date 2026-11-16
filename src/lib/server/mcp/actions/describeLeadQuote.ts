import { formatPoundsAndPence } from '$lib/data/books/money';
import { feeBasisLabels, type LeadQuote, type LeadQuoteLine, type LeadQuoteVersion } from '$lib/data/leadQuoteRules';
import { totalsOfQuote } from '$lib/data/leadQuoteTotals';

export const noQuoteFiled = 'No quote filed yet. File one with file_lead_quote on the person\'s yes.';

/** A quote in full for a Claude: its dates, its lines in order with their fees, its totals, its terms and its versions. */
export function describeLeadQuote(clientName: string, quote: LeadQuote, versions: LeadQuoteVersion[]): string {
	const standsUntil = quote.validUntil === null ? '' : `, stands until ${quote.validUntil}`;
	return [
		`${clientName}: ${quote.title}, version ${quote.version} of ${versions.length}, prepared ${quote.preparedOn}${standsUntil}`,
		quote.introduction === '' ? null : `Introduction: ${quote.introduction}`,
		'',
		'Lines, in order:',
		...quote.lines.map(describeLine),
		'',
		describeTotals(quote),
		quote.terms === '' ? null : `Terms: ${quote.terms}`
	]
		.filter((line) => line !== null)
		.join('\n');
}

/** The one line read_client gives about a lead's quote. */
export function describeLatestQuote(quote: LeadQuote | null): string {
	if (quote === null) return `Quote: ${noQuoteFiled}`;
	return `Quote: ${quote.title}, version ${quote.version}, prepared ${quote.preparedOn}. ${describeTotals(quote)} read_lead_quote gives it in full.`;
}

export function describeFee(line: LeadQuoteLine): string {
	const note = line.feeNote === '' ? '' : ` (${line.feeNote})`;
	if (line.feeAmount === null) return line.feeNote;
	const basis = feeBasisLabels[line.feeBasis];
	return `${formatPoundsAndPence(line.feeAmount)} ${basis}${note}`;
}

function describeLine(line: LeadQuoteLine, index: number): string {
	const parts = [line.delivers, line.timing].filter((part) => part !== '');
	const detail = parts.length === 0 ? '' : ` — ${parts.join(' — ')}`;
	return `${index + 1}. ${line.name}${detail} — ${describeFee(line)}`;
}

function describeTotals(quote: LeadQuote): string {
	const totals = totalsOfQuote(quote.lines);
	const dayRates = totals.dayRates.map((line) => `${line.name} ${describeFee(line)}`);
	const listed = dayRates.length === 0 ? '' : ` Day rates: ${dayRates.join('; ')}.`;
	return `To build: ${formatPoundsAndPence(totals.toBuild)}. Each month: ${formatPoundsAndPence(totals.eachMonth)}.${listed}`;
}
