import { describe, expect, it } from 'vitest';
import { zipSync, strToU8 } from 'fflate';
import { byteSourceOf } from './byteSource';
import { readZipDirectory } from './readZipDirectory';
import { readZipEntry } from './readZipEntry';

describe('readZipDirectory and readZipEntry', () => {
	const zipped = zipSync({
		'Prod223_3456_12345678_20260331.html': strToU8('<html>accounts</html>'),
		'Prod223_3456_SC123456_20260228.xml': [strToU8('<xbrl/>'), { level: 0 }]
	});

	it('lists every member from the central directory alone', async () => {
		const entries = await readZipDirectory(byteSourceOf(zipped));
		expect(entries.map((entry) => entry.name)).toEqual(['Prod223_3456_12345678_20260331.html', 'Prod223_3456_SC123456_20260228.xml']);
	});

	it('reads one member whether deflated or stored', async () => {
		const source = byteSourceOf(zipped);
		const [deflated, stored] = await readZipDirectory(source);
		expect(new TextDecoder().decode(await readZipEntry(source, deflated))).toBe('<html>accounts</html>');
		expect(new TextDecoder().decode(await readZipEntry(source, stored))).toBe('<xbrl/>');
	});
});
