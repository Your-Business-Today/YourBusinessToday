import type { DrawnRun } from './drawnRuns';
import type { MapRow } from './layout/lineMapLayout';

const ArrowSize = { reach: 12, halfHeight: 8, gap: 2 } as const;

/** The arrowhead at the end of a line that carries on into the next row, as tube maps mark a line leaving the page. */
export function carriesOnArrowPath(run: DrawnRun): string {
	const { to: x, y } = run;
	const { reach, halfHeight, gap } = ArrowSize;
	return `M${x + gap} ${y - halfHeight}L${x + gap + reach} ${y}L${x + gap} ${y + halfHeight}Z`;
}

/** Where one row of a wrapped map ends and the next begins. */
export function rowBreaks(rows: MapRow[]): number[] {
	return rows.slice(1).map((row) => row.top);
}
