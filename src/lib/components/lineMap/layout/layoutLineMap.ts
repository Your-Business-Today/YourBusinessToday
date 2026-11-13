import { splitHandovers } from './handoversGoingBack';
import { defaultGeometry, type LineMapGeometry } from './lineMapGeometry';
import type { LineMapLayout } from './lineMapLayout';
import type { LineMapModel } from './lineMapModel';
import { rowLayout } from './rowLayout';
import { withoutLooseEnds } from './stationLines';
import { estimatedTextWidth, type MeasureText } from './textMeasure';
import { wrappedLayout } from './wrappedLayout';

export type LayoutOptions = { geometry?: Partial<LineMapGeometry>; measure?: MeasureText };

export function layoutLineMap(map: LineMapModel, options: LayoutOptions = {}): LineMapLayout {
	const model = withoutLooseEnds(map);
	const geometry = { ...defaultGeometry, ...options.geometry };
	const settings = { geometry, measure: options.measure ?? estimatedTextWidth };
	const { forward, goingBack } = splitHandovers(model);
	const oneRow = rowLayout(model, forward, settings);
	const isTooWide = oneRow.width > geometry.widestRow;
	const layout = isTooWide ? wrappedLayout(model, forward, oneRow, settings) : oneRow;
	return { ...layout, goingBack: goingBack.map((handover) => handover.from) };
}
