import './brandJewelMocks';
import { vi } from 'vitest';

vi.mock('$lib/server/organisations/getSwitchedOnModules', async () => {
	const { performanceWorld } = await import('./brandPerformanceFixtures');
	return { getSwitchedOnModules: async () => performanceWorld.switchedOn };
});
vi.mock('$lib/server/brandKits/keepBrandSummary', async () => {
	const { performanceWorld } = await import('./brandPerformanceFixtures');
	return {
		findBrandSummary: async () => (performanceWorld.hasBrand ? 'A fire door company' : null)
	};
});
vi.mock('$lib/server/brandPerformance/findBrandRecordsKnown', async () => {
	const { findRecordsKnownInWorld } = await import('./brandPerformanceFixtures');
	return { findBrandRecordsKnown: findRecordsKnownInWorld };
});
vi.mock('$lib/server/brandPerformance/keepPerformanceReadings', async () => {
	const { keepReadingsInWorld } = await import('./brandPerformanceFixtures');
	return { keepPerformanceReadings: keepReadingsInWorld };
});
vi.mock('$lib/server/brandPerformance/findReadingsSince', async () => {
	const { findReadingsInWorld } = await import('./brandPerformanceFixtures');
	return { findReadingsSince: findReadingsInWorld };
});
