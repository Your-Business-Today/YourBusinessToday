import { csvRecordsInZip } from '$lib/server/csv/csvRecordsInZip';
import { readUnitPostcodePoint } from './codePointRow';
import { SectorAccumulator, type SectorCentroid } from './sectorCentroids';

export type CodePointReading = { unitPostcodes: number; centroids: SectorCentroid[] };

/** Every sector in the Code-Point Open zip, each at the mean of its unit postcodes. */
export async function readSectorCentroids(zipPath: string): Promise<CodePointReading> {
	const accumulator = new SectorAccumulator();
	let unitPostcodes = 0;
	for await (const record of csvRecordsInZip(zipPath)) {
		const point = readUnitPostcodePoint(record);
		if (point === null) continue;
		accumulator.add(point);
		unitPostcodes += 1;
	}
	return { unitPostcodes, centroids: accumulator.centroids() };
}
