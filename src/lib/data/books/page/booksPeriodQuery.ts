/** The days a person asked the books page for, as the address carries them; a day left blank is not asked for. */
export type AskedPeriod = { periodStart: string | null; periodEnd: string | null };

/** The days a figure's entries are listed for: from the first day, or from the start of the books, to the last. */
export type EntriesSpan = { start: string | null; end: string };

export const PeriodFieldNames = { start: 'periodStart', end: 'periodEnd' } as const;

export function askedPeriodOf(query: URLSearchParams): AskedPeriod {
	return { periodStart: askedDay(query, PeriodFieldNames.start), periodEnd: askedDay(query, PeriodFieldNames.end) };
}

/** The address's query for a span of days: the last day always, the first only when the span has one. */
export function spanQueryOf(span: EntriesSpan): string {
	const query = new URLSearchParams();
	if (span.start !== null) query.set(PeriodFieldNames.start, span.start);
	query.set(PeriodFieldNames.end, span.end);
	return query.toString();
}

function askedDay(query: URLSearchParams, fieldName: string): string | null {
	const day = query.get(fieldName)?.trim() ?? '';
	const isBlank = day.length === 0;
	return isBlank ? null : day;
}
