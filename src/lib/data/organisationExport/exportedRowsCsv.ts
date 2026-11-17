import { csvLine } from '$lib/data/csvLine';

const lineBreak = '\r\n';

/** A table's rows as CSV: a header of every column, then a line a row, empty for null, JSON for a list or object. */
export function exportedRowsCsv(rows: Record<string, unknown>[]): string {
	if (rows.length === 0) return '';
	const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))];
	const lines = [csvLine(columns), ...rows.map((row) => csvLine(columns.map((column) => cellOf(row[column]))))];
	return lines.join(lineBreak) + lineBreak;
}

function cellOf(value: unknown): string {
	if (value === null || value === undefined) return '';
	if (typeof value === 'object') return JSON.stringify(value);
	return String(value);
}
