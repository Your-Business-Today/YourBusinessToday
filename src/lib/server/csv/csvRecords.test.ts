import { describe, expect, it } from 'vitest';
import { CsvRecordReader } from './csvRecords';

describe('CsvRecordReader', () => {
	it('reads plain records ending in a line feed or a carriage return and line feed', () => {
		const reader = new CsvRecordReader();
		expect(reader.push('a,b,c\r\nd,e,f\n')).toEqual([['a', 'b', 'c'], ['d', 'e', 'f']]);
		expect(reader.finish()).toEqual([]);
	});

	it('keeps commas and doubled quotes inside a quoted field', () => {
		const reader = new CsvRecordReader();
		expect(reader.push('"JEWEL BESPOKE BUILD LTD","ARGENT HOUSE, HOOK RISE","""QUOTED"" NAME"\n')).toEqual([
			['JEWEL BESPOKE BUILD LTD', 'ARGENT HOUSE, HOOK RISE', '"QUOTED" NAME']
		]);
	});

	it('carries a record across chunk boundaries and finishes the last one without a line feed', () => {
		const reader = new CsvRecordReader();
		expect(reader.push('"ARGENT HOU')).toEqual([]);
		expect(reader.push('SE",KT6 7LD\n13752')).toEqual([['ARGENT HOUSE', 'KT6 7LD']]);
		expect(reader.push('749,x')).toEqual([]);
		expect(reader.finish()).toEqual([['13752749', 'x']]);
	});
});
