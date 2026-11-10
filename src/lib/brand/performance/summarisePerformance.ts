import { countedFigures, engagementFigures, type FigureCounts, type MediumPerformance } from './performanceReading';

/** The figures one reading carries, as the summary adds them up. */
export type ReadingFigures = FigureCounts & {
	mediumPath: string;
	spendPence: number;
};

export const totalMediumPath = 'total';

/** What each medium's readings add up to, the medium seen most first. */
export function summarisePerformance(readings: ReadingFigures[]): MediumPerformance[] {
	const byMedium = new Map<string, MediumPerformance>();
	for (const reading of readings) {
		const performanceSoFar = byMedium.get(reading.mediumPath) ?? emptyPerformance(reading.mediumPath);
		byMedium.set(reading.mediumPath, addFigures(performanceSoFar, reading));
	}
	return [...byMedium.values()].sort((left, right) => right.views - left.views);
}

/** Every medium's figures added together, as one line headed total. */
export function totalOf(mediums: MediumPerformance[]): MediumPerformance {
	return mediums.reduce((total, medium) => addFigures(total, medium), emptyPerformance(totalMediumPath));
}

function addFigures(performance: MediumPerformance, extra: ReadingFigures): MediumPerformance {
	const added = {
		...performance,
		spendPence: performance.spendPence + extra.spendPence
	};
	for (const figure of countedFigures) added[figure] = performance[figure] + extra[figure];
	added.engagements = engagementFigures.reduce((sum, figure) => sum + added[figure], 0);
	return added;
}

function emptyPerformance(mediumPath: string): MediumPerformance {
	const counts = Object.fromEntries(countedFigures.map((figure) => [figure, 0])) as FigureCounts;
	return { ...counts, mediumPath, spendPence: 0, engagements: 0 };
}
