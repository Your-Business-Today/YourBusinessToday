import { wrapLabel } from './labelWrap';
import { LabelSpacing, type LineMapGeometry } from './lineMapGeometry';
import type { LineName, LineRun } from './lineMapLayout';
import { LabelFonts, type MeasureText } from './textMeasure';

function rightEdgeOf(run: LineRun, nameHeight: number): number {
	const isArrivedAt = run.nameEdge < run.from;
	const clearOfTheArrivingFork = Math.max(LabelSpacing.arrivingLineNameGap, nameHeight / 2 + LabelSpacing.nameForkClearance);
	return run.nameEdge - (isArrivedAt ? clearOfTheArrivingFork : LabelSpacing.lineNameGap);
}

export function placeLineNames(lineRuns: LineRun[], geometry: LineMapGeometry, measure: MeasureText): LineName[] {
	return lineRuns.map((run) => {
		const { lines, width, height } = wrapLabel(run.name, LabelFonts.line, geometry.left - LabelSpacing.lineNameInset, measure);
		const right = rightEdgeOf(run, height);
		return { lineId: run.lineId, row: run.row, lines, x: right - width, y: run.y - height / 2, width, height, right };
	});
}
