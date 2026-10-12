import { describe, expect, it } from 'vitest';
import { loadRegisterRecords } from './registerFileLoader';
import type { RegisterCompanySeed } from './registerFileRow';

const headings = ['CompanyName', 'CompanyNumber', 'RegAddress.PostCode', 'CompanyStatus'];
const rows = [
	['JEWEL BESPOKE BUILD LTD', '13752749', 'KT6 7LD', 'Active'],
	['SOMEWHERE ELSE LTD', '00000001', 'M4 1AB', 'Active'],
	['SUPPRESSED LTD', '00000002', 'KT1 1EU', 'Active'],
	['MALFORMED LTD', '00000003', 'KT1 1EU'],
	['RIVERSIDE DENTAL LTD', '00000004', 'KT1 2AA', 'Active']
];

async function* recordsOf(records: string[][]): AsyncIterable<string[]> {
	for (const record of records) yield record;
}

describe('loadRegisterRecords', () => {
	it('keeps the rows registered in a patch outcode, skips suppressed and malformed rows, and counts by outcode', async () => {
		const written: RegisterCompanySeed[] = [];
		const summary = await loadRegisterRecords(
			recordsOf([headings, ...rows]),
			{ outcodes: new Set(['KT1', 'KT6']), suppressed: new Set(['00000002']), seenMonth: '2026-10-01' },
			{ upsertCompanies: async (companies) => void written.push(...companies) }
		);
		expect(written.map((company) => company.company_number)).toEqual(['13752749', '00000004']);
		expect(summary.companiesWritten).toBe(2);
		expect(summary.malformedRows).toBe(1);
		expect(summary.suppressedRows).toBe(1);
		expect([...summary.countByOutcode.entries()]).toEqual([['KT6', 1], ['KT1', 1]]);
	});
});
