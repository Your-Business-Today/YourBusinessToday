import { splitHandovers } from './handoversGoingBack';
import { orderLanes } from './laneOrder';
import { defaultGeometry, type LineMapGeometry } from './lineMapGeometry';
import type { LineMapLayout, LinePlacement } from './lineMapLayout';
import type { LineMapModel, MapHandover } from './lineMapModel';
import { placeLineNames } from './lineNames';
import { placeLines } from './linePlacement';
import { orderingEdges } from './orderingEdges';
import { assignColumns, type Columns } from './stationColumns';
import { placeLabels, squeezedStation } from './stationLabels';
import { stationsOnLines, withoutLooseEnds } from './stationLines';
import { estimatedTextWidth, type MeasureText } from './textMeasure';

export type LayoutOptions = { geometry?: Partial<LineMapGeometry>; measure?: MeasureText };

function settledPlacement(model: LineMapModel, forward: MapHandover[], geometry: LineMapGeometry, measure: MeasureText): LinePlacement {
	const laneOrder = orderLanes(model, forward);
	const edges = orderingEdges(model, forward, laneOrder);
	const stationIds = stationsOnLines(model);
	const floors: Columns = {};
	const placementWithFloors = () => placeLines(model, forward, { geometry, laneOrder, columns: assignColumns(stationIds, edges, floors) });
	let placement = placementWithFloors();
	for (let attempt = 0; attempt < stationIds.length; attempt += 1) {
		const squeezed = squeezedStation(model, placement, measure);
		if (squeezed === undefined) return placement;
		floors[squeezed] = placement.columns[squeezed] + 1;
		placement = placementWithFloors();
	}
	return placement;
}

export function layoutLineMap(map: LineMapModel, options: LayoutOptions = {}): LineMapLayout {
	const model = withoutLooseEnds(map);
	const geometry = { ...defaultGeometry, ...options.geometry };
	const measure = options.measure ?? estimatedTextWidth;
	const { forward, goingBack } = splitHandovers(model);
	const placement = settledPlacement(model, forward, geometry, measure);
	const lineNames = placeLineNames(placement.lineRuns, geometry, measure);
	const labels = placeLabels(model, placement, lineNames, measure);
	return { ...placement, lineNames, labels, goingBack: goingBack.map((handover) => handover.from) };
}
