import { outcodeOf } from '$lib/data/postcode';
import type { UnitPostcodePoint } from './codePointRow';

/** A sector as the loader writes it: where its unit postcodes are, on average, and how many there are. */
export type SectorCentroid = {
	sector: string;
	outcode: string;
	latitude: number;
	longitude: number;
	unit_postcode_count: number;
};

type Running = { latitudeSum: number; longitudeSum: number; count: number };

/** Adds up every unit postcode by sector and hands back the mean point of each. */
export class SectorAccumulator {
	private readonly running = new Map<string, Running>();

	add(point: UnitPostcodePoint): void {
		const sum = this.running.get(point.sector) ?? { latitudeSum: 0, longitudeSum: 0, count: 0 };
		this.running.set(point.sector, {
			latitudeSum: sum.latitudeSum + point.latitude,
			longitudeSum: sum.longitudeSum + point.longitude,
			count: sum.count + 1
		});
	}

	centroids(): SectorCentroid[] {
		return [...this.running.entries()].map(([sector, sum]) => ({
			sector,
			outcode: outcodeOf(sector),
			latitude: sum.latitudeSum / sum.count,
			longitude: sum.longitudeSum / sum.count,
			unit_postcode_count: sum.count
		}));
	}
}
