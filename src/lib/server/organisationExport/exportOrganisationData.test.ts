import { unzipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import { exportOrganisationData } from './exportOrganisationData';
import { exportWorld, jewel } from './exportWorld.fixture';

const decoder = new TextDecoder();

describe('exportOrganisationData', () => {
	it('zips a CSV for every table, the stored files as they were, and a note saying what is where', async () => {
		const world = exportWorld();
		const finished = await exportOrganisationData(world.client, jewel, 'account-nigel');
		const files = unzipSync(world.storedParts()[0]);
		expect(Object.keys(files)).toContain('README.txt');
		expect(decoder.decode(files['data/books_invoices.csv'])).toBe('id,total\r\ninvoice-1,120\r\n');
		expect(files['files/business-brain-files/jewel/policy.pdf']).toEqual(world.storedFile);
		expect(finished.partLinks).toEqual(['https://storage.example/signed/1']);
	});

	it('leaves out an upload that never arrived, and the column that opens a filming', async () => {
		const world = exportWorld();
		await exportOrganisationData(world.client, jewel, 'account-nigel');
		const files = unzipSync(world.storedParts()[0]);
		expect(Object.keys(files).filter((path) => path.startsWith('files/'))).toEqual(['files/business-brain-files/jewel/policy.pdf']);
		expect(decoder.decode(files['data/brand_film_makings.csv'])).toBe('id\r\nfilming-1\r\n');
	});

	it('logs the export with what it carried', async () => {
		const world = exportWorld();
		const finished = await exportOrganisationData(world.client, jewel, 'account-nigel');
		const [logged] = world.loggedExports;
		expect(logged).toMatchObject({ organisation_id: jewel.id, exported_by: 'account-nigel', part_count: 1, file_count: 1 });
		expect(logged.row_count).toBe(finished.rowCount);
		expect(finished.rowCount).toBe(5);
		expect(finished.tableCount).toBeGreaterThan(80);
	});

	it('lists a file storage no longer holds, and carries on with the rest', async () => {
		const world = exportWorld({ isStoredFileMissing: true });
		const finished = await exportOrganisationData(world.client, jewel, 'account-nigel');
		const files = unzipSync(world.storedParts()[0]);
		expect(decoder.decode(files['files/missing.txt'])).toBe('files/business-brain-files/jewel/policy.pdf\n');
		expect(finished.fileCount).toBe(0);
	});

	it('removes the files of the export before, keeping only the latest', async () => {
		const world = exportWorld();
		await exportOrganisationData(world.client, jewel, 'account-nigel');
		expect(world.removedPaths).toEqual([`${jewel.id}/earlier-export/part-1.zip`]);
	});
});
