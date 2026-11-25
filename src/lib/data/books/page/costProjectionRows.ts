import type { CostProjection } from '../cashflow/costProjection';

/** A project as the Cashflow tab's projection lists it: so far, and by the end of the month projected to. */
export type CostProjectionRow = { id: string; label: string; costsSoFar: number; incomeSoFar: number; costsBy: number; incomeBy: number; netBy: number };

export function costProjectionRowsOf(projections: CostProjection[]): CostProjectionRow[] {
	return projections.map((projection) => {
		const { soFar, months } = projection;
		const byTheEnd = months.at(-1) ?? soFar;
		return {
			id: projection.costCentreId,
			label: projection.label,
			costsSoFar: soFar.costs,
			incomeSoFar: soFar.income,
			costsBy: byTheEnd.costs,
			incomeBy: byTheEnd.income,
			netBy: byTheEnd.net
		};
	});
}
