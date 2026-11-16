import { formatBritishDate } from '$lib/data/britishDate';
import { formatPoundsAndPence } from '$lib/data/books/money';
import { feeBasisLabels, type LeadQuote, type LeadQuoteLine } from '$lib/data/leadQuoteRules';

export const leadQuoteColumns = { stage: 'Stage', delivers: 'What you get', timing: 'When', fee: 'Fee' } as const;

export const leadQuoteTotalLabels = { toBuild: 'To build', eachMonth: 'Each month', dayRates: 'Day rates' } as const;

/** The fee as the lead reads it: £2,500.00 a month, with its note; or the note alone when it is not priced yet. */
export function feeWords(line: LeadQuoteLine): string {
	if (line.feeAmount === null) return line.feeNote;
	const amount = formatPoundsAndPence(line.feeAmount);
	const basis = line.feeBasis === 'fixed' ? '' : ` ${feeBasisLabels[line.feeBasis]}`;
	const note = line.feeNote === '' ? '' : ` (${line.feeNote})`;
	return `${amount}${basis}${note}`;
}

/** The line under the quote's title: its version and its dates. */
export function quoteDatesWords(quote: LeadQuote): string {
	const prepared = `Version ${quote.version}, prepared ${formatBritishDate(quote.preparedOn)}`;
	if (quote.validUntil === null) return prepared;
	return `${prepared}, stands until ${formatBritishDate(quote.validUntil)}`;
}

/** What the page says when no quote is filed: the prompt to copy for the person's Claude. */
export function noQuoteWords(companyName: string, clientId: string) {
	return {
		message: `No quote has been filed for ${companyName} yet. Ask your Claude to draft one, then say yes to file it.`,
		prompt:
			`Draft a quote for ${companyName} (client id ${clientId}) on Your Business Today: the plan going forwards a stage ` +
			'at a time, with what each stage delivers, when, and its fee. Take every figure from the Rate card page in Your ' +
			"Business Today's own Your Business Brain or ask me; never make one up. Show me the lines, then file it with " +
			'file_lead_quote when I say yes.'
	};
}
