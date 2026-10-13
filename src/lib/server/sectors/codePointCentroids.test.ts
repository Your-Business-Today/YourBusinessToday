import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { strToU8, zipSync } from 'fflate';
import { readSectorCentroids } from './codePointCentroids';

const england = 'E92000001';
const kingstonUponThames = 'E09000021';

function codePointRow(postcode: string, quality: number, eastings: number, northings: number, ward: string): string {
	return `"${postcode}",${quality},${eastings},${northings},"${england}","","","","${kingstonUponThames}","${ward}"`;
}

const rows = [
	codePointRow('KT1 1EU', 10, 517900, 169200, 'E05000400'),
	codePointRow('KT1 1AA', 10, 518100, 169400, 'E05000400'),
	codePointRow('KT2 5AA', 10, 518500, 170200, 'E05000401'),
	codePointRow('KT2 5ZZ', 90, 0, 0, 'E05000401')
];

const folder = mkdtempSync(join(tmpdir(), 'code-point-'));
const zipPath = join(folder, 'codepo_gb.zip');
writeFileSync(zipPath, zipSync({ 'Data/CSV/kt.csv': strToU8(rows.join('\n')) }));

afterAll(() => rmSync(folder, { recursive: true }));

describe('readSectorCentroids', () => {
	it('places each sector at the mean of its unit postcodes, skipping those without a position', async () => {
		const { unitPostcodes, centroids } = await readSectorCentroids(zipPath);
		expect(unitPostcodes).toBe(3);
		expect(centroids.map((centroid) => [centroid.sector, centroid.unit_postcode_count])).toEqual([
			['KT1 1', 2],
			['KT2 5', 1]
		]);
		expect(centroids[0].latitude).toBeCloseTo(51.41, 2);
	});
});
