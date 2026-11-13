import { orderLanes } from './laneOrder';
import type { LineMapGeometry } from './lineMapGeometry';
import type { LineMapLayout, LinePlacement } from './lineMapLayout';
import type { LineMapModel, MapHandover } from './lineMapModel';
import { placeLineNames } from './lineNames';
import { placeLines } from './linePlacement';
import { orderingEdges } from './orderingEdges';
import { assignColumns, type Columns } from './stationColumns';
import { placeLabels, squeezedStation } from './stationLabels';
import { stationsOnLines } from './stationLines';
import type { MeasureText } from './textMeasure';

export type LayoutSettings = { geometry: LineMapGeometry; measure: MeasureText };

function settledPlacement(model: LineMapModel, forward: MapHandover[], settings: LayoutSettings, floors: Columns): LinePlacement {
	const { geometry, measure } = settings;
	const laneOrder = orderLanes(model, forward);
	const edges = orderingEdges(model, forward, laneOrder);
	const stationIds = stationsOnLines(model);
	const raised: Columns = { ...floors };
	const placementWithFloors = () => placeLines(model, forward, { geometry, laneOrder, columns: assignColumns(stationIds, edges, raised) });
	let placement = placementWithFloors();
	for (let attempt = 0; attempt < stationIds.length; attempt += 1) {
		const squeezed = squeezedStation(model, placement, measure);
		if (squeezed === undefined) return placement;
		raised[squeezed] = placement.columns[squeezed] + 1;
		placement = placementWithFloors();
	}
	return placement;
}

/** One row of a map: every station on one timeline, as a map narrow enough to need no wrapping is drawn. */
export function rowLayout(model: LineMapModel, forward: MapHandover[], settings: LayoutSettings, floors: Columns = {}): LineMapLayout {
	const placement = settledPlacement(model, forward, settings, floors);
	const lineNames = placeLineNames(placement.lineRuns, settings.geometry, settings.measure);
	const labels = placeLabels(model, placement, lineNames, settings.measure);
	const rowOfStation = Object.fromEntries(Object.keys(placement.places).map((stationId) => [stationId, 0]));
	const rows = [{ top: 0, height: placement.height }];
	return { ...placement, lineNames, labels, goingBack: [], rows, rowOfStation };
}
