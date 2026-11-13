import { describe, expect, it } from 'vitest';
import { combinedMap } from './layout/combinedMap';
import { layoutLineMap } from './layout/layoutLineMap';
import type { LineMapModel } from './layout/lineMapModel';
import { drawingOf } from './lineMapDrawing';
import { MarkKinds, markKindOf, stationDescription } from './stationMarks';
import { juneMapAfter, juneMapBefore } from './tests/juneWorkflowMap';

const juneLayout = layoutLineMap(juneMapAfter);

describe('a map drawn on its layout', () => {
	it('marks a failure where each hand-over that goes wrong joins', () => {
		const failures = drawingOf(juneMapBefore, juneLayout).branches.filter((branch) => branch.failure !== undefined);
		expect(failures.map((branch) => branch.to)).toEqual(['work-order-award', 'site-mobilisation', 'valuation-assessment']);
		expect(drawingOf(juneMapAfter, juneLayout).branches.every((branch) => branch.failure === undefined)).toBe(true);
	});

	it('dims every station but the lit ones, and knows the selected one', () => {
		const lighting = { litStationIds: ['pvr', 'cvr'], selectedStationId: 'pvr' };
		const stations = drawingOf(juneMapAfter, juneLayout, lighting).stations;
		expect(stations.filter((station) => !station.isDimmed).map((station) => station.id)).toEqual(['pvr', 'cvr']);
		expect(stations.filter((station) => station.isSelected).map((station) => station.id)).toEqual(['pvr']);
	});

	it('gives each station the mark its state and place call for', () => {
		const stations = new Map(drawingOf(juneMapAfter, juneLayout).stations.map((station) => [station.id, station]));
		const markOf = (stationId: string) => markKindOf(stations.get(stationId)!);
		expect(markOf('pvr')).toBe(MarkKinds.output);
		expect(markOf('work-order-award')).toBe(MarkKinds.arrival);
		expect(markOf('boq-take-off')).toBe(MarkKinds.ours);
		expect(markOf('retention-release')).toBe(MarkKinds.planned);
		expect(markOf('drawing-register')).toBe(MarkKinds.elsewhere);
	});
});

describe('a map drawn on a layout made with another', () => {
	const smaller: LineMapModel = { ...juneMapAfter, lines: juneMapAfter.lines.slice(0, 2), handovers: [] };
	const layout = layoutLineMap(combinedMap([juneMapAfter, smaller]));

	it('draws only its own lines, names and stations, on the shared places', () => {
		const drawing = drawingOf(smaller, layout);
		expect(drawing.runs.map((run) => run.lineId)).toEqual(['compliance', 'project-manager']);
		expect(drawing.lineNames).toHaveLength(2);
		expect(drawing.branches).toEqual([]);
		expect(drawing.stations.find((station) => station.id === 'claim-issued')?.place).toEqual(layout.places['claim-issued']);
	});
});

describe('a station that hands back to an earlier one', () => {
	const map: LineMapModel = {
		lines: [{ id: 'quotes', name: 'Quotes', colour: 'peach', stops: ['draft', 'sent'] }],
		stations: { draft: { name: 'Draft', state: 'ours' }, sent: { name: 'Sent', state: 'ours' } },
		handovers: [{ from: 'sent', to: 'draft' }]
	};

	it('is marked as going back and says so to a screen reader', () => {
		const drawing = drawingOf(map, layoutLineMap(map));
		const sent = drawing.stations.find((station) => station.id === 'sent')!;
		expect(sent.isGoingBack).toBe(true);
		expect(drawing.stations.find((station) => station.id === 'draft')?.isArrivedAt).toBe(false);
		expect(stationDescription(sent)).toBe('Sent: done in one of our products, hands back to an earlier station');
	});
});
