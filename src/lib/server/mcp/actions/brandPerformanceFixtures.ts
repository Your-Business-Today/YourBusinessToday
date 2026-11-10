import { campaignId } from './brandCampaignWorld';
import { contentPieceId } from './brandContentFixtures';
import type { PerformanceReading, ReadingsToKeep } from '$lib/brand/performance/performanceReading';

/** A brand with one piece and one campaign and the readings kept on it, held in memory, for the tests of the performance actions. */
export const performanceWorld = {
	switchedOn: ['brand'] as string[],
	hasBrand: true,
	kept: [] as ReadingsToKeep[],
	held: [] as PerformanceReading[]
};

export function resetPerformanceWorld() {
	Object.assign(performanceWorld, {
		switchedOn: ['brand'],
		hasBrand: true,
		kept: [],
		held: []
	});
}

export function findRecordsKnownInWorld() {
	const pieceIds = new Set([contentPieceId]);
	return Promise.resolve({
		pieceIds,
		campaignIds: new Set([campaignId]),
		readingKeys: new Set<string>()
	});
}

export function keepReadingsInWorld(_supabase: unknown, toKeep: ReadingsToKeep) {
	performanceWorld.kept.push(toKeep);
	performanceWorld.held.push(...toKeep.readings);
	return Promise.resolve();
}

export function findReadingsInWorld(_supabase: unknown, _organisationId: string, since: string) {
	return Promise.resolve(performanceWorld.held.filter((reading) => !('observedOn' in reading) || reading.observedOn >= since));
}
