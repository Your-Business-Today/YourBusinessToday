import type { FeeBasis, LeadQuote, LeadQuoteLine } from '$lib/data/leadQuoteRules';

type LeadQuoteLineRow = {
	position: number;
	name: string;
	delivers: string;
	timing: string;
	fee_basis: FeeBasis;
	fee_amount: number | string | null;
	fee_note: string;
};

/** A quote as the database gives it, with its lines embedded. */
export type LeadQuoteRow = {
	id: string;
	version: number;
	title: string;
	introduction: string;
	terms: string;
	prepared_on: string;
	valid_until: string | null;
	filed_at: string;
	lead_quote_lines: LeadQuoteLineRow[];
};

export function parseLeadQuote(row: LeadQuoteRow): LeadQuote {
	const lines = [...row.lead_quote_lines].sort((first, second) => first.position - second.position);
	return {
		id: row.id,
		version: row.version,
		title: row.title,
		introduction: row.introduction,
		terms: row.terms,
		preparedOn: row.prepared_on,
		validUntil: row.valid_until,
		filedAt: row.filed_at,
		lines: lines.map(parseLine)
	};
}

function parseLine(row: LeadQuoteLineRow): LeadQuoteLine {
	return {
		name: row.name,
		delivers: row.delivers,
		timing: row.timing,
		feeBasis: row.fee_basis,
		feeAmount: row.fee_amount === null ? null : Number(row.fee_amount),
		feeNote: row.fee_note
	};
}
