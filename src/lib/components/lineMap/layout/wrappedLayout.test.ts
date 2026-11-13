import { describe, expect, it } from 'vitest';
import { drawingOf } from '../lineMapDrawing';
import { juneMapAfter } from '../tests/juneWorkflowMap';
import { forksThroughStations, namesUnderLines } from '../tests/mapChecks';
import { ybtMapAfter } from '../tests/ybtWorkflowMap';
import { combinedMap } from './combinedMap';
import { defaultGeometry } from './lineMapGeometry';
import { layoutLineMap } from './layoutLineMap';
import type { LineMapModel } from './lineMapModel';

const ybtLayout = layoutLineMap(ybtMapAfter);
const rowOf = (stationId: string) => ybtLayout.rowOfStation[stationId];

describe('the Your Business Today map, ten roles handing the work on', () => {
	it('wraps into rows that each fit, stacked down the page', () => {
		const { rows, width, height } = ybtLayout;
		expect(rows.length).toBeGreaterThan(1);
		expect(width).toBeLessThanOrEqual(defaultGeometry.widestRow);
		expect(height).toBe(rows.reduce((sum, row) => sum + row.height, 0));
	});

	it('keeps the work in order: a row never holds a station that comes before one in the row above', () => {
		ybtMapAfter.lines.forEach((line) => {
			const rows = line.stops.map(rowOf);
			expect(rows).toEqual([...rows].sort((first, second) => first - second));
		});
		ybtMapAfter.handovers.forEach((handover) => expect(rowOf(handover.to)).toBeGreaterThanOrEqual(rowOf(handover.from)));
	});

	it('runs no fork through a station and puts no name under a line', () => {
		expect(forksThroughStations(ybtLayout)).toEqual([]);
		expect(namesUnderLines(ybtLayout)).toEqual([]);
	});

	it('draws every hand-over, even one that arrives in a later row', () => {
		const drawing = drawingOf(ybtMapAfter, ybtLayout);
		const keys = drawing.branches.map((branch) => `${branch.from}→${branch.to}`);
		expect(keys.toSorted()).toEqual(ybtMapAfter.handovers.map((handover) => `${handover.from}→${handover.to}`).toSorted());
	});

	it('draws a line once in every row it reaches, leaving each row but its last with an arrow', () => {
		const clientRuns = drawingOf(ybtMapAfter, ybtLayout).runs.filter((run) => run.lineId === 'client');
		const firstRow = rowOf('connect-claude');
		const lastRow = rowOf('use-the-release');
		expect(clientRuns.map((run) => run.row)).toEqual(Array.from({ length: lastRow - firstRow + 1 }, (_, index) => firstRow + index));
		expect(clientRuns.map((run) => run.isLeaving)).toEqual(clientRuns.map((run) => run.row < lastRow));
	});

	it('names a line again in each row it carries on into', () => {
		const { lineNames, runs } = drawingOf(ybtMapAfter, ybtLayout);
		expect(lineNames).toHaveLength(runs.length);
	});
});

describe('a map narrow enough for one row', () => {
	it('is drawn on one row, as it always was', () => {
		const juneLayout = layoutLineMap(juneMapAfter);
		expect(juneLayout.rows).toEqual([{ top: 0, height: juneLayout.height }]);
		expect(drawingOf(juneMapAfter, juneLayout).runs.every((run) => !run.isLeaving)).toBe(true);
	});
});

describe('a Before map drawn on the rows of the Before and After together', () => {
	const before: LineMapModel = { ...ybtMapAfter, lines: ybtMapAfter.lines.slice(0, 3), handovers: ybtMapAfter.handovers.slice(0, 1) };
	const layout = layoutLineMap(combinedMap([before, ybtMapAfter]));

	it('draws only its own lines, ending each at its own last stop', () => {
		const drawing = drawingOf(before, layout);
		expect(new Set(drawing.runs.map((run) => run.lineId))).toEqual(new Set(['introducer', 'account-lead', 'director']));
		expect(drawing.runs.every((run) => !run.isLeaving)).toBe(true);
		const director = drawing.runs.find((run) => run.lineId === 'director');
		expect(director?.to).toBe(layout.places['keep-the-company-compliant'].x);
	});
});
