import type { LineMapLayout } from './lineMapLayout';
import type { LineMapModel, MapHandover } from './lineMapModel';
import { rowEnd, rowsOfFilling } from './rowFilling';
import type { LayoutSettings } from './rowLayout';
import { stackedRows } from './stackedRows';

/** A map too wide for one row, wrapped into rows that each fit, cut where least carries on, stacked down the page. */
export function wrappedLayout(model: LineMapModel, forward: MapHandover[], oneRow: LineMapLayout, settings: LayoutSettings): LineMapLayout {
	const { geometry } = settings;
	const filling = { timeline: { model, forward, columns: oneRow.columns }, settings, widestRow: geometry.widestRow };
	const lastColumn = Math.max(...Object.values(oneRow.columns));
	const cuts: number[] = [];
	for (let first = 0; first <= lastColumn; first = (cuts.at(-1) ?? lastColumn) + 1) {
		cuts.push(rowEnd(filling, first, lastColumn));
	}
	return stackedRows(rowsOfFilling(filling, cuts.slice(0, -1)));
}
