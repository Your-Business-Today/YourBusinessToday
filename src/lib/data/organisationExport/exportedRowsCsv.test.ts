import { describe, expect, it } from 'vitest';
import { exportedRowsCsv } from './exportedRowsCsv';

describe('exportedRowsCsv', () => {
	it('heads the table with every column and writes a line a row', () => {
		const rows = [
			{ id: 'a', name: 'Jewel, Ltd', notes: null },
			{ id: 'b', name: 'Said "hello"', notes: 'two\nlines' }
		];
		expect(exportedRowsCsv(rows)).toBe('id,name,notes\r\na,"Jewel, Ltd",\r\nb,"Said ""hello""","two\nlines"\r\n');
	});

	it('writes a list or an object as JSON, and numbers and flags as they are', () => {
		const rows = [{ tags: ['x', 'y'], total: 12.5, isPaid: true }];
		expect(exportedRowsCsv(rows)).toBe('tags,total,isPaid\r\n"[""x"",""y""]",12.5,true\r\n');
	});

	it('writes an empty file when the table holds nothing', () => {
		expect(exportedRowsCsv([])).toBe('');
	});
});
