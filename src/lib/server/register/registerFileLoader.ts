import { readRegisterCompany, type RegisterCompanySeed, type RegisterFileRow } from './registerFileRow';

export type RegisterLoadSettings = { outcodes: Set<string>; suppressed: Set<string>; seenMonth: string };

export type RegisterLoadSummary = {
	companiesWritten: number;
	countByOutcode: Map<string, number>;
	malformedRows: number;
	suppressedRows: number;
};

/** Where the loader writes: the register, in batches. */
export type RegisterWriter = { upsertCompanies: (companies: RegisterCompanySeed[]) => Promise<void> };

const companiesPerBatch = 500;

/** Reads the monthly file record by record, keeps the rows registered in a patch, and writes them in batches. */
export async function loadRegisterRecords(
	records: AsyncIterable<string[]>,
	settings: RegisterLoadSettings,
	writer: RegisterWriter
): Promise<RegisterLoadSummary> {
	const summary: RegisterLoadSummary = { companiesWritten: 0, countByOutcode: new Map(), malformedRows: 0, suppressedRows: 0 };
	let headings: string[] | null = null;
	let batch: RegisterCompanySeed[] = [];
	for await (const record of records) {
		if (headings === null) {
			headings = record.map((heading) => heading.trim());
			continue;
		}
		const company = companyIn(record, headings, settings, summary);
		if (company === null) continue;
		batch.push(company);
		if (batch.length < companiesPerBatch) continue;
		await writeBatch(writer, batch, summary);
		batch = [];
	}
	await writeBatch(writer, batch, summary);
	return summary;
}

function companyIn(
	record: string[],
	headings: string[],
	settings: RegisterLoadSettings,
	summary: RegisterLoadSummary
): RegisterCompanySeed | null {
	if (record.length !== headings.length) {
		summary.malformedRows += 1;
		return null;
	}
	const company = readRegisterCompany(rowOf(record, headings), settings.seenMonth);
	if (company === null || !settings.outcodes.has(company.outcode)) return null;
	if (settings.suppressed.has(company.company_number)) {
		summary.suppressedRows += 1;
		return null;
	}
	return company;
}

function rowOf(record: string[], headings: string[]): RegisterFileRow {
	const row: RegisterFileRow = {};
	headings.forEach((heading, index) => {
		row[heading] = record[index] ?? '';
	});
	return row;
}

async function writeBatch(writer: RegisterWriter, batch: RegisterCompanySeed[], summary: RegisterLoadSummary): Promise<void> {
	if (batch.length === 0) return;
	await writer.upsertCompanies(batch);
	summary.companiesWritten += batch.length;
	for (const company of batch) {
		summary.countByOutcode.set(company.outcode, (summary.countByOutcode.get(company.outcode) ?? 0) + 1);
	}
}
