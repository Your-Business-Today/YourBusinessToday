import { describe, expect, it } from 'vitest';
import { spreadsheetSafeCsv } from './spreadsheetSafeCsv';

const byteOrderMark = '﻿';

describe('spreadsheetSafeCsv', () => {
	it('quotes every cell and ends every line', () => {
		expect(spreadsheetSafeCsv([['Asked by', 'Question'], ['ann@example.com', 'Who signs off?']])).toBe(
			`${byteOrderMark}"Asked by","Question"\r\n"ann@example.com","Who signs off?"\r\n`
		);
	});

	it('doubles a quote and keeps commas and line breaks inside the cell', () => {
		expect(spreadsheetSafeCsv([['say "hi", then\nleave']])).toBe(`${byteOrderMark}"say ""hi"", then\nleave"\r\n`);
	});

	it('marks as text a cell a spreadsheet would run as a formula', () => {
		const formulas = ['=HYPERLINK("http://x")', '+1+1', '-2+3', '@SUM(A1)', '\tcmd'];
		const cells = spreadsheetSafeCsv([formulas]).slice(byteOrderMark.length).trimEnd().split(',');
		expect(cells).toEqual(['"\'=HYPERLINK(""http://x"")"', '"\'+1+1"', '"\'-2+3"', '"\'@SUM(A1)"', '"\'\tcmd"']);
	});
});
